const crypto = require('crypto');

const generateReceiptNumber = () => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RCP-${timestamp.slice(-6)}-${random}`;
};

const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `INV-${timestamp.slice(-6)}-${random}`;
};

module.exports = {
  generateReceiptNumber,
  generateInvoiceNumber,
};