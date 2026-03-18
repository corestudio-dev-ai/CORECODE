import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { provider, model, message, mode } = await req.json();

    let responseText = "";

    // OLLAMA INTEGRATION (Local)
    if (provider === "ollama") {
      const ollamaRes = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: message }],
          stream: false
        })
      });

      if (!ollamaRes.ok) {
        throw new Error(`Ollama failed: Make sure Ollama is running and model '${model}' is pulled locally.`);
      }
      
      const data = await ollamaRes.json();
      responseText = data.message.content;
    }

    // GOOGLE GEMINI INTEGRATION
    else if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not set in your .env file.");

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      });

      if (!geminiRes.ok) {
        throw new Error(`Gemini API Error: ${geminiRes.statusText}`);
      }

      const data = await geminiRes.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    }

    // TOGETHER AI INTEGRATION
    else if (provider === "together") {
      const apiKey = process.env.TOGETHER_API_KEY;
      if (!apiKey) throw new Error("TOGETHER_API_KEY is not set in your .env file.");

      const togetherRes = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: message }],
          max_tokens: 1024
        })
      });

      if (!togetherRes.ok) {
        throw new Error(`Together AI Error: ${togetherRes.statusText}`);
      }

      const data = await togetherRes.json();
      responseText = data.choices?.[0]?.message?.content || "No response generated.";
    }

    // DEEPSEEK / OTHERS (Placeholder for similar OpenAI-compatible endpoints)
    else {
      responseText = `[CORECODE ENGINE] ${provider} is configured but its API route is still pending connection.`;
    }

    // Add Mode context for flavor (in a real app, 'mode' would dictate the system prompt!)
    const modePrefix = mode === 'plan' ? "📋 **PLANNING MODE**\n" : mode === 'agent' ? "🤖 **AGENT MODE**\n" : "";

    return NextResponse.json({ response: modePrefix + responseText });

  } catch (error: unknown) {
    console.error("API Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ response: `API Error: ${errorMessage}` }, { status: 500 });
  }
}
