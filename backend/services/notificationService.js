const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@globaleducation.com',
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendInquiryConfirmation(studentEmail, studentName, inquiryDetails) {
    const subject = 'Inquiry Submitted Successfully - Global Education';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Global Education</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Study Abroad Journey Starts Here</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${studentName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for submitting your study abroad inquiry. We've received your application and our team is working to match you with the best consultants for your needs.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Your Inquiry Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Destination:</strong> ${inquiryDetails.country_preference}</li>
              <li><strong>Course:</strong> ${inquiryDetails.course_preference}</li>
              <li><strong>Timeline:</strong> ${inquiryDetails.timeline}</li>
              <li><strong>Budget:</strong> ₹${inquiryDetails.budget_min?.toLocaleString()} - ₹${inquiryDetails.budget_max?.toLocaleString()}</li>
            </ul>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d5a2d; margin-top: 0;">What happens next?</h3>
            <ol style="color: #2d5a2d; line-height: 1.8;">
              <li>Our team will review your inquiry within 24 hours</li>
              <li>We'll match you with verified consultants based on your preferences</li>
              <li>You'll receive contact details of matched consultants</li>
              <li>Start your study abroad journey with expert guidance!</li>
            </ol>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, feel free to contact us at 
            <a href="mailto:support@globaleducation.com" style="color: #667eea;">support@globaleducation.com</a>
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/student/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Your Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Global Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">
            <a href="${process.env.FRONTEND_URL}/privacy-policy" style="color: #ccc;">Privacy Policy</a> | 
            <a href="${process.env.FRONTEND_URL}/terms-of-service" style="color: #ccc;">Terms of Service</a>
          </p>
        </div>
      </div>
    `;

    const text = `
      Hello ${studentName}!
      
      Thank you for submitting your study abroad inquiry. We've received your application and our team is working to match you with the best consultants for your needs.
      
      Your Inquiry Details:
      - Destination: ${inquiryDetails.country_preference}
      - Course: ${inquiryDetails.course_preference}
      - Timeline: ${inquiryDetails.timeline}
      - Budget: ₹${inquiryDetails.budget_min?.toLocaleString()} - ₹${inquiryDetails.budget_max?.toLocaleString()}
      
      What happens next?
      1. Our team will review your inquiry within 24 hours
      2. We'll match you with verified consultants based on your preferences
      3. You'll receive contact details of matched consultants
      4. Start your study abroad journey with expert guidance!
      
      If you have any questions, feel free to contact us at support@globaleducation.com
      
      View your dashboard: ${process.env.FRONTEND_URL}/student/dashboard
    `;

    return await this.sendEmail(studentEmail, subject, html, text);
  }

  async sendConsultantNotification(consultantEmail, consultantName, leadDetails) {
    const subject = 'New Lead Assigned - Global Education';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Global Education</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">New Lead Assignment</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${consultantName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Great news! We've assigned a new lead to you. A student is looking for guidance with their study abroad journey and matches your expertise.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">Lead Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Student:</strong> ${leadDetails.student?.name || 'Student'}</li>
              <li><strong>Destination:</strong> ${leadDetails.country_preference}</li>
              <li><strong>Course:</strong> ${leadDetails.course_preference}</li>
              <li><strong>Timeline:</strong> ${leadDetails.timeline}</li>
              <li><strong>Budget:</strong> ₹${leadDetails.budget_min?.toLocaleString()} - ₹${leadDetails.budget_max?.toLocaleString()}</li>
              <li><strong>Contact:</strong> ${leadDetails.student?.email || 'N/A'}</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Action Required:</h3>
            <p style="color: #856404; line-height: 1.6; margin: 0;">
              Please contact the student within 24 hours to maintain your response time rating. 
              Update the lead status in your dashboard once you've made contact.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/consultant/dashboard" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Lead in Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Global Education. All rights reserved.</p>
        </div>
      </div>
    `;

    const text = `
      Hello ${consultantName}!
      
      Great news! We've assigned a new lead to you. A student is looking for guidance with their study abroad journey and matches your expertise.
      
      Lead Details:
      - Student: ${leadDetails.student?.name || 'Student'}
      - Destination: ${leadDetails.country_preference}
      - Course: ${leadDetails.course_preference}
      - Timeline: ${leadDetails.timeline}
      - Budget: ₹${leadDetails.budget_min?.toLocaleString()} - ₹${leadDetails.budget_max?.toLocaleString()}
      - Contact: ${leadDetails.student?.email || 'N/A'}
      
      Action Required:
      Please contact the student within 24 hours to maintain your response time rating. 
      Update the lead status in your dashboard once you've made contact.
      
      View lead in dashboard: ${process.env.FRONTEND_URL}/consultant/dashboard
    `;

    return await this.sendEmail(consultantEmail, subject, html, text);
  }

  async sendConsultantPendingInquiryNotification(consultantEmail, consultantName, inquiryDetails) {
    const subject = 'New Student Inquiry (Pending Approval) - Global Education';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #f43f5e 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Global Education</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">New Inquiry Request (Pending Admin Approval)</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${consultantName}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            A student has requested to work with you. The admin team is reviewing the inquiry and will confirm the assignment shortly.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <h3 style="color: #333; margin-top: 0;">Inquiry Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Student:</strong> ${inquiryDetails.student?.name || 'Student'}</li>
              <li><strong>Email:</strong> ${inquiryDetails.student?.email || 'N/A'}</li>
              <li><strong>Phone:</strong> ${inquiryDetails.student?.phone || 'N/A'}</li>
              <li><strong>Destination:</strong> ${inquiryDetails.country_preference || 'Not specified'}</li>
              <li><strong>Course:</strong> ${inquiryDetails.course_preference || 'Not specified'}</li>
              <li><strong>Timeline:</strong> ${inquiryDetails.timeline || 'Not specified'}</li>
              <li><strong>Budget:</strong> ₹${inquiryDetails.budget_min?.toLocaleString() || '0'} - ₹${inquiryDetails.budget_max?.toLocaleString() || '0'}</li>
            </ul>
            ${inquiryDetails.additional_requirements ? `<p style="color: #666; line-height: 1.6; margin-top: 15px;"><strong>Additional Requirements:</strong><br>${inquiryDetails.additional_requirements}</p>` : ''}
          </div>
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">What to expect:</h3>
            <p style="color: #856404; line-height: 1.6; margin: 0;">
              Once the admin approves this assignment, you'll receive a confirmation email and the lead will appear in your dashboard.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
      Hello ${consultantName},

      A student has requested to work with you via Global Education. Our admin team is reviewing the inquiry.

      Inquiry Details:
      - Student: ${inquiryDetails.student?.name || 'Student'}
      - Email: ${inquiryDetails.student?.email || 'N/A'}
      - Phone: ${inquiryDetails.student?.phone || 'N/A'}
      - Destination: ${inquiryDetails.country_preference || 'Not specified'}
      - Course: ${inquiryDetails.course_preference || 'Not specified'}
      - Timeline: ${inquiryDetails.timeline || 'Not specified'}
      - Budget: ₹${inquiryDetails.budget_min?.toLocaleString() || '0'} - ₹${inquiryDetails.budget_max?.toLocaleString() || '0'}

      You'll be notified once the admin approves this assignment.
    `;

    return await this.sendEmail(consultantEmail, subject, html, text);
  }

  async sendConsultantApprovalNotification(consultantEmail, consultantName, status) {
    const subject = status === 'approved' 
      ? 'Welcome to Global Education - Your Application is Approved!' 
      : 'Application Update - Global Education';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Global Education</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Consultant Portal</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${consultantName}!</h2>
          
          ${status === 'approved' ? `
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">🎉 Congratulations!</h3>
              <p style="color: #155724; line-height: 1.6; margin: 0;">
                Your application has been approved! You are now a verified consultant on our platform.
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ol style="color: #666; line-height: 1.8;">
                <li>Complete your profile setup in the consultant dashboard</li>
                <li>Upload your agency logo and banner images</li>
                <li>Set your availability and response preferences</li>
                <li>Start receiving leads from students!</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/consultant/dashboard" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
          ` : `
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">Application Update</h3>
              <p style="color: #721c24; line-height: 1.6; margin: 0;">
                Unfortunately, your application has been ${status}. Please contact our support team for more information.
              </p>
            </div>
          `}
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Global Education. All rights reserved.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(consultantEmail, subject, html, '');
  }

  async sendAdminInquiryNotification(adminEmail, adminName, inquiryDetails) {
    const subject = 'New Student Inquiry - Global Education';
    const consultantInfo = inquiryDetails.consultant_id 
      ? `<p style="color: #666; line-height: 1.6;"><strong>Assigned to Consultant ID:</strong> ${inquiryDetails.consultant_id}</p>`
      : `<p style="color: #ff6600; line-height: 1.6;"><strong>Status:</strong> Pending Assignment</p>`;
    const requestedConsultantInfo = inquiryDetails.requested_consultant_id
      ? `<p style="color: #666; line-height: 1.6;"><strong>Requested Consultant ID:</strong> ${inquiryDetails.requested_consultant_id}</p>`
      : '';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Global Education</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">New Student Inquiry</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${adminName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            A new student inquiry has been submitted and requires your attention.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Inquiry Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Inquiry ID:</strong> #${inquiryDetails.inquiry_id}</li>
              <li><strong>Student Name:</strong> ${inquiryDetails.student?.name || 'N/A'}</li>
              <li><strong>Student Email:</strong> ${inquiryDetails.student?.email || 'N/A'}</li>
              <li><strong>Student Phone:</strong> ${inquiryDetails.student?.phone || 'N/A'}</li>
              <li><strong>Destination:</strong> ${inquiryDetails.country_preference || 'Not specified'}</li>
              <li><strong>Course:</strong> ${inquiryDetails.course_preference || 'Not specified'}</li>
              <li><strong>Timeline:</strong> ${inquiryDetails.timeline || 'Not specified'}</li>
              <li><strong>Budget:</strong> ₹${inquiryDetails.budget_min?.toLocaleString() || '0'} - ₹${inquiryDetails.budget_max?.toLocaleString() || '0'}</li>
            </ul>
            ${consultantInfo}
            ${requestedConsultantInfo}
            ${inquiryDetails.additional_requirements ? `<p style="color: #666; line-height: 1.6; margin-top: 15px;"><strong>Additional Requirements:</strong><br>${inquiryDetails.additional_requirements}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Admin Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Global Education. All rights reserved.</p>
        </div>
      </div>
    `;

    const text = `
      Hello ${adminName}!
      
      A new student inquiry has been submitted and requires your attention.
      
      Inquiry Details:
      - Inquiry ID: #${inquiryDetails.inquiry_id}
      - Student Name: ${inquiryDetails.student?.name || 'N/A'}
      - Student Email: ${inquiryDetails.student?.email || 'N/A'}
      - Student Phone: ${inquiryDetails.student?.phone || 'N/A'}
      - Destination: ${inquiryDetails.country_preference || 'Not specified'}
      - Course: ${inquiryDetails.course_preference || 'Not specified'}
      - Timeline: ${inquiryDetails.timeline || 'Not specified'}
      - Budget: ₹${inquiryDetails.budget_min?.toLocaleString() || '0'} - ₹${inquiryDetails.budget_max?.toLocaleString() || '0'}
      ${inquiryDetails.consultant_id ? `- Assigned to Consultant ID: ${inquiryDetails.consultant_id}` : '- Status: Pending Assignment'}
      ${inquiryDetails.requested_consultant_id ? `- Requested Consultant ID: ${inquiryDetails.requested_consultant_id}` : ''}
      ${inquiryDetails.additional_requirements ? `- Additional Requirements: ${inquiryDetails.additional_requirements}` : ''}
      
      View in admin dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard
    `;

    return await this.sendEmail(adminEmail, subject, html, text);
  }

  async sendSMS(phoneNumber, message) {
    // This would integrate with SMS service like Twilio
    // For now, we'll just log the SMS
    console.log(`SMS to ${phoneNumber}: ${message}`);
    return { success: true, message: 'SMS logged (not sent in development)' };
  }
}

module.exports = new NotificationService();
