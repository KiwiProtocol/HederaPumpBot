# Hedera Pump Bot

Hedera Pump Bot is an innovative memecoin launchpad bot on Telegram, designed to simplify and streamline the process of launching memecoins on the Hedera blockchain. Tokens are tradeable without initial liquidity, and when the market cap reaches $69k, liquidity is instantly deployed on SaucerSwap and burned.

The bot includes a Wallet Manager, Token Factory, and Launchpad, all of which are free to use.

## Features

1. **Wallet Manager**: Enables users to create or import wallets, deposit, and check transaction history.
2. **Token Factory**: Allows users to generate basic tokens instantly on the Hedera blockchain with desired parameters like name, symbol, and supply.
3. **Launchpad**: Enables users to launch and trade memecoins instantly.

## Running the Bot Locally

To run the Hedera Pump Bot locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/kiwiprotocol/HederaPumpBot.git
   ```

2. Navigate to the project directory:

   ```bash
   cd HederaPumpBot
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root directory and add the following environment variables:

   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   MONGODB_URL=your_mongodb_connection_string
   ```

5. Start the bot:

   ```bash
   npm start
   ```

   The bot will now be running and listening for commands on Telegram.

## Dependencies

- `@hashgraph/sdk`: Hedera SDK for interacting with the Hedera network
- `telegraf`: Telegram bot framework
- `mongoose`: MongoDB object data modeling (ODM) library
- `dotenv`: Loads environment variables from a `.env` file


## License

This project is licensed under the [MIT License](LICENSE).