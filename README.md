<div align="center">
  <h1>🧠 Engram</h1>
  <p><b>Your Personalized AI Companion, Shaped by Your Thoughts</b></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
  [![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-black.svg)](https://www.pinecone.io/)
</div>

<br />

Engram is an intelligent, personalized chat application that dynamically adapts its personality by analyzing your private diary entries. Built with an advanced RAG (Retrieval-Augmented Generation) pipeline using **Pinecone** and a modern tech stack, Engram provides an AI that truly understands you by seamlessly recalling past memories, traits, and experiences during conversations.

---

## ✨ Features

- **🔐 Secure Authentication**: Fast and secure user onboarding with JWT.
- **📔 Digital Diary Integration**: Log your daily thoughts securely with MongoDB.
- **🧬 Dynamic Personality Extraction**: Engram extracts behavioral traits, openness, and emotional states from your entries.
- **🧠 Advanced Memory (RAG)**: Integrates **Pinecone Vector Database** using serverless inference to semantically retrieve your past thoughts, allowing the AI to "remember" and reference relevant context.
- **💬 AI-Powered Conversations**: Fluid chat experience utilizing LLMs (Groq's fast inference) configured to reply exclusively from your perspective and personality.
- **⚡ Unified Monorepo DX**: One command spins up both the Node.js backend and the React frontend.

---

## 🏗️ Technology Stack

| Category         | Technologies Used                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| **Frontend**     | React, Vite, TailwindCSS / Styled Components                                                                    |
| **Backend**      | Node.js, Express.js, JWT                                                                                        |
| **Database**     | MongoDB (Document Storage), Mongoose                                                                            |
| **AI & RAG**     | Pinecone (Vector Storage & Embeddings `multilingual-e5-large`), Groq / OpenAI-compatible APIs (LLM Chat)        |

---

## 🚀 Getting Started

Follow these steps to get a local copy of Engram up and running.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [Git](https://git-scm.com/)
- API Keys for **MongoDB**, **Pinecone**, and **Groq** (or any OpenAI-compatible API).

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/engram.git
cd engram
```

### 2. Install Dependencies
Install packages across the workspace:
```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../engram-complete
npm install
```

### 3. Environment Variables setup

Create `.env` files in both the `Backend` and `engram-complete` directories.

#### Backend (`Backend/.env`)
```env
# Database Connections
MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
PINECONE_API_KEY=<YOUR_PINECONE_API_KEY>

# Authentication
JWT_SECRET=<YOUR_SUPER_SECRET_JWT_KEY>

# LLM API
API=<YOUR_GROQ_OR_OPENAI_API_KEY>
PORT=5000
```

#### Frontend (`engram-complete/.env`)
```env
# Depending on your frontend configuration, you might need API keys or backend URLs
VITE_API_KEY=<Your-AI-API-KEY>
```

---

## 🏃‍♂️ Running the Application

To start both the frontend and backend servers simultaneously from the root directory:

```bash
# Make sure you are in the root 'engram' folder
npm run start
```

- **Backend** will spin up on `http://localhost:5000`
- **Frontend** will spin up on `http://localhost:3000` (or `5173` if Vite default)

---

## 🧠 How the RAG Pipeline Works

1. **Ingestion**: When you write a diary entry, the backend stores the raw text in MongoDB.
2. **Embedding**: Simultaneously, it uses Pinecone's serverless Inference API (`multilingual-e5-large`) to generate high-dimensional vectors representing your text.
3. **Storage**: The vector is upserted into the `engram-diary-index` within Pinecone.
4. **Retrieval**: When you chat with Engram, your message is embedded and semantically searched against Pinecone.
5. **Generation**: Top matching past diary entries are dynamically injected into the system prompt, giving the AI the contextual memory needed to answer accurately based on *your* past.

---

## 🐛 Troubleshooting

- **`EADDRINUSE: port is already in use`**: Ensure no other processes are running on ports 5000 or 3000.
- **Vector Search failing**: Check if `PINECONE_API_KEY` is set correctly and the `engram-diary-index` was created successfully in your Pinecone dashboard.
- **Frontend not starting**: Ensure the `start` script is properly defined in `engram-complete/package.json` (e.g., `vite` or `react-scripts start`).

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute as you see fit.

<br />
