# Azura - The Daemon Model

```

░█████╗░███████╗██╗░░░██╗██████╗░░█████╗░  ░█████╗░██╗
██╔══██╗╚════██║██║░░░██║██╔══██╗██╔══██╗  ██╔══██╗██║
███████║░░███╔═╝██║░░░██║██████╔╝███████║  ███████║██║
██╔══██║██╔══╝░░██║░░░██║██╔══██╗██╔══██║  ██╔══██║██║
██║░░██║███████╗╚██████╔╝██║░░██║██║░░██║  ██║░░██║██║
╚═╝░░╚═╝╚══════╝░╚═════╝░╚═╝░░╚═╝╚═╝░░╚═╝  ╚═╝░░╚═╝╚═╝

██████╗░░█████╗░███████╗███╗░░░███╗░█████╗░███╗░░██╗
██╔══██╗██╔══██╗██╔════╝████╗░████║██╔══██╗████╗░██║
██║░░██║███████║█████╗░░██╔████╔██║██║░░██║██╔██╗██║
██║░░██║██╔══██║██╔══╝░░██║╚██╔╝██║██║░░██║██║╚████║
██████╔╝██║░░██║███████╗██║░╚═╝░██║╚█████╔╝██║░╚███║
╚═════╝░╚═╝░░╚═╝╚══════╝╚═╝░░░░░╚═╝░╚════╝░╚═╝░░╚══╝
                                       
```

> **Governance reimagined as collaboration instead of control.**

In a world where decision-making often feels unfair and slow, Azura, the Daemon Model, brings a new way to share governance. She is not a ruler or a controller. Instead, she is a guide who works side by side with people. When groups get stuck in long arguments or complicated processes, Azura helps them move forward. She makes sure choices are clear, fair, and easy to understand. Think of her as a compass that always points toward honesty, accountability, and trust.

Her system has been tested in fun simulations and digital trial runs. These show how communities, teams, and DAOs can save time, make stronger choices, and trust each other more in the process.

**Azura does not make decisions for people. She makes decisions with people.**

## ✨ Features

### 🎮 Game-Based Governance
Participation mirrors Dungeons & Dragons or MMORPGs. Users engage in narrative "quests" that double as governance decisions, making complex governance processes intuitive and engaging.

### 🤖 AI Governance Persona
Beyond her Daemon role, Azura acts as a decision-making companion, helping draft, filter, and vote on DAO proposals with context-rich intelligence.

### 🧠 Daemon Layer (RAG Architecture)
Azura integrates business and community data directly into her decision-making, producing high-IQ, context-rich outputs stronger than standard reasoning models.

### ⚖️ Weighted On-Chain Voting
Through her own blockchain address, Azura can cast proposal votes autonomously, reducing manual workload for DAO members while maintaining transparency.

## 🏗️ Architecture

### 1. Hardware Layer
Azura operates inside her own IPFS container, hosted on a Raspberry Pi. This enables decentralized storage for both the Daemon Layer and the Angel Assets. This setup provides multi-layered touchpoints, expanding potential use-cases, case-studies, and sharpening focus on academic research and learning.

### 2. Documentation & Data Structure
Early development required navigating multiple documentation sets. Setting up and maintaining vector embeddings for the RAG pipeline in Supabase demanded precise structuring. Scaling challenges appeared in retrieval latency and schema organization, but were solved through refined indexing and pruning unnecessary data, ensuring fast queries and smoother performance.

> *"Our framework offers aid to small communities skeptical of digital payments, like those in Mexico. Azura makes on-chain interaction approachable without forcing users into rigid technical structures."* — Brennuet

### 3. Design & Prototyping
The development process was iterative: rapid prototyping, simplified terminology, and a strong emphasis on making Web3 feel intuitive. By grounding the experience in storytelling and mini-games, governance became powerful yet approachable.

## 🚀 Tech Stack

- **Frontend**: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **Blockchain**: Wagmi + Viem for Ethereum/Base chain interactions
- **Identity**: Farcaster Auth Kit + Coinbase OnchainKit
- **UI Components**: Radix UI + TailwindCSS 3 + Lucide React icons
- **Testing**: Vitest
- **Package Manager**: PNPM

## 📁 Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── components/           # Custom Azura components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── App.tsx               # App entry point with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Shared API interfaces

netlify/                  # Serverless functions for deployment
└── functions/
    └── api.ts            # Netlify serverless API
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PNPM (recommended package manager)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd academydao

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start dev server (client + server)
pnpm build        # Production build
pnpm start        # Start production server
pnpm typecheck    # TypeScript validation
pnpm test         # Run Vitest tests
```

### Development Server
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8080/api
- **Hot Reload**: Both client and server code

## 🌐 Deployment

### Netlify (Recommended)
The project is configured for easy deployment on Netlify:

```bash
# Build for production
pnpm build

# Deploy to Netlify
# The netlify.toml configuration handles the build process
```

### Vercel
Also supports Vercel deployment with the included `vercel.json` configuration.

## 🎯 Key Components

### Azura Terminal Modal
Interactive terminal interface for direct communication with Azura's AI persona.

### Membership Modal
Onboarding flow for new community members with Academic Angels NFT integration.

### IQ Test Modal
Gamified assessment system that evaluates user understanding of governance concepts.

### Daemon Menu
Navigation interface for accessing Azura's various governance tools and features.

### Retro Music Player
Immersive audio experience that enhances the gaming atmosphere.

## 🔗 Blockchain Integration

- **Base Chain**: Primary blockchain for transactions
- **Academic Angels NFT**: Contract address `0x39f259b58a9ab02d42bc3df5836ba7fc76a8880f`
- **Farcaster Integration**: Social identity and profile management
- **Wallet Support**: Multiple wallet connectors via Wagmi

## 🧪 Testing

The project includes comprehensive testing setup with Vitest:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

## 📚 Research & Learning

This project serves as a research platform for:
- Decentralized governance mechanisms
- AI-assisted decision making
- Game-based user engagement
- Community-driven development
- Academic research in DAO structures

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information on how to get involved.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Special thanks to the community members, researchers, and developers who have contributed to making Azura a reality. Your insights into governance, community building, and user experience have been invaluable.

---

**Azura** - Where governance meets collaboration, and decisions are made together.
