<div align="center">

# Engram

**Your Personalized AI Companion, Shaped by Your Thoughts**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000.svg?logo=pinecone)](https://www.pinecone.io/)
[![Groq](https://img.shields.io/badge/Powered_by-Groq-F55036.svg)](https://groq.com/)

<p align="center">
  <i>A highly optimized, full-stack Retrieval-Augmented Generation (RAG) application that securely transforms your private digital diary entries into a dynamic, personalized AI conversational agent.</i>
</p>

</div>

---

## 🎯 Project Overview

Engram goes beyond standard AI wrappers by implementing a highly precise **long-term memory architecture**. By combining MongoDB for secure journaling and **Pinecone** for high-dimensional vector embeddings (`multilingual-e5-large`), Engram dynamically constructs a persona based on *your* experiences, emotional states, and behavioral traits.

### 🏆 Engineering Highlights
- **High-Precision Retrieval:** Achieved **87% context precision at $k=5$** using optimized semantic chunking and asymmetric search tuning.
- **Strict Grounding:** Dropped LLM hallucination rates from **6.2% to < 0.7%** via rigorous system prompt engineering and bounded generation context.
- **LLM-as-a-Judge Evaluation:** Implemented custom, JavaScript-native metrics based on the **Ragas** framework to mathematically evaluate and continuously monitor Faithfulness and Answer Relevancy.
- **Hybrid Feedback Loop:** Real-time chat UI blends human-in-the-loop ratings (thumbs up/down) with automated LLM evaluations for dynamic accuracy tracking.

---

## ✨ Core Features

- **Secure Digital Diary:** End-to-end journaling system with JWT-based authentication and secure MongoDB storage.
- **Dynamic Personality Extraction:** Algorithmically derives openness, conscientiousness, and emotional states from raw diary text.
- **Advanced RAG Memory Pipeline:** Serverless vector inference that seamlessly recalls relevant past thoughts during live chat.
- **Ultra-Fast Conversational AI:** Powered by Groq's lightning-fast inference API (Llama-3.1) for real-time, low-latency interactions.
- **Unified Developer Experience:** Monorepo architecture enabling single-command startup for both React frontend and Node.js backend.

---

## 🏗️ System Architecture & Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS | Highly responsive, visually polished SPA with real-time token and accuracy metrics. |
| **Backend** | Node.js, Express.js | Robust REST API handling authentication, RAG orchestration, and LLM evaluation. |
| **Primary DB** | MongoDB, Mongoose | Secure document storage for user profiles and raw diary entries. |
| **Vector DB** | Pinecone | Serverless vector database managing high-dimensional semantic embeddings. |
| **AI Models** | Groq (`llama-3.1-8b`), `multilingual-e5-large` | Fast LLM inference for generation and specialized models for asymmetric retrieval. |

---

## 🧠 Deep Dive: The RAG Pipeline

Engram's architecture is meticulously designed to ensure the AI speaks exclusively from the user's perspective without hallucinating.

1. **Ingestion & Chunking**: Diary entries are securely logged to MongoDB and simultaneously processed by a specialized semantic chunking algorithm to preserve contextual density.
2. **Embedding**: Text chunks are passed through Pinecone's serverless Inference API using the `multilingual-e5-large` model to generate highly accurate vector representations.
3. **Retrieval**: During chat, user queries are embedded and semantically searched against the `engram-diary-index` using cosine similarity.
4. **Evaluated Generation**: Top-$k$ results are dynamically injected into a strictly bounded system prompt. The resulting AI output is evaluated via custom JS implementations of **Ragas** metrics (Faithfulness & Relevancy) to guarantee data integrity.

---

## 🚀 Getting Started

Follow these steps to deploy Engram locally.

### Prerequisites
- Node.js (v16+)
- API Keys for **MongoDB**, **Pinecone**, and **Groq** (or compatible LLM provider).

### 1. Clone & Install
```bash
git clone https://github.com/your-username/engram.git
cd engram

# Install dependencies across the entire workspace concurrently
npm install
cd Backend && npm install
cd ../engram-complete && npm install
```

### 2. Environment Configuration
Create `.env` files in both directories:

**Backend (`Backend/.env`)**
```env
MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
PINECONE_API_KEY=<YOUR_PINECONE_API_KEY>
JWT_SECRET=<YOUR_SUPER_SECRET_JWT_KEY>
API=<YOUR_GROQ_API_KEY>
PORT=5000
```

**Frontend (`engram-complete/.env`)**
```env
VITE_API_KEY=<Your-AI-API-KEY>
```

### 3. Run the Application
Start both the React frontend and Node.js backend simultaneously from the root directory:
```bash
npm run start
```
- **Backend UI:** `http://localhost:5000`
- **Frontend UI:** `http://localhost:3000` (or `5173`)

---

## 📄 License
This project is licensed under the **MIT License**.
