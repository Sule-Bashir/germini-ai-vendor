# AI Vending Machine 🤖🛒
## Autonomous API Monetization with HTTP 402 & Arc Blockchain

[![Live Demo]
https://1eb913db-bc8a-450a-806a-109d98ccf90c-00-1113j4un1ec63.picard.replit.dev
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hackathon: Agentic Commerce on Arc](https://img.shields.io/badge/hackathon-Arc%20%2B%20Circle-blue)](https://lablab.ai)

> **Hackathon Project**: Built for "Agentic Commerce on Arc" powered by Circle
> **Track**: Best Gateway-Based Micropayments Integration
> **Submission Date**: January 2026

## 🎯 Overview

The **AI Vending Machine** implements the HTTP `402 Payment Required` status code to create a machine-readable payment gateway for APIs. This enables AI agents and autonomous systems to discover, evaluate, and pay for API access programmatically using USDC on the Arc blockchain.

## ✨ Features

- **HTTP 402 Implementation**: Proper implementation of the "Payment Required" status code
- **x402 Protocol Support**: Integration with the x402 web-native payment standard
- **Arc Blockchain**: USDC payments settled on Arc with sub-second finality
- **Autonomous Access**: AI agents can complete payment flows without human intervention
- **Simple Integration**: Drop-in solution for existing Express.js APIs

## 🏗️ Architecture

```mermaid
graph LR
    A[AI Agent/Client] --> B[API Request];
    B --> C{Server};
    C -->|Payment Required| D[402 Response];
    D --> E[Client Makes Payment];
    E --> F[x402 Facilitator];
    F --> G[Arc Blockchain];
    G --> H[Payment Verification];
    H --> I[200 OK + Content];
🚀 Quick Start
Prerequisites
Node.js 16+

A Circle Developer Account

Testnet USDC (available via Arc faucet)

### 📋 **Additional Issues to Fix**

I also noticed a few other problems in your README:

1. **Duplicate Sections**: You have "Wallet" and "Facilitator" listed twice in the Technology Stack table
2. **Duplicate Lines**: You have "Commit your changes" listed twice in the Contributing section
3. **Incomplete Commands**: The clone command is cut off

Here are the specific fixes:

**For the Technology Stack table** (remove duplicates):
```markdown
| **Wallet** | Circle Developer Wallet | Programmable wallet for receipts |
| **Facilitator** | x402 Public Facilitator | Payment verification service |
| **SDK** | thirdweb | Simplified blockchain interactions |
| **Hosting** | Replit | Live demo and development |
Installation
git clone https://github.com/Sule-Bashir/germini-ai-vendor.git
cd germini-ai-vendor
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration
Configuration
Create a .env file with:

env
PORT=3000
FACILITATOR_URL=https://x402.org/facilitator
WALLET_ADDRESS=0xYourDeveloperWalletAddress
PRICE_USDC=0.10 # Price per API call in USDC
Running the Server
# Development
npm run dev

# Production
npm start
📖 Usage Examples
1. Basic API Request (Without Payment)
bash
curl https://your-api.com/data
Response:
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "message": "Payment required",
  "price": "0.10 USDC",
  "address": "0xYourWalletAddress",
  "facilitator": "https://x402.org/facilitator"
}
Making a Payment & Accessing Content
Send payment to the specified address via the x402 facilitator

Resend request with payment proof:

bash
curl -H "X-Payment-Proof: [your-payment-proof]" https://your-api.com/data
Response:
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": "Your requested data here",
  "paid": true,
  "transaction": "0xTransactionHash"
}
🛠️ Technology Stack
Component	Technology	Purpose
Backend	Express.js	API server implementation
Blockchain	Arc (EVM)	Settlement layer with USDC gas
Payment Protocol	x402	Web-native payment standard
Wallet	Circle Developer Wallet	Programmable wallet for receipts
Facilitator	x402 Public Facilitator	Payment verification service
SDK	thirdweb	Simplified blockchain interactions
Hosting	Replit Live demo and development
🔧 Integration Guide
For API Providers
Add payment middleware to your existing Express.js routes:

javascript
const { requirePayment } = require('./middleware/payment');

app.get('/premium-data', requirePayment(0.10), (req, res) => {
  res.json({ data: 'Premium content here' });
});
For AI Agent Developers
Implement payment handling in your agent:
import requests

def call_paid_api(api_url):
    response = requests.get(api_url)
    
    if response.status_code == 402:
        # Extract payment details
        payment_info = response.json()
        
        # Make payment via x402
        payment_result = make_x402_payment(
            payment_info['address'],
            payment_info['price']
        )
        
        # Retry with payment proof
        headers = {'X-Payment-Proof': payment_result.proof}
        return requests.get(api_url, headers=headers)
    
    return response
📁 Project Structure
ai-vending-machine/
├── server.js              # Main Express server with 402 implementation
├── package.json           # Dependencies and scripts
├── middleware/
│   └── payment.js         # Payment verification middleware
├── routes/
│   └── api.js             # API endpoints
├── utils/
│   └── blockchain.js      # Blockchain interaction helpers
└── examples/
    └── agent-example.py   # Example AI agent integration
🏆 Hackathon Specifics
Circle Product Feedback
Products Used:

Arc: EVM-compatible Layer-1 for settlement

USDC: Native gas token and stable value transfer

x402 Facilitator: Payment verification infrastructure

Positive Experiences:
Arc's compatibility with existing Ethereum tooling reduced learning curve

x402 protocol provided clean abstraction for payment flows

Public facilitator enabled rapid prototyping

Areas for Improvement:

More example implementations of 402 payment flows

Enhanced testnet faucet accessibility
Developer tools for testing agent payment scenarios

Impact:
This project demonstrates a practical implementation of Circle's vision for agentic commerce, showing how autonomous systems can transact value for digital services.

📈 Future Roadmap
Integrate Gemini AI for intelligent payment decision-making
Add multi-tier pricing based on request parameters

Implement usage analytics dashboard

Create SDK for popular AI agent frameworks (LangChain, LlamaIndex)

Support cross-chain payments via Circle CCTP

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👏 Acknowledgments
Circle & Arc for the amazing blockchain infrastructure

LabLab.ai for hosting the hackathon

Google DeepMind for the Gemini challenge

The x402 community for the payment protocol specification
Built with ❤️ for the Agentic Commerce on Arc Hackathon

## 📋 **How to Use These Materials**

1. **Create Your Presentation**:
   - Use Google Slides, PowerPoint, or Canva
   - Copy each slide's content into individual slides
   - Add your project's visuals (code snippets, diagrams, demo screenshots)

2. **Set Up Your GitHub Repository**:
   ```bash
   # Create a new repository on GitHub
   # Clone it locally
   git clone https://github.com/yourusername/ai-vending-machine.git
   
   # Create README.md and paste the content above
   # Add your existing server.js and other files
   
   # Commit and push
   git add .
   git commit -m "Initial commit with hackathon submission"
   git push origin main
