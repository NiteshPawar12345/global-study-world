const { sequelize } = require('../config/database');

// Import models
const Student = require('./Student');
const Consultant = require('./Consultant');
const StudentInquiry = require('./StudentInquiry');
const Review = require('./Review');
const Invoice = require('./Invoice');
const AdminUser = require('./AdminUser');
const Country = require('./Country');
const Course = require('./Course');
const ConsultantCountry = require('./ConsultantCountry');
const ConsultantCourse = require('./ConsultantCourse');
const Conversation = require('./Conversation');
const Message = require('./Message');

// Define associations
Student.hasMany(StudentInquiry, { foreignKey: 'student_id', as: 'inquiries' });
StudentInquiry.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Consultant.hasMany(StudentInquiry, { foreignKey: 'consultant_id', as: 'inquiries' });
StudentInquiry.belongsTo(Consultant, { foreignKey: 'consultant_id', as: 'consultant' });
Consultant.hasMany(StudentInquiry, { foreignKey: 'requested_consultant_id', as: 'requestedInquiries' });
StudentInquiry.belongsTo(Consultant, { foreignKey: 'requested_consultant_id', as: 'requestedConsultant' });

Student.hasMany(Review, { foreignKey: 'student_id', as: 'reviews' });
Review.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Consultant.hasMany(Review, { foreignKey: 'consultant_id', as: 'reviews' });
Review.belongsTo(Consultant, { foreignKey: 'consultant_id', as: 'consultant' });

Student.hasMany(Conversation, { foreignKey: 'student_id', as: 'studentConversations' });
Conversation.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Consultant.hasMany(Conversation, { foreignKey: 'consultant_id', as: 'consultantConversations' });
Conversation.belongsTo(Consultant, { foreignKey: 'consultant_id', as: 'consultant' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

StudentInquiry.hasOne(Review, { foreignKey: 'inquiry_id', as: 'review' });
Review.belongsTo(StudentInquiry, { foreignKey: 'inquiry_id', as: 'inquiry' });

Consultant.hasMany(Invoice, { foreignKey: 'consultant_id', as: 'invoices' });
Invoice.belongsTo(Consultant, { foreignKey: 'consultant_id', as: 'consultant' });

// Many-to-many associations for consultants and countries
Consultant.belongsToMany(Country, {
  through: ConsultantCountry,
  foreignKey: 'consultant_id',
  otherKey: 'country_id',
  as: 'destinationCountries'
});
Country.belongsToMany(Consultant, {
  through: ConsultantCountry,
  foreignKey: 'country_id',
  otherKey: 'consultant_id',
  as: 'consultants'
});

// Note: courses and destination_countries are now stored directly in the consultants table as JSON fields
// No need for separate associations

module.exports = {
  sequelize,
  Student,
  Consultant,
  StudentInquiry,
  Review,
  Invoice,
  AdminUser,
  Country,
  Course,
  ConsultantCountry,
  ConsultantCourse,
  Conversation,
  Message
};



