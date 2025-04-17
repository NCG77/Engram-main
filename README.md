# 🧠 Engram

Engram is a personalized AI-powered chat application that reflects your personality by analyzing diary entries. It consists of a React frontend and a Node.js backend and uses Groq's LLaMA 3 for generating intelligent, personalized conversations.

---

## 🚀 Features

- 🔐 User authentication (Sign Up / Sign In)
- 🧬 Personality extraction from diary entries
- 💬 AI-powered chat with Groq’s LLaMA 3
- 🌐 Secure token handling
- 📦 Unified startup using one command

---

## 🧑‍💻 Technologies Used

- **Frontend**: React, Styled Components
- **Backend**: Node.js, Express, JWT, Groq API
- **AI Model**: LLaMA 3 via [Groq API](https://console.groq.com/)
- **Storage**: localStorage (tokens), database for users/diaries
- **Dev Tooling**: `concurrently`, `nodemon`

---

## 🛠 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/engram.git
cd engram
```

### 2. Install dependencies

```bash
npm install        # root level (for concurrently)

cd Backend
npm install        # backend dependencies

cd ../engram-complete
npm install        # frontend dependencies
```

### 3. Environment Variables

#### Backend (`Backend/.env`)

```
MONGO_URI=<YOUR-MONGO-URI>
JWT_SECRET=<YOUR-JWT_SECRET>
API=<YOUR-AI-API-KEY>
```

#### Frontend (`engram-complete/.env`)

```
VITE_API_KEY=<Your-AI-API-KEY>
```

---

## 🧪 Running the App

From the root directory:

```bash
npm run start
```

This will:

- Start the **backend** using `nodemon` (on port 5000)
- Start the **frontend** using `npm start` (on port 3000)

> 💡 Make sure both `Backend` and `engram-complete` have valid `start` scripts in their `package.json`.

---

## 📌 Available Scripts

In the project root:

```json
"scripts": {
  "start": "concurrently \"npm run server\" \"npm run client\"",
  "server": "cd Backend && npm start",
  "client": "cd engram-complete && npm start"
}
```

---

## 💭 How It Works

1. User signs up or logs in.
2. Diary entries (future feature) are used to extract a personality.
3. Chat requests are sent to the backend, which generates LLaMA 3 prompts based on that personality.
4. LLaMA 3 replies through the Groq API, creating personalized conversations.

---

## 🐛 Troubleshooting

- **Port in use (EADDRINUSE)**: Make sure port 5000 (backend) isn't already occupied.
- **Frontend script missing**: Ensure `"start"` exists in `engram-complete/package.json`.

## 📄 License

This project is open-source and free to use for educational and non-commercial purposes.

---

## ❤️ Credits

Built with LLaMA 3.
