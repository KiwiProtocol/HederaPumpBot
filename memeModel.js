// walletModel.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenName: { type: String, required: true }, // Adjust the data type as needed
  deployerAddress: { type: String, required: true },
  tokenAddress: { type: String, required: true },
  tokenSymbol: { type: String, required: true },
  tokenScanUrl: { type: String, required: true },
  tokenSupply: { type: Number, required: true },
  userID: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  socialUrl: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  marketCap: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  chartUrl: { type: String, required: true  } 
});

module.exports = mongoose.model('Memecoins', tokenSchema); 
