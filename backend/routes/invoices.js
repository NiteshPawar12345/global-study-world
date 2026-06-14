const express = require('express');
const { Invoice, Consultant } = require('../models');
const commissionService = require('../services/commissionService');
const auth = require('../middleware/auth');

const router = express.Router();

// Get consultant's invoices
router.get('/consultant', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;

    if (userType !== 'consultant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const invoices = await commissionService.getConsultantInvoices(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        invoices: invoices.rows,
        pagination: {
          total: invoices.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(invoices.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get consultant invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invoices',
      error: error.message
    });
  }
});

// Get invoice by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [{
        model: Consultant,
        as: 'consultant',
        attributes: ['id', 'agency_name', 'contact_person', 'email']
      }]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check permissions
    if (userType === 'consultant' && invoice.consultant_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { invoice }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invoice',
      error: error.message
    });
  }
});

// Process payment for invoice
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const { id } = req.params;
    const { method, reference, notes } = req.body;

    if (userType !== 'consultant') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.consultant_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedInvoice = await commissionService.processPayment(id, {
      method,
      reference,
      notes
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: { invoice: updatedInvoice }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

// Generate invoice for consultant (Admin only)
router.post('/generate', auth, async (req, res) => {
  try {
    const { userType } = req.user;

    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { consultant_id, month, year } = req.body;

    if (!consultant_id || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Consultant ID, month, and year are required'
      });
    }

    const invoice = await commissionService.generateInvoice(consultant_id, month, year);

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: { invoice }
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
});

// Get all invoices (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const { userType } = req.user;

    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { page = 1, limit = 50, status, month, year } = req.query;
    const offset = (page - 1) * limit;

    const filters = {};
    if (status) filters.status = status;
    if (month && year) {
      filters.month = parseInt(month);
      filters.year = parseInt(year);
    }

    const invoices = await commissionService.getAdminInvoices(
      parseInt(limit),
      parseInt(offset),
      filters
    );

    res.json({
      success: true,
      data: {
        invoices: invoices.rows,
        pagination: {
          total: invoices.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(invoices.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invoices',
      error: error.message
    });
  }
});

// Calculate commission preview (Admin only)
router.post('/calculate', auth, async (req, res) => {
  try {
    const { userType } = req.user;

    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { consultant_id, month, year } = req.body;

    if (!consultant_id || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Consultant ID, month, and year are required'
      });
    }

    const commissionData = await commissionService.calculateCommission(consultant_id, month, year);

    res.json({
      success: true,
      data: commissionData
    });
  } catch (error) {
    console.error('Calculate commission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate commission',
      error: error.message
    });
  }
});

module.exports = router;







