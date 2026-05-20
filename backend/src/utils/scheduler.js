const cron = require('node-cron');
const Lease = require('../models/Lease');
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const { sendRenewalReminder, sendPaymentReminder } = require('./emailService');
const logger = require('./logger');

// Send renewal reminders for leases expiring in 30 days
const sendRenewalReminders = async () => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringLeases = await Lease.find({
      endDate: { $gte: new Date(), $lte: thirtyDaysFromNow },
      status: 'active'
    }).populate('tenantId', 'name email').populate('propertyId', 'name');

    for (const lease of expiringLeases) {
      try {
        await sendRenewalReminder(
          lease.tenantId.email,
          lease.tenantId.name,
          lease.propertyId.name,
          lease.unitNumber,
          lease.endDate
        );
        logger.info(`Renewal reminder sent to ${lease.tenantId.email} for lease ${lease._id}`);
      } catch (error) {
        logger.error(`Failed to send renewal reminder for lease ${lease._id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendRenewalReminders:', error);
  }
};

// Send payment reminders for overdue payments
const sendPaymentReminders = async () => {
  try {
    const today = new Date();
    const overduePayments = await Payment.find({
      status: 'pending',
      dueDate: { $lt: today }
    }).populate({
      path: 'leaseId',
      populate: {
        path: 'propertyId',
        select: 'name'
      }
    }).populate('tenantId', 'name email');

    for (const payment of overduePayments) {
      try {
        await sendPaymentReminder(
          payment.tenantId.email,
          payment.tenantId.name,
          payment.amount,
          payment.dueDate,
          payment.leaseId.propertyId.name,
          payment.leaseId.unitNumber
        );
        logger.info(`Payment reminder sent to ${payment.tenantId.email} for payment ${payment._id}`);
      } catch (error) {
        logger.error(`Failed to send payment reminder for payment ${payment._id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in sendPaymentReminders:', error);
  }
};

// Update lease statuses for expired leases
const updateExpiredLeases = async () => {
  try {
    const today = new Date();
    const result = await Lease.updateMany(
      { endDate: { $lt: today }, status: 'active' },
      { $set: { status: 'expired' } }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Updated ${result.modifiedCount} leases to expired status`);
    }
  } catch (error) {
    logger.error('Error in updateExpiredLeases:', error);
  }
};

// Schedule jobs
const startScheduler = () => {
  // Send renewal reminders daily at 9 AM
  cron.schedule('0 9 * * *', () => {
    logger.info('Running renewal reminder job');
    sendRenewalReminders();
  });

  // Send payment reminders daily at 10 AM
  cron.schedule('0 10 * * *', () => {
    logger.info('Running payment reminder job');
    sendPaymentReminders();
  });

  // Update expired leases daily at 11 PM
  cron.schedule('0 23 * * *', () => {
    logger.info('Running expired lease update job');
    updateExpiredLeases();
  });

  logger.info('Scheduler started successfully');
};

module.exports = {
  startScheduler,
  sendRenewalReminders,
  sendPaymentReminders,
  updateExpiredLeases,
};