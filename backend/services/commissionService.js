const { Consultant, StudentInquiry, Invoice } = require('../models');
const notificationService = require('./notificationService');

class CommissionService {
  constructor() {
    this.defaultCommissionRate = 15; // 15% default commission
    this.platformFee = 5; // 5% platform fee
  }

  async calculateCommission(consultantId, month, year) {
    try {
      const consultant = await Consultant.findByPk(consultantId);
      if (!consultant) {
        throw new Error('Consultant not found');
      }

      // Get all completed leads for the consultant in the specified month/year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const completedLeads = await StudentInquiry.findAll({
        where: {
          consultant_id: consultantId,
          status: 'completed',
          completed_at: {
            [require('sequelize').Op.between]: [startDate, endDate]
          }
        }
      });

      const totalLeads = await StudentInquiry.count({
        where: {
          consultant_id: consultantId,
          created_at: {
            [require('sequelize').Op.between]: [startDate, endDate]
          }
        }
      });

      // Calculate commission based on consultant's fee structure
      let totalCommission = 0;
      const commissionRate = this.getCommissionRate(consultant);

      for (const lead of completedLeads) {
        const leadCommission = this.calculateLeadCommission(lead, consultant, commissionRate);
        totalCommission += leadCommission;
      }

      const platformFeeAmount = (totalCommission * this.platformFee) / 100;
      const netAmount = totalCommission - platformFeeAmount;

