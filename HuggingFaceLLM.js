// HuggingFaceLLM.js
import { LLM } from "@langchain/core/language_models/llms";
import axios from "axios";

export class HuggingFaceLLM extends LLM {
  static lc_name() {
    return "HuggingFaceLLM";
  }

  constructor(fields = {}) {
    super(fields);
  }

  _llmType() {
    return "huggingface_api";
  }

  async _call(prompt, options) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/facebook/bart-large-cnn`,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const output =
        response.data?.[0]?.summary_text?.trim() ||
        response.data?.generated_text?.trim() ||
        null;

      return output || "⚠️ No output from HuggingFace.";
    } catch (error) {
      console.error("🔥 HuggingFaceLLM error:", error?.response?.data || error.message);
      return "⚠️ Error calling Hugging Face model.";
    }
  }
}
