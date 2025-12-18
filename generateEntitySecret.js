// generateEntitySecret.js
const { generateEntitySecret, registerEntitySecretCiphertext } = require('@circle-fin/developer-controlled-wallets');
require('dotenv').config();

async function main() {
  console.log('🔐 Generating your Entity Secret...\n');

  // Step 1: Generate the secret key
  const entitySecret = generateEntitySecret();
  console.log('✅ **YOUR 64-CHARACTER ENTITY SECRET (SAVE THIS IMMEDIATELY):**');
  console.log('================================================================');
  console.log(entitySecret);
  console.log('================================================================\n');
  console.log('⚠️  **SECURITY WARNING:**');
  console.log('1. Copy the string above and paste it into Replit Secrets as `CIRCLE_ENTITY_SECRET`.');
  console.log('2. Store it in a secure, private place. You cannot recover it if lost[citation:1].');
  console.log('3. Circle does NOT store this secret[citation:1].\n');

  // Step 2: (Optional) Register it with Circle using your API Key
  const apiKey = process.env.CIRCLE_API_KEY;
  if (apiKey && !apiKey.includes('your_circle_api_key_here')) {
    console.log('🔄 Attempting to register the secret with Circle...');
    try {
      const response = await registerEntitySecretCiphertext({
        apiKey: apiKey,
        entitySecret: entitySecret
      });
      console.log('✅ Entity Secret registered successfully.');
      console.log('   Please download and securely store the recovery file from the Circle Console.');
    } catch (error) {
      console.error('❌ Registration failed. You may need to register it manually in the Circle Console.');
      console.error('   Error:', error.message);
    }
  } else {
    console.log('⏭️  Skipping automatic registration.');
    console.log('   To complete setup, you must manually register this secret in the Circle Console.');
    console.log('   Go to: Wallets -> Developer-Controlled Wallets -> Configurator');
  }
}

main().catch(console.error);
