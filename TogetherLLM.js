const { LLM } = require("langchain/llms/base");
const axios = require("axios");

class TogetherLLM extends LLM {
  _llmType() {
    return "together_ai";
  }

  async _call(prompt, options) {
    const response = await axios.post(
      "https://api.together.xyz/inference",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt,
        max_tokens: 500,
        temperature: 0.4,
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

    return response.data.output?.trim() || "No output.";
  }
}

module.exports = { TogetherLLM };
