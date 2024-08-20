const { Client, TopicCreateTransaction, TopicMessageSubmitTransaction, AccountBalanceQuery, Hbar, PrivateKey } = require('@hashgraph/sdk');
const TokenModel = require('./tokenModel');
const MemecoinModel = require('./memeModel');
const TransferModel = require('./transferModel');
const { Markup } = require('telegraf');

async function transferToken(ctx, selectedWallet, tokenAddress, networkName, tokenAmount, recipientAddress) {
  try {
    const operatorKey = PrivateKey.fromString(selectedWallet.privateKey);
    const client = Client.forNetwork(networkName === 'mainnet' ? 'mainnet' : 'testnet');
    client.setOperator(selectedWallet.accountId, operatorKey);

    const transfer = await new TransferTransaction()
      .addHbarTransfer(selectedWallet.accountId, Hbar.fromTinybars(-tokenAmount * 100_000_000))
      .addHbarTransfer(recipientAddress, Hbar.fromTinybars(tokenAmount * 100_000_000))
      .execute(client);

    const receipt = await transfer.getReceipt(client);
    const transactionStatus = receipt.status;

    if (transactionStatus.successful) {
      const userID = ctx.message.chat.id;
      const newTransfer = new TransferModel({
        senderAddress: selectedWallet.userId,
        recipientAddress: recipientAddress,
        transferAmount: tokenAmount,
        networkName: networkName,
        transferHash: transfer.transactionId.toString(),
        tokenAddress: tokenAddress,
        userID: userID,
      });
      await newTransfer.save();

      ctx.reply(`"Tokens transferred successfully. Transaction ID: ${transfer.transactionId}"`);
    } else {
      ctx.reply(`An error occurred during token transfer: ${transactionStatus.toString()}. Please try again later.`);
    }
  } catch (error) {
    console.error('Error during token transfer:', error);
    ctx.reply(`An error occurred during token transfer: ${error.message}. Please try again later.`);
  }
}

async function createUserToken(ctx, selectedWallet, tokenName, tokenSymbol, tokenSupply, networkType) {
  try {

    const operatorKey = PrivateKey.fromString(selectedWallet.privateKey);
    const client = Client.forNetwork(networkType === 'mainnet' ? 'mainnet' : 'testnet');
    client.setOperator(selectedWallet.accountId, operatorKey);

    const tokenCreateTx = await new TopicCreateTransaction()
      .setTopicName(`${tokenName}-${tokenSymbol}`)
      .setAdminKey(operatorKey)
      .setSubmitKey(operatorKey)
      .setMaxTransactionFee(new Hbar(100))
      .execute(client);

    const tokenCreateReceipt = await tokenCreateTx.getReceipt(client);
    const tokenId = tokenCreateReceipt.topicId;

    const submitTx = await new TopicMessageSubmitTransaction({
      topicId: tokenId,
      message: Buffer.from(`${tokenSupply},${tokenName},${tokenSymbol}`),
    }).execute(client);

    const submitReceipt = await submitTx.getReceipt(client);

    const networkName = `Hedera ${networkType}`;
    const scanUrl = `https://hashscan.io/${networkType}/topic/${tokenId}`;

    const newToken = new TokenModel({
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      tokenAddress: tokenId.toString(),
      deployerAddress: selectedWallet.userId,
      network: networkName,
      tokenScanUrl: scanUrl,
      tokenSupply: tokenSupply,
      userID: ctx.message.chat.id,
    });

    await newToken.save();

    ctx.replyWithMarkdown(`Your Hedera token *${tokenName}* has been created on *${networkName}* network!\nToken ID: *${tokenId}*\nInitial Supply: *${tokenSupply}*\nCheck on scan: ${scanUrl}`, Markup
      .keyboard([
        ['Wallets Manager', 'Launchpad'],
        ['Token Factory'],
      ])
      .oneTime()
      .resize()
    );
  } catch (error) {
    console.error('Error while creating token:', error);
    const truncatedErrorMessage = error.message.slice(0, 100) + (error.message.length > 100 ? '...' : '');
    await ctx.reply(`An error occurred while creating token: ${truncatedErrorMessage}. Please try again later.`);
  }
}

