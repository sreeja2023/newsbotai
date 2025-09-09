# News Companion

A conversational news chatbot that fetches, summarizes, and answers questions about the latest articles.  
Built with **LangChain, NewsAPI, Node.js, and Express**, the system integrates **Google Gemini** and **HuggingFace** models for intelligent summarization, and maintains **session-based conversational memory** to handle follow-up queries.  

---

## Features
- **News Search:** Retrieve the latest articles using NewsAPI.  
- **Intelligent Summarization:** Generate concise summaries with Google Gemini API and HuggingFace models via LangChain.  
- **Conversational Memory:** Maintain context across sessions to answer follow-up questions naturally.  
- **Express.js Backend:** Fast and lightweight backend API server.  

---

## Tech Stack
- **Backend:** Node.js, Express.js  
- **AI / LLM:** LangChain, Google Gemini API, HuggingFace Transformers  
- **News Source:** NewsAPI  
- **Environment:** dotenv for configuration, npm for package management  

---

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/sreeja2023/newsbotai.git
cd news-companion
```
### 2. Install dependencies
```bash
npm instal
```
### 3. Configure environment variables in your env file 
```bash
NEWSAPI_KEY=your_newsapi_key
GEMINI_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_hf_token
PORT=3000
SESSION_SECRET=your_session_secret

```
### 4.. Start the server
```bash
npm start
```
