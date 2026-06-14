const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const {
  Conversation,
  Message,
  Student,
  Consultant
} = require('../models');

const router = express.Router();

const getParticipantFilter = (userType, userId) => {
  if (userType === 'student') {
    return { student_id: userId };
  }
  if (userType === 'consultant') {
    return { consultant_id: userId };
  }

  return null;
};

const getOppositeSenderType = (userType) => (
  userType === 'student' ? 'consultant' : 'student'
);

const ensureConversationParticipant = (conversation, userType, userId) => {
  if (userType === 'student' && conversation.student_id === userId) {
    return true;
  }

  if (userType === 'consultant' && conversation.consultant_id === userId) {
    return true;
  }

  return false;
};

// Create or fetch a conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    let studentId;
    let consultantId;

    if (userType === 'student') {
      studentId = userId;
      consultantId = parseInt(req.body.consultant_id, 10);
    } else if (userType === 'consultant') {
      consultantId = userId;
      studentId = parseInt(req.body.student_id, 10);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only students and consultants can start conversations'
      });
    }

    if (!studentId || !consultantId) {
      return res.status(400).json({
        success: false,
        message: 'Student and consultant are required to start a conversation'
      });
    }

    const student = await Student.findByPk(studentId);
    const consultant = await Consultant.findByPk(consultantId);

    if (!student || !consultant) {
      return res.status(404).json({
        success: false,
        message: 'Student or consultant not found'
      });
    }

    const [conversation] = await Conversation.findOrCreate({
      where: {
        student_id: studentId,
        consultant_id: consultantId
      }
    });

    const hydratedConversation = await Conversation.findByPk(conversation.id, {
      include: [
        { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
        { model: Consultant, as: 'consultant', attributes: ['id', 'agency_name', 'contact_person', 'email', 'phone'] }
      ]
    });

    res.json({
      success: true,
      data: { conversation: hydratedConversation }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message
    });
  }
});

// List conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const whereClause = getParticipantFilter(userType, userId);

    if (!whereClause) {
      return res.status(403).json({
        success: false,
        message: 'Only students and consultants can view conversations'
      });
    }

    const conversations = await Conversation.findAll({
      where: whereClause,
      include: [
        { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
        { model: Consultant, as: 'consultant', attributes: ['id', 'agency_name', 'contact_person', 'email', 'phone'] }
      ],
      order: [
        ['last_message_at', 'DESC'],
        ['updated_at', 'DESC']
      ]
    });

    const payload = await Promise.all(conversations.map(async (conversation) => {
      const lastMessage = await Message.findOne({
        where: { conversation_id: conversation.id },
        order: [['created_at', 'DESC']]
      });

      const unreadCount = await Message.count({
        where: {
          conversation_id: conversation.id,
          sender_type: getOppositeSenderType(userType),
          read_at: null
        }
      });

      return {
        ...conversation.get({ plain: true }),
        lastMessage,
        unreadCount
      };
    }));

    res.json({
      success: true,
      data: { conversations: payload }
    });
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const conversation = await Conversation.findByPk(req.params.id);

    if (!conversation || !ensureConversationParticipant(conversation, userType, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '25', 10), 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await Message.findAndCountAll({
      where: { conversation_id: conversation.id },
      order: [['created_at', 'ASC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        messages: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// Send a message
router.post('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const conversation = await Conversation.findByPk(req.params.id);

    if (!conversation || !ensureConversationParticipant(conversation, userType, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const content = req.body.content?.trim();
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const message = await Message.create({
      conversation_id: conversation.id,
      sender_type: userType,
      sender_id: userId,
      content,
      metadata: req.body.metadata || null
    });

    await conversation.update({ last_message_at: new Date() });

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Mark conversation messages as read
router.post('/conversations/:id/read', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const conversation = await Conversation.findByPk(req.params.id);

    if (!conversation || !ensureConversationParticipant(conversation, userType, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const updated = await Message.update(
      { read_at: new Date() },
      {
        where: {
          conversation_id: conversation.id,
          sender_type: getOppositeSenderType(userType),
          read_at: null
        }
      }
    );

    res.json({
      success: true,
      message: 'Conversation marked as read',
      data: { updated: updated[0] }
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// Notification summary
router.get('/notifications', auth, async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const conversationFilter = getParticipantFilter(userType, userId);

    if (!conversationFilter) {
      return res.status(403).json({
        success: false,
        message: 'Only students and consultants can view chat notifications'
      });
    }

    const totalUnread = await Message.count({
      include: [{
        model: Conversation,
        as: 'conversation',
        where: conversationFilter,
        attributes: []
      }],
      where: {
        sender_type: getOppositeSenderType(userType),
        read_at: null
      }
    });

    const recentUnread = await Message.findAll({
      include: [{
        model: Conversation,
        as: 'conversation',
        where: conversationFilter,
        include: [
          { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name'] },
          { model: Consultant, as: 'consultant', attributes: ['id', 'agency_name', 'contact_person'] }
        ]
      }],
      where: {
        sender_type: getOppositeSenderType(userType),
        read_at: null
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        totalUnread,
        recentUnread
      }
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat notifications',
      error: error.message
    });
  }
});

module.exports = router;



