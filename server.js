// server.js - AI Vending Machine for Arc Hackathon
// FINAL VERSION: Ready for x402 credentials
// Track: Gateway-Based Micropayments

// ===== 1. CORE DEPENDENCIES =====
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Thirdweb for x402 payments (awaiting credentials)
const { createThirdwebClient } = require('thirdweb');
const { settlePayment, facilitator } = require('thirdweb/x402');
// Circle for wallet management (awaiting credentials)
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

// ===== 2. INITIALIZE APP & ENV =====
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// ===== 3. SERVICE INITIALIZATION =====
console.log('🚀 AI Vending Machine - Arc Hackathon');
console.log('=' .repeat(50));

// 3.1 Gemini AI Service (WORKING - Your API key is set)
let geminiModel = null;
let geminiStatus = 'disconnected';
try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  geminiStatus = 'connected';
  console.log('✅ Gemini AI: Initialized (gemini-2.5-flash)');
} catch (error) {
  console.error('❌ Gemini AI: Failed -', error.message);
}

// 3.2 Thirdweb x402 Facilitator (AWAITING CREDENTIALS)
let thirdwebClient = null;
let thirdwebFacilitator = null;
let paymentStatus = 'pending_credentials';

if (process.env.THIRDWEB_SECRET_KEY && process.env.THIRDWEB_SECRET_KEY !== 'your_thirdweb_secret_key_here') {
  try {
    thirdwebClient = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });

    thirdwebFacilitator = facilitator({
      client: thirdwebClient,
      serverWalletAddress: process.env.SERVER_WALLET_ADDRESS || '0x',
      waitUntil: 'confirmed',
    });

    paymentStatus = 'ready';
    console.log('✅ x402 Payments: Facilitator Initialized');
  } catch (error) {
    paymentStatus = 'config_error';
    console.error('❌ x402 Payments: Config Error -', error.message);
  }
} else {
  console.log('⏳ x402 Payments: Awaiting THIRDWEB_SECRET_KEY in Replit Secrets');
}

// 3.3 Circle Wallets Client (AWAITING CREDENTIALS)
let circleClient = null;
let walletStatus = 'pending_credentials';

if (process.env.CIRCLE_API_KEY && process.env.CIRCLE_API_KEY !== 'your_circle_api_key_here') {
  try {
    circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });
    walletStatus = 'ready';
    console.log('✅ Circle Wallets: Client Initialized');
  } catch (error) {
    walletStatus = 'config_error';
    console.error('❌ Circle Wallets: Config Error -', error.message);
  }
} else {
  console.log('⏳ Circle Wallets: Awaiting CIRCLE_API_KEY in Replit Secrets');
}

console.log('=' .repeat(50));

// ===== 4. API ENDPOINTS =====