      return {
        consultant,
        totalLeads,
        completedLeads: completedLeads.length,
        commissionRate,
        totalCommission,
        platformFee: this.platformFee,
        platformFeeAmount,
        netAmount,
        period: { month, year }
      };
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw error;
    }
  }

  getCommissionRate(consultant) {
    // Commission rate can be based on consultant's performance, tier, or custom rate
    // For now, using default rate, but this can be customized
    return this.defaultCommissionRate;
  }

  calculateLeadCommission(lead, consultant, commissionRate) {
    // Calculate commission based on consultant's fee structure
    if (consultant.fee_model === 'fixed') {
      // For fixed fee, commission is a percentage of the consultant's fee
      const averageFee = (consultant.fee_min + consultant.fee_max) / 2;
      return (averageFee * commissionRate) / 100;
    } else {
      // For percentage-based fee, commission is based on student's budget
      const averageBudget = (lead.budget_min + lead.budget_max) / 2;
      const consultantFee = (averageBudget * 10) / 100; // Assume 10% of budget as consultant fee
      return (consultantFee * commissionRate) / 100;
    }
  }

  async generateInvoice(consultantId, month, year) {
    try {
      const commissionData = await this.calculateCommission(consultantId, month, year);
      
      // Check if invoice already exists
      const existingInvoice = await Invoice.findOne({
        where: {
          consultant_id: consultantId,
          month,
          year
        }
      });

      if (existingInvoice) {
        throw new Error('Invoice already exists for this period');
      }

      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber(consultantId, month, year);

      // Calculate due date (30 days from invoice generation)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await Invoice.create({
        consultant_id: consultantId,
        invoice_number: invoiceNumber,
        month,
        year,
        total_leads: commissionData.totalLeads,
        completed_leads: commissionData.completedLeads,
        commission_rate: commissionData.commissionRate,
        total_commission: commissionData.totalCommission,
        platform_fee: commissionData.platformFeeAmount,
        net_amount: commissionData.netAmount,
        due_date: dueDate,
        status: 'pending'
      });

      // Send notification to consultant
      await this.sendInvoiceNotification(commissionData.consultant, invoice);

      return invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  generateInvoiceNumber(consultantId, month, year) {
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedConsultantId = consultantId.toString().padStart(4, '0');
    return `INV-${year}${paddedMonth}-${paddedConsultantId}`;
  }

  async sendInvoiceNotification(consultant, invoice) {
    const subject = `Invoice Generated - ${invoice.invoice_number}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Global Education</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Commission Invoice</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${consultant.contact_person}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your commission invoice for ${this.getMonthName(invoice.month)} ${invoice.year} has been generated.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Invoice Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Invoice Number:</td>
                <td style="padding: 8px 0; font-weight: bold;">${invoice.invoice_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Period:</td>
                <td style="padding: 8px 0;">${this.getMonthName(invoice.month)} ${invoice.year}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total Leads:</td>
                <td style="padding: 8px 0;">${invoice.total_leads}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Completed Leads:</td>
                <td style="padding: 8px 0;">${invoice.completed_leads}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Commission Rate:</td>
                <td style="padding: 8px 0;">${invoice.commission_rate}%</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666;">Total Commission:</td>
                <td style="padding: 8px 0; font-weight: bold;">₹${invoice.total_commission.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Platform Fee:</td>
                <td style="padding: 8px 0;">₹${invoice.platform_fee.toLocaleString()}</td>
              </tr>
              <tr style="border-top: 2px solid #667eea;">
                <td style="padding: 8px 0; color: #333; font-weight: bold;">Net Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #667eea;">₹${invoice.net_amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Payment Information:</h3>
            <p style="color: #856404; line-height: 1.6; margin: 0;">
              Due Date: ${new Date(invoice.due_date).toLocaleDateString()}<br>
              Payment can be made through your consultant dashboard.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/consultant/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Invoice & Pay
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Global Education. All rights reserved.</p>
        </div>
      </div>
    `;

    return await notificationService.sendEmail(consultant.email, subject, html, '');
  }

  getMonthName(month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  async processPayment(invoiceId, paymentData) {
    try {
      const invoice = await Invoice.findByPk(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        throw new Error('Invoice already paid');
      }

      // Update invoice with payment information
      await invoice.update({
        status: 'paid',
        paid_date: new Date(),
        payment_method: paymentData.method,
        payment_reference: paymentData.reference,
        notes: paymentData.notes
      });

      // Send payment confirmation
      const consultant = await Consultant.findByPk(invoice.consultant_id);
      await this.sendPaymentConfirmation(consultant, invoice);

      return invoice;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(consultant, invoice) {
    const subject = `Payment Confirmed - ${invoice.invoice_number}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Global Education</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Payment Confirmed</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${consultant.contact_person}!</h2>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">✅ Payment Confirmed!</h3>
            <p style="color: #155724; line-height: 1.6; margin: 0;">
              Your payment for invoice ${invoice.invoice_number} has been successfully processed.
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Invoice Number:</td>
                <td style="padding: 8px 0; font-weight: bold;">${invoice.invoice_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #28a745;">₹${invoice.net_amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                <td style="padding: 8px 0;">${invoice.payment_method}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Date:</td>
                <td style="padding: 8px 0;">${new Date(invoice.paid_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Reference:</td>
                <td style="padding: 8px 0;">${invoice.payment_reference}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for your prompt payment. Your commission has been processed and will be reflected in your next payment cycle.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Global Education. All rights reserved.</p>
        </div>
      </div>
    `;

    return await notificationService.sendEmail(consultant.email, subject, html, '');
  }

  async getConsultantInvoices(consultantId, limit = 10, offset = 0) {
    try {
      const invoices = await Invoice.findAndCountAll({
        where: { consultant_id: consultantId },
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      return invoices;
    } catch (error) {
      console.error('Error fetching consultant invoices:', error);
      throw error;
    }
  }

  async getAdminInvoices(limit = 50, offset = 0, filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.month && filters.year) {
        whereClause.month = filters.month;
        whereClause.year = filters.year;
      }

      const invoices = await Invoice.findAndCountAll({
        where: whereClause,
        include: [{
          model: Consultant,
          as: 'consultant',
          attributes: ['id', 'agency_name', 'contact_person', 'email']
        }],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      return invoices;
    } catch (error) {
      console.error('Error fetching admin invoices:', error);
      throw error;
    }
  }
}

module.exports = new CommissionService();