async function createMemecoin(ctx, selectedWallet, networkType, tokenName, tokenSymbol, tokenSupply, imageUrl, socialUrl, websiteUrl) {
  try {
    // const decryptedPrivateKey = decryptPrivateKey(selectedWallet.privateKey);
    const operatorKey = PrivateKey.fromString(selectedWallet.privateKey);
    const client = Client.forNetwork(networkType === 'mainnet' ? 'mainnet' : 'testnet');
    client.setOperator(selectedWallet.accountId, operatorKey);

    const tokenCreateTx = await new TopicCreateTransaction()
      .setTopicName(`${tokenName}-${tokenSymbol}`)
      .setAdminKey(operatorKey)
      .setSubmitKey(operatorKey)
      .setMaxTransactionFee(new Hbar(100))
      .execute(client);

    const tokenCreateReceipt = await tokenCreateTx.getReceipt(client);
    const tokenId = tokenCreateReceipt.topicId;

    const submitTx = await new TopicMessageSubmitTransaction({
      topicId: tokenId,
      message: Buffer.from(`${tokenSupply},${tokenName},${tokenSymbol},${imageUrl},${socialUrl},${websiteUrl}`),
    }).execute(client);

    const submitReceipt = await submitTx.getReceipt(client);

    const networkName = `Hedera ${networkType}`;
    const scanUrl = `https://hashscan.io/${networkType}/topic/${tokenId}`;

    const newToken = new MemecoinModel({
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      tokenAddress: tokenId.toString(),
      deployerAddress: selectedWallet.userId,
      network: networkName,
      tokenScanUrl: scanUrl,
      tokenSupply: tokenSupply,
      userID: ctx.message.chat.id,
      imageUrl: imageUrl,
      socialUrl: socialUrl,
      websiteUrl: websiteUrl,
    });

    await newToken.save();

    ctx.replyWithMarkdown(`Your Memecoin *${tokenName}* has been created on *${networkName}* network!\nToken ID: *${tokenId}*\nInitial Supply: *${tokenSupply}*\nCheck on scan: ${scanUrl}`, Markup
      .keyboard([
        ['Wallets Manager', 'Trade Memecoins'],
      ])
      .oneTime()
      .resize()
    );
  } catch (error) {
    console.error('Error while creating memecoin:', error);
    const truncatedErrorMessage = error.message.slice(0, 100) + (error.message.length > 100 ? '...' : '');
    await ctx.reply(`An error occurred while creating memecoin: ${truncatedErrorMessage}. Please try again later.`);
  }
}

async function displayMemecoins(ctx) {
  try {
    const memecoins = await MemecoinModel.find({});

    if (memecoins.length === 0) {
      ctx.reply('No memecoins found.');
      return;
    }
    await ctx.replyWithMarkdown('*🚀 Available Memecoins for Trading 🚀*\n\nHere are the currently available memecoins:');

    for (const memecoin of memecoins) {
      const message = `
*${memecoin.tokenName} ($${memecoin.tokenSymbol})*

Supply: ${memecoin.tokenSupply}
Market Cap: $${memecoin.marketCap.toLocaleString()}
Volume: $${memecoin.volume.toLocaleString()}
Deployer Address: ${memecoin.deployerAddress}
Token ID: ${memecoin.tokenAddress}

[View on Explorer](${memecoin.tokenScanUrl})
`;

      await ctx.replyWithPhoto(
        { url: memecoin.imageUrl },
        {
          caption: message,
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('Buy', `buy_${memecoin.tokenAddress}`),
              Markup.button.callback('Sell', `sell_${memecoin.tokenAddress}`)
            ],
            [
              Markup.button.url('Website', memecoin.websiteUrl),
              Markup.button.url('Social', memecoin.socialUrl)
            ],
            [
              Markup.button.url('View Chart', memecoin.chartUrl)
            ]
          ])
        }
      );
    }
  } catch (error) {
    console.error('Error displaying memecoins:', error);
    ctx.reply('An error occurred while fetching memecoins. Please try again later.');
  }
}

module.exports = {
  transferToken,
  createUserToken,
  createMemecoin,
  displayMemecoins,
};