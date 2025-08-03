require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Load API keys
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const HF_API_KEY = process.env.HF_API_KEY;
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
    const summary = await summarizeWithHuggingFace(topic, newsText);
    res.json({ summary });
  } catch (error) {
    console.error('❌ Error summarizing:', error.message);
    res.status(500).json({ summary: 'Error summarizing news.' });
  }
});

// ✅ Route: Follow-up using RAG (Serper + Together)
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
Answer the user's question using only the search results below. If you don't know the answer, say: "I couldn't find that in the search results."

Question:
${question}

Search Results:
${webContext}

News Summary (optional background):
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

// 🔍 Fetch relevant news from NewsAPI
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
async function summarizeWithHuggingFace(topic, newsText) {
  const prompt = `
Summarize the following news related to "${topic}" into clear bullet points.
Only include relevant and important updates.

News:
${newsText}

Summary:
- `.trim(); // Notice it ends with a bullet

  const response = await axios.post(
    "https://api.together.xyz/inference",
    {
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.5,
      top_k: 40,
      top_p: 0.9,
      stop: ["</s>"]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const output = response.data.output?.trim()
    || response.data.choices?.[0]?.text?.trim()
    || "No summary available.";

  return output;
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 NewsChat running at http://localhost:${PORT}`);
});
