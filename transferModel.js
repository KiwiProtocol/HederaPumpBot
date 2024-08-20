const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  senderAddress: { type: String, required: true },
  recipientAddress: { type: String, required: true },
  transferAmount: { type: String, required: true },
  networkName: { type: String, required: true },
  transferHash: { type: String, required: true },
  tokenAddress: { type: String, required: true },
  userID: { type: Number, required: true },
});

module.exports = mongoose.model('Transfers', transferSchema);