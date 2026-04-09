import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

router.post("/translate", async (req, res): Promise<void> => {
  try {
    const { name, tag, desc, timeline, includes } = req.body as {
      name: string;
      tag: string;
      desc: string;
      timeline: string;
      includes: string[];
    };

    const prompt = `You are a professional Arabic translator for a premium e-commerce studio in Saudi Arabia.
Translate the following product information into formal, professional Arabic (Modern Standard Arabic).
Return ONLY a valid JSON object with exactly these keys: nameAr, tagAr, descAr, timelineAr, includesAr (array of strings matching the includes array length).

Product data:
Name: ${name || ""}
Tag/Badge: ${tag || ""}
Description: ${desc || ""}
Timeline: ${timeline || ""}
Includes: ${JSON.stringify(includes || [])}

Return only JSON, no markdown, no explanation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw);
    res.json(result);
  } catch (err) {
    console.error("translate error", err);
    res.status(500).json({ error: "Translation failed" });
  }
});

export default router;