// 4.1 FREE ENDPOINT (Working - For testing)
app.post('/api/ask-free', async (req, res) => {
  console.log('\n📥 [FREE] Request received');

  if (!geminiModel) {
    return res.status(503).json({
      success: false,
      error: 'AI service unavailable',
      fix: 'Check GEMINI_API_KEY in Replit Secrets'
    });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({
      success: false,
      error: 'Missing "question" in request body'
    });
  }

  try {
    console.log(`   Question: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);
    const result = await geminiModel.generateContent(question);
    const answer = await result.response.text();

    console.log(`   ✅ Response: ${answer.length} characters`);

    res.json({
      success: true,
      question,
      answer,
      model: 'gemini-2.5-flash',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('   ❌ AI Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'AI processing failed',
      details: error.message
    });
  }
});

// 4.2 PAID ENDPOINT (Ready for x402 integration)
app.post('/api/ask-paid', async (req, res) => {
  console.log('\n💰 [PAID] Payment request received');

  // Track request for demo purposes
  const requestLog = {
    timestamp: new Date().toISOString(),
    hasPaymentHeader: !!req.headers['x-payment'],
    clientIp: req.ip,
    userAgent: req.headers['user-agent']?.substring(0, 50) || 'unknown'
  };
  console.log('   Request details:', requestLog);

  // Check if payment system is ready
  if (paymentStatus !== 'ready' || !thirdwebFacilitator) {
    return res.status(402).json({
      success: false,
      error: 'Payment Required',
      message: 'x402 micropayment endpoint is configured but awaiting facilitator credentials.',
      hackathon_status: 'AWAITING_CREDENTIALS',
      required_credentials: [
        'THIRDWEB_SECRET_KEY (in Replit Secrets)',
        'SERVER_WALLET_ADDRESS (from Circle Wallets)',
        'NETWORK (e.g., arc-testnet)'
      ],
      setup_complete: {
        gemini_ai: geminiStatus === 'connected',
        code_structure: 'READY',
        api_endpoint: 'LIVE'
      },
      next_step: 'Insert hackathon credentials into Replit Secrets and restart server.',
      demo_note: 'This 402 response demonstrates the correct payment-gated behavior for the hackathon.'
    });
  }

  // Extract payment header
  const paymentData = req.headers['x-payment'];

  if (!paymentData) {
    return res.status(402).json({
      success: false,
      error: 'Payment Required',
      message: 'Missing x-payment header',
      hint: 'Use an x402-compatible wallet to make paid requests',
      status: 402
    });
  }

  // If we have credentials, process payment
  try {
    console.log('   Processing x402 payment...');

    const paymentResult = await settlePayment({
      resourceUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      method: 'POST',
      paymentData: paymentData,
      payTo: process.env.SERVER_WALLET_ADDRESS,
      network: process.env.NETWORK || 'arc-testnet',
      price: '$0.10',
      facilitator: thirdwebFacilitator,
      routeConfig: {
        description: 'AI Vending Machine Query - Arc Hackathon',
        maxTimeoutSeconds: 300
      }
    });

    // Payment successful - process AI request
    if (paymentResult.status === 200) {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({
          success: false,
          error: 'Missing question after payment'
        });
      }

      const aiResult = await geminiModel.generateContent(question);
      const answer = await aiResult.response.text();

      console.log(`   ✅ Paid request fulfilled. TX: ${paymentResult.transactionId?.substring(0, 20)}...`);

      return res.json({
        success: true,
        message: 'Paid request successful',
        transaction: {
          id: paymentResult.transactionId,
          status: 'confirmed',
          amount: '$0.10'
        },
        question,
        answer,
        model: 'gemini-2.5-flash',
        timestamp: new Date().toISOString()
      });
    } else {
      // Payment failed
      console.log(`   ❌ Payment rejected: ${paymentResult.status}`);
      return res.status(paymentResult.status).json(paymentResult.responseBody);
    }
  } catch (error) {
    console.error('   ❌ Payment processing error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Payment processing failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 4.3 HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    service: 'AI Vending Machine API',
    status: 'operational',
    hackathon: 'Arc Agentic Commerce Challenge',
    track: 'Gateway-Based Micropayments',
    timestamp: new Date().toISOString(),
    services: {
      gemini_ai: geminiStatus,
      x402_payments: paymentStatus,
      circle_wallets: walletStatus,
      server: 'running'
    },
    endpoints: {
      free_ai: 'POST /api/ask-free',
      paid_ai: 'POST /api/ask-paid (requires x-payment header)',
      health: 'GET /health',
      docs: 'GET /'
    },
    credentials_needed: {
      thirdweb: !process.env.THIRDWEB_SECRET_KEY || process.env.THIRDWEB_SECRET_KEY.includes('your_'),
      circle: !process.env.CIRCLE_API_KEY || process.env.CIRCLE_API_KEY.includes('your_'),
      server_wallet: !process.env.SERVER_WALLET_ADDRESS || process.env.SERVER_WALLET_ADDRESS === '0x'
    },
    note: paymentStatus === 'pending_credentials' 
      ? 'Payment system ready for hackathon credentials' 
      : 'All systems operational'
  });
});

// 4.4 HOMEPAGE
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>🤖 AI Vending Machine - Arc Hackathon</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
      header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
      h1 { margin: 0; font-size: 2.5rem; }
      .subtitle { opacity: 0.9; margin-top: 0.5rem; }
      .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0; }
      .status-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .status-card.good { border-left: 4px solid #10b981; }
      .status-card.pending { border-left: 4px solid #f59e0b; }
      .endpoint { background: white; padding: 1.5rem; margin: 1rem 0; border-radius: 8px; border: 1px solid #e5e7eb; }
      code { background: #1f2937; color: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: 'Courier New', monospace; }
      .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
      .badge.success { background: #d1fae5; color: #065f46; }
      .badge.pending { background: #fef3c7; color: #92400e; }
      .url-box { background: #1f2937; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; word-break: break-all; margin: 1rem 0; }
      a { color: #3b82f6; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <header>
      <h1>🤖 AI Vending Machine API</h1>
      <div class="subtitle">Arc Hackathon Submission - Gateway-Based Micropayments Track</div>
    </header>

    <div class="status-grid">
      <div class="status-card ${geminiStatus === 'connected' ? 'good' : 'pending'}">
        <h3>🧠 Gemini AI</h3>
        <div class="badge ${geminiStatus === 'connected' ? 'success' : 'pending'}">${geminiStatus === 'connected' ? 'CONNECTED' : 'PENDING'}</div>
        <p>Model: gemini-2.5-flash</p>
      </div>

      <div class="status-card ${paymentStatus === 'ready' ? 'good' : 'pending'}">
        <h3>💰 x402 Payments</h3>
        <div class="badge ${paymentStatus === 'ready' ? 'success' : 'pending'}">${paymentStatus === 'ready' ? 'READY' : 'AWAITING CREDENTIALS'}</div>
        <p>${paymentStatus === 'ready' ? 'Facilitator initialized' : 'Insert THIRDWEB_SECRET_KEY in Secrets'}</p>
      </div>

      <div class="status-card ${walletStatus === 'ready' ? 'good' : 'pending'}">
        <h3>👛 Circle Wallets</h3>
        <div class="badge ${walletStatus === 'ready' ? 'success' : 'pending'}">${walletStatus === 'ready' ? 'READY' : 'AWAITING CREDENTIALS'}</div>
        <p>${walletStatus === 'ready' ? 'Client initialized' : 'Insert CIRCLE_API_KEY in Secrets'}</p>
      </div>
    </div>

    <div class="endpoint">
      <h2>✅ Free Test Endpoint</h2>
      <p><strong>POST</strong> <code>/api/ask-free</code></p>
      <p>Test the AI integration without payment. Send a JSON body with a "question" field.</p>
      <p><em>Example:</em> <code>{"question": "Explain agentic commerce"}</code></p>
    </div>

    <div class="endpoint">
      <h2>💰 Paid Endpoint (Hackathon Core)</h2>
      <p><strong>POST</strong> <code>/api/ask-paid</code></p>
      <p>Requires x402 micropayment. Current status: <strong>${paymentStatus === 'ready' ? 'Ready for payments' : 'Awaiting hackathon credentials'}</strong></p>
      <p>When credentials are added, this endpoint will verify x402 payments and return AI responses.</p>
    </div>

    <div class="endpoint">
      <h2>🔧 Developer Tools</h2>
      <p><strong>GET</strong> <code>/health</code> - System status (JSON)</p>
      <p><strong>GET</strong> <code>/</code> - This documentation page</p>
    </div>

    <div class="url-box">
      <strong>Your Live URL:</strong><br>
      ${req.protocol}://${req.get('host')}
    </div>

    <div style="margin-top: 2rem; padding: 1rem; background: #e0f2fe; border-radius: 8px;">
      <h3>🚀 Next Steps for Hackathon Submission:</h3>
      <ol>
        <li>Test <code>/api/ask-free</code> to confirm AI works</li>
        <li>Test <code>/api/ask-paid</code> - should return 402 (correct behavior)</li>
        <li>Record demo video showing both endpoints</li>
        <li>Add hackathon credentials when received</li>
        <li>Submit: GitHub repo + This URL + Video</li>
      </ol>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

// ===== 5. START SERVER =====
app.listen(PORT, () => {
  console.log(`\n📍 Server running on port ${PORT}`);
  console.log(`🌐 Public URL: Check Replit preview panel`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /              - Project homepage`);
  console.log(`   GET  /health        - Health check (JSON)`);
  console.log(`   POST /api/ask-free  - Free AI endpoint`);
  console.log(`   POST /api/ask-paid  - Paid endpoint (returns 402)`);
  console.log(`\n🔧 Current Status:`);
  console.log(`   Gemini AI: ${geminiStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`   Payments:  ${paymentStatus === 'ready' ? '✅ Ready' : '⏳ Awaiting credentials'}`);
  console.log(`   Wallets:   ${walletStatus === 'ready' ? '✅ Ready' : '⏳ Awaiting credentials'}`);
  console.log(`\n⚡ Next: Test endpoints and record demo video!`);
  console.log('=' .repeat(50));
});
