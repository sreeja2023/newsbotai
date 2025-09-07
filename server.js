/*
// server.js
import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// ✅ Updated LangChain imports
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { TogetherLLM } from './TogetherLLM.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Load API keys
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Route: Summarize News
app.post('/summarize', async (req, res) => {
  const { topic } = req.body;

  try {
    const newsText = await fetchNews(topic);
    const summary = await summarizeWithLangChain(topic, newsText);
    res.json({ summary });
  } catch (error) {
    console.error('❌ Error summarizing:', error.message);
    res.status(500).json({ summary: 'Error summarizing news.' });
  }
});

// ✅ Route: Follow-up using Serper + Together
app.post('/followup', async (req, res) => {
  const { summary, question } = req.body;

  try {
    const searchResponse = await axios.post(
      "https://google.serper.dev/search",
      { q: question },
      {
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const results = searchResponse.data.organic || [];
    if (!results.length) {
      return res.json({ answer: "No relevant web results found." });
    }

    const webContext = results
      .slice(0, 5)
      .map((r, i) => `${i + 1}. ${r.title} - ${r.snippet} (${r.link})`)
      .join('\n\n');

    const prompt = `
Answer the user's question using only the search results below. If the answer is not there, say "Not found."

Question:
${question}

Search Results:
${webContext}

News Summary (optional context):
${summary}

Answer:
    `.trim();

    const togetherResponse = await axios.post(
      "https://api.together.xyz/inference",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt,
        max_tokens: 400,
        temperature: 0.5,
        top_k: 40,
        top_p: 0.9,
        stop: ["</s>"]
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = togetherResponse.data.output?.trim()
      || togetherResponse.data.choices?.[0]?.text?.trim()
      || "No answer generated.";

    res.json({ answer });

  } catch (error) {
    console.error("❌ RAG error:", error.response?.data || error.message);
    res.status(500).json({ answer: "Error during web search or AI generation." });
  }
});

// 🔍 Fetch news from NewsAPI
async function fetchNews(query) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=20&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;
  const response = await axios.get(url);
  const articles = response.data.articles;

  const relevantArticles = articles.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(query.toLowerCase()))
  );

  if (!relevantArticles.length) {
    return `No strong matches found for "${query}".`;
  }

  return relevantArticles
    .slice(0, 5)
    .map((a, i) => `${i + 1}. ${a.title} - ${a.description || ''}`)
    .join('\n');
}

// 🧠 Summarize using LangChain + Together
async function summarizeWithLangChain(topic, newsText) {
  const model = new TogetherLLM();

  const prompt = new PromptTemplate({
    template: `
You are a helpful assistant.

Summarize the following news about "{topic}" into clear, short bullet points.

News:
{newsText}

Summary:
- `.trim(),
    inputVariables: ["topic", "newsText"]
  });

  const chain = new LLMChain({ llm: model, prompt });
  const result = await chain.call({ topic, newsText });

  return result.text.trim();
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 NewsChat running at http://localhost:${PORT}`);
});
*/
// server.js
import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { TogetherLLM } from "./TogetherLLM.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Route: Summarize
app.post('/summarize', async (req, res) => {
  const { topic } = req.body;

  try {
    const newsText = await fetchNews(topic);
    const summary = await summarizeWithLangChain(topic, newsText);
    res.json({ summary });
  } catch (error) {
    console.error('❌ Error summarizing:', error.message);
    res.status(500).json({ summary: '⚠️ Error summarizing news.' });
  }
});

// ✅ Follow-up route
app.post('/followup', async (req, res) => {
  const { summary, question } = req.body;

  try {
    const searchResponse = await axios.post(
      "https://google.serper.dev/search",
      { q: question },
      {
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const results = searchResponse.data.organic || [];
    if (!results.length) {
      return res.json({ answer: "No relevant web results found." });
    }

    const webContext = results
      .slice(0, 5)
      .map((r, i) => `${i + 1}. ${r.title} - ${r.snippet} (${r.link})`)
      .join('\n\n');

    const prompt = `
Answer the user's question using only the search results below. If the answer is not there, say "Not found."

Question:
${question}

Search Results:
${webContext}

News Summary (optional context):
${summary}

Answer:
    `.trim();

    const togetherResponse = await axios.post(
      "https://api.together.xyz/inference",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt,
        max_tokens: 400,
        temperature: 0.5,
        top_k: 40,
        top_p: 0.9,
        stop: ["</s>"]
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = togetherResponse.data.output?.trim()
      || togetherResponse.data.choices?.[0]?.text?.trim()
      || "No answer generated.";

    res.json({ answer });

  } catch (error) {
    console.error("❌ Follow-up error:", error.message);
    res.status(500).json({ answer: "Error generating answer." });
  }
});

// 🔍 NewsAPI fetch
async function fetchNews(query) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=5&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;
  const response = await axios.get(url);
  const articles = response.data.articles;

  return articles
    .map((a, i) => `${i + 1}. ${a.title} - ${a.description || ''}`)
    .join('\n');
}

// 🧠 LangChain summarizer
async function summarizeWithLangChain(topic, newsText) {
  const model = new TogetherLLM();

  const prompt = new PromptTemplate({
    template: `
You are a helpful assistant.

Summarize the following news about "{topic}" into clear, short bullet points.

News:
{newsText}

Summary:
- `.trim(),
    inputVariables: ["topic", "newsText"]
  });

  const chain = new LLMChain({ llm: model, prompt });
  const result = await chain.call({ topic, newsText });

  return result?.text?.trim() || "⚠️ No summary generated.";
}

app.listen(PORT, () => {
  console.log(`🚀 NewsChat running at http://localhost:${PORT}`);
});