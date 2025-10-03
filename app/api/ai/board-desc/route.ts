import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    if (!title)
      return NextResponse.json({ error: "Title required" }, { status: 400 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Write a short, clear Kanban board project description base on its title (1-2 sentences).",
        },
        { role: "user", content: `Title: ${title}` },
      ],
      max_tokens: 120,
      temperature: 0.7,
    });

    const description = r.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ description });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
