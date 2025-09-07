import { LLM } from "@langchain/core/language_models/llms";
import axios from "axios";

export class GeminiLLM extends LLM {
  static lc_name() {
    return "GeminiLLM";
  }

  constructor(fields = {}) {
    super(fields);
  }

  _llmType() {
    return "google_gemini";
  }

  async _call(prompt, options) {
    const modelName = "models/gemini-2.5-flash"; // update this if your access allows
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("🔁 Gemini RAW response:", response.data);

      const output =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "⚠️ No output from Gemini.";

      return output;
    } catch (error) {
      console.error("🔥 GeminiLLM error:", error?.response?.data || error.message);
      return "⚠️ Error calling Gemini model.";
    }
  }
}
