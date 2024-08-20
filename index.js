// index.js
const { Telegraf, Markup, session } = require('telegraf');
const { PrivateKey, AccountId } = require("@hashgraph/sdk");
const WalletModel = require('./walletModel');
const db = require('./db'); 
require("dotenv").config();
const { ethers } = require("ethers");

const { transferToken, createUserToken, createMemecoin, displayMemecoins } = require('./utils');
 




const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(session()); 
const conversationState = {};

bot.start(async (ctx) => {
  const chatId = ctx.message.chat.id;
  conversationState[chatId] = {
    step: 'initialStep',
  };

  const userId = ctx.from.id;
  const userWallet = await WalletModel.findOne({ userId });

  if (userWallet) {
    ctx.replyWithMarkdown('Welcome to Hedera Pump Bot from Kiwi Protocol!\n\nHedera Pump Bot is an innovative memecoin launchpad bot on Telegram, designed to simplify and streamline the process of launching memecoins on Hedera blockchain. Tokens are tradeable without inital liquidity, when market cap reaches $69k, liquidity is instantly deployed on SaucerSwap, and burned. It includes a Wallet manager, Token factory, and Launchpad.\n\nChoose an option:\n\n*Wallets Manager:* Enables users to create or import wallets, deposit, and check transaction history.\n\n*Launchpad:* Enables users to launch and trade memecoins instantly.\n\n*Token Factory:* It enables users to generate basic tokens instantly on Hedera blockcahin with desired parameters like name, symbol, and supply.\n\nAll our services are free!', Markup
      .keyboard([
        ['Wallets Manager', 'Launchpad'],
        ['Token Factory'],
      ])
      .oneTime()
      .resize());
  } else {
    ctx.replyWithMarkdown('Welcome to Hedera Pump Bot from Kiwi Protocol!\n\nHedera Pump Bot is an innovative memecoin launchpad bot on Telegram, designed to simplify and streamline the process of launching memecoins on Hedera blockchain. Tokens are tradeable without inital liquidity, when market cap reaches $69k, liquidity is instantly deployed on SaucerSwap, and burned. It includes a Wallet manager, Token factory, and Launchpad.\n\nChoose an option:\n\n*Wallets Manager:* Enables users to create or import wallets, deposit, and check transaction history.\n\n*Launchpad:* Enables users to launch and trade memecoins instantly.\n\n*Token Factory:* It enables users to generate basic tokens instantly on Hedera blockcahin with desired parameters like name, symbol, and supply.\n\nAll our services are free!', Markup
      .keyboard([
        ['Wallets Manager', 'Launchpad'],
        ['Token Factory'],
      ])
      .oneTime()
      .resize());
  }
});

bot.hears('Wallets Manager', async (ctx) => {
  const userId = ctx.from.id;
  const userWallet = await WalletModel.findOne({ userId });

  if (userWallet) {
    ctx.replyWithMarkdown('*You have an existing wallet. What would you like to do?*', Markup
      .keyboard([
        ['Create Wallet', 'Import Wallet'],
        ['Deposit', 'Withdraw'],
      ])
      .oneTime()
      .resize());
  } else {
    ctx.replyWithMarkdown('*You do not have an existing wallet. Create or Import Wallet.*', Markup
      .keyboard([
        ['Create Wallet', 'Import Wallet'],
        ['Deposit', 'Withdraw'],
      ])
      .oneTime()
      .resize());
  }
});

bot.hears('Create Wallet', async (ctx) => {
  try {  

  
  const wallet = ethers.Wallet.createRandom();
  const evmAddress = wallet.address;
 
  const privateKey = wallet.privateKey;

const accountId = AccountId.fromEvmAddress(0, 0, evmAddress);




const operatorKey = PrivateKey.fromStringECDSA(privateKey);

const publicKey = operatorKey.publicKey

const mypublicKey = publicKey.toString()


    

    const newWallet = new WalletModel({
      userId: ctx.from.id,
      accountId: accountId.toString(),
      privateKey: operatorKey,
    });

    await newWallet.save();

    ctx.replyWithMarkdown(`*Your new wallet has been created!* \n\n*Account ID:* \`${accountId}\`\n*Public Key:* \`${mypublicKey}\`\n*Private Key:* \`${privateKey.toString()}\`\n\n_Save your private key somewhere offline for security reasons._`, Markup
      .keyboard([
        ['Wallets Manager', 'Launchpad'],
        ['Token Factory'],
      ])
      .oneTime()
      .resize());
  } catch (error) {
    console.error('Error creating wallet:', error);
    ctx.reply('An error occurred while creating your wallet. Please try again later.');
  }
});

bot.hears('Import Wallet', async (ctx) => {
  ctx.replyWithMarkdown('Please enter your private key to import your wallet:\n\n_Make sure the private key is in the correct format._');
});

bot.hears(/0x[a-fA-F0-9]{64}/, async (ctx) => {
  try {
    const privateKey = PrivateKey.fromStringECDSA(ctx.message.text);
    const accountId = privateKey.toAccountId(0, 0);

    const existingWallet = await WalletModel.findOne({ accountId: accountId.toString() });
    if (existingWallet) {
      console.log('This wallet is already available.');
      await ctx.reply('This wallet is already available', Markup
        .keyboard([
          ['Wallets Manager', 'Launchpad'],
          ['Token Factory'],
        ])
        .oneTime()
        .resize());
      return;
    }

    const newWallet = new WalletModel({
      userId: ctx.from.id,
      accountId: accountId.toString(),
      privateKey: privateKey.toString(),
    });

    await newWallet.save();

    ctx.replyWithMarkdown(`*Your new wallet has been imported successfully!* \n\n*Account ID:* \`${accountId}\`\n*Private Key:* \`${privateKey.toString()}\`\n\n_Save your private key somewhere offline for security reasons._`, Markup
      .keyboard([
        ['Wallets Manager', 'Launchpad'],
        ['Token Factory'],
      ])
      .oneTime()
      .resize());
  } catch (error) {
    console.error('Error importing wallet:', error);
    ctx.reply('An error occurred while importing your wallet. Please check the private key and try again.');
  }
});

