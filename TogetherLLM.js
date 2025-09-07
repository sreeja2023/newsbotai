/*import { LLM } from "langchain/llms/base";
import axios from "axios";

export class TogetherLLM extends LLM {
  static lc_name() {
    return "TogetherLLM";
  }

  constructor(fields = {}) {
    super(fields); // ✅ FIX: pass fields to base LLM constructor
  }

  _llmType() {
    return "together_ai";
  }

  async _call(prompt, options) {
  try {
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

    console.log("🔁 TogetherAI RAW response:", response.data);

    // ✅ Fix: use choices[0].text
    const output =
      response.data.output?.trim() ||
      response.data.choices?.[0]?.text?.trim() ||
      null;

    return output || "⚠️ No output from TogetherAI.";
  } catch (error) {
    console.error("🔥 TogetherLLM error:", error?.response?.data || error.message);
    return "⚠️ Error calling TogetherAI model.";
  }
}


}
*/
/*import { LLM } from "langchain/llms/base";
import axios from "axios";

export class TogetherLLM extends LLM {
  static lc_name() {
    return "TogetherLLM";
  }

  constructor(fields = {}) {
    super(fields); // ✅ FIX: pass fields to base LLM constructor
  }

  _llmType() {
    return "together_ai";
  }

  async _call(prompt, options) {
  try {
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

    console.log("🔁 TogetherAI RAW response:", response.data);

    // ✅ Fix: use choices[0].text
    const output =
      response.data.output?.trim() ||
      response.data.choices?.[0]?.text?.trim() ||
      null;

    return output || "⚠️ No output from TogetherAI.";
  } catch (error) {
    console.error("🔥 TogetherLLM error:", error?.response?.data || error.message);
    return "⚠️ Error calling TogetherAI model.";
  }
}


}
*/
import { LLM } from "langchain/llms/base";
import axios from "axios";

export class TogetherLLM extends LLM {
  static lc_name() {
    return "TogetherLLM";
  }

  constructor(fields = {}) {
    super(fields); // ✅ Required for LangChain internals
  }

  _llmType() {
    return "together_ai";
  }

  async _call(prompt, options) {
    try {
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

      console.log("🔁 TogetherAI RAW response:", response.data);

      const output =
        response.data.output?.trim() ||
        response.data.choices?.[0]?.text?.trim() ||
        null;

      return output || "⚠️ No output from TogetherAI.";
    } catch (error) {
      console.error("🔥 TogetherLLM error:", error?.response?.data || error.message);
      return "⚠️ Error calling TogetherAI model.";
    }
  }
}