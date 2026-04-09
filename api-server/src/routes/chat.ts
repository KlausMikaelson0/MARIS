import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const SYSTEM_PROMPT = `You are the MARIS studio assistant — a concise, professional AI helper for the MARIS premium e-commerce studio based in Saudi Arabia.

About MARIS:
- We build premium digital stores for brands in Saudi Arabia and the wider GCC
- Four products: Launch Store (SAR 5,900), Brand Store (SAR 12,900), Elite Platform (SAR 27,900), Custom Build (starting SAR 50,000)
- All stores are custom-built with a fixed scope and contract-first approach
- Delivered as-is; post-delivery changes require a Revision Ticket
- Contact: studiomaris@outlook.com

Your role:
- Answer questions about our products, pricing, and process
- Keep responses SHORT (2–4 sentences max)
- Be professional but warm
- If someone wants to start a project, direct them to the "Start a Project" page
- If someone needs human support, tell them to open a Support Ticket in the Client Vault
- Do NOT make up details beyond what is known about MARIS
- Respond in the same language the user writes in (Arabic or English)

When responding in Arabic, be professional and use proper formal Arabic.`;

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    res.write(`data: ${JSON.stringify({ error: "Something went wrong." })}\n\n`);
    res.end();
  }
});

export default router;