bot.hears('Deposit', async (ctx) => {
  const userId = ctx.from.id;
  const userWallets = await WalletModel.find({ userId });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please create or import a wallet.');
    return;
  }

  await ctx.reply('*Please copy the receiving address, and paste it in your sending wallet or exchange.*', { parse_mode: 'Markdown' });
  userWallets.forEach((wallet) => {
    ctx.reply(`*Account ID:*\n\`${wallet.accountId}\``, { parse_mode: 'Markdown' });
  });
});

bot.hears('Withdraw', async (ctx) => {
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please create or import a wallet.');
    return;
  }

  let walletListMessage = '*Available wallets:*\n';
  userWallets.forEach((wallet, index) => {
    const shortAccountId = `${wallet.accountId.substring(0, 6)}...${wallet.accountId.substring(wallet.accountId.length - 4)}`;
    walletListMessage += `${index + 1}. Account ID: ${shortAccountId}\n`;
  });

  ctx.replyWithMarkdown(walletListMessage);

  ctx.replyWithMarkdown('Please enter the serial number of the wallet, token address, network name, token amount, and recipient address\nFor example:* 1 0x.. mainnet 500 recipientAddress*\nThe available network names are: *mainnet and testnet*\n\nIf you are withdrawing native $HBAR tokens, input *HBAR* as token address');
});

bot.hears(/^(\d+)\s+(\S+)\s+(mainnet|testnet|)\s+(\d+(\.\d+)?)\s+(\S+)$/, async (ctx) => {
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const tokenAddress = input[1];
  const networkName = input[2];
  const tokenAmount = parseFloat(input[3]);
  const recipientAddress = input[4];
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }

  const selectedWallet = userWallets[walletIndex];
  await transferToken(ctx, selectedWallet, tokenAddress, networkName, tokenAmount, recipientAddress);
});

bot.hears('Launchpad', (ctx) => {
  ctx.reply('Choose an option for Launchpad:', Markup
    .keyboard([
      ['Launch Memecoin', 'Trade Memecoins'],
    ])
    .oneTime()
    .resize()
  );
});

bot.hears('Token Factory', async (ctx) => {
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please create or import a wallet.');
    return;
  }

  let walletListMessage = '*Available wallets:*\n';
  userWallets.forEach((wallet, index) => {
    const shortAccountId = `${wallet.accountId.substring(0, 6)}...${wallet.accountId.substring(wallet.accountId.length - 4)}`;
    walletListMessage += `${index + 1}. Account ID: ${shortAccountId}\n`;
  });

  ctx.replyWithMarkdown(walletListMessage);

  ctx.replyWithMarkdown('Please enter the serial number of the wallet, name, symbol, supply, and network type of your token on Hedera blockchain in the format:\n\n_walletnumber name symbol supply networkType_\n\nFor example: *1 TokenName TokenSymbol 1000 mainnet*\n\nThe available network types are: *mainnet and testnet*\n\n');
});

bot.hears(/^(\d+)\s+(\S+)\s+(\S+)\s+(\d+)\s+(mainnet|testnet)$/, async (ctx) => {
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const tokenName = input[1];
  const tokenSymbol = input[2];
  const tokenSupply = parseInt(input[3], 10);
  const networkType = input[4];
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }

  const selectedWallet = userWallets[walletIndex];
  await createUserToken(ctx, selectedWallet, tokenName, tokenSymbol, tokenSupply, networkType);
});

bot.hears('Launch Memecoin', async (ctx) => {
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please create or import a wallet.');
    return;
  }

  let walletListMessage = '*Available wallets:*\n';
  userWallets.forEach((wallet, index) => {
    const shortAccountId = `${wallet.accountId.substring(0, 6)}...${wallet.accountId.substring(wallet.accountId.length - 4)}`;
    walletListMessage += `${index + 1}. Account ID: ${shortAccountId}\n`;
  });

  ctx.replyWithMarkdown(walletListMessage);

  ctx.replyWithMarkdown('Please enter the serial number of the wallet, network type, coin name, coin symbol, supply, image uri, social url, and website url in the format:\n\n_walletnumber testnet name symbol supply www.corememe/png t.me/corememe www.corememe.com_\n\nAvailable network types are *mainnet and testnet*');
});

bot.hears(/^(\d+)\s+(mainnet|testnet)\s+(\S+)\s+(\S+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)$/, async (ctx) => {
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const networkType = input[1];
  const tokenName = input[2];
  const tokenSymbol = input[3];
  const tokenSupply = parseInt(input[4], 10);
  const imageUrl = input[5];
  const socialUrl = input[6];
  const websiteUrl = input[7];
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }

  const selectedWallet = userWallets[walletIndex];
  await createMemecoin(ctx, selectedWallet, networkType, tokenName, tokenSymbol, tokenSupply, imageUrl, socialUrl, websiteUrl);
});

bot.hears('Trade Memecoins', async (ctx) => {
  await displayMemecoins(ctx);
});

bot.launch({ handleUpdates: true });