require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

// Load API keys
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const HF_API_KEY = process.env.HF_API_KEY;

// Terminal input setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user for topic
rl.question("🔍 What news topic would you like summarized? ", (topic) => {
  fetchNews(topic);
  rl.close();
});

// STEP 1: Fetch news
async function fetchNews(query) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=5&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;

  try {
    const response = await axios.get(url);
    const articles = response.data.articles;

    const newsText = articles
      .map((a, i) => `${i + 1}. ${a.title} - ${a.description || ''}`)
      .join('\n');

    console.log("\n📰 News fetched. Sending to Hugging Face for summary...\n");

    await summarizeWithHuggingFace(query, newsText);
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
  }
}

// STEP 2: Hugging Face summarization
async function summarizeWithHuggingFace(topic, newsText) {
  const hfEndpoint = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

  const headers = {
    Authorization: `Bearer ${HF_API_KEY}`,
    "Content-Type": "application/json"
  };

  const prompt = `Summarize the following recent news about "${topic}":\n\n${newsText}`;

  try {
    const response = await axios.post(
      hfEndpoint,
      { inputs: prompt },
      { headers }
    );

    console.log("✅ Summary:\n");
    console.log(response.data[0]?.summary_text || "No summary generated.");
  } catch (error) {
    console.error('❌ Error with Hugging Face API:', error.response?.data || error.message);
  }
}
