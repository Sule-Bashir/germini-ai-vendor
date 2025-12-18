// createServerWallet.js
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
require('dotenv').config();

async function createWallet() {
  console.log('👛 Creating your Server Wallet...\n');

  // 1. Initialize the client with your API Key and Entity Secret
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
  });

  try {
    // 2. Create a Wallet Set (a container for your wallets)
    const walletSetResponse = await client.createWalletSet({
      name: 'Hackathon Server Wallets',
    });
    const walletSetId = walletSetResponse.data.walletSet.id;
    console.log('✅ Wallet Set Created. ID:', walletSetId);

    // 3. Create a wallet on the Arc Testnet
    // NOTE: Replace "ARC-TESTNET" if the hackathon provides a different network identifier
    const walletsResponse = await client.createWallets({
      accountType: 'SCA', // Smart Contract Account (recommended)
      blockchains: ['ARC-TESTNET'], // Target network
      count: 1,
      walletSetId: walletSetId,
    });

    const serverWallet = walletsResponse.data.wallets[0];
    console.log('\n🎉 **SERVER WALLET CREATED SUCCESSFULLY!**');
    console.log('===========================================');
    console.log('Address:', serverWallet.address);
    console.log('Blockchain:', serverWallet.blockchain);
    console.log('===========================================\n');
    console.log('⚠️  **IMPORTANT:** Copy the "Address" above.');
    console.log('   Add it to Replit Secrets as: SERVER_WALLET_ADDRESS');

  } catch (error) {
    console.error('❌ Failed to create wallet:', error.message);
    console.error('   Details:', error.response?.data || error);
  }
}

createWallet();
