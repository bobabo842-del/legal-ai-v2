import {
  getEmbedding,
  cosineSimilarity,
} from "../../../lib/vector";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json({
        result: "اكتب سؤال قانوني أولًا",
      });
    }

    const articles =
      await prisma.legalArticle.findMany();

    if (!articles.length) {
      return NextResponse.json({
        result: "لا توجد قوانين مرفوعة",
      });
    }

    // تحويل السؤال إلى vector
    const questionEmbedding =
      await getEmbedding(question);

    // حساب التشابه
    const matched = articles
      .map((article) => {
        try {
          const articleEmbedding = JSON.parse(
            article.embedding
          );

          const similarity =
            cosineSimilarity(
              questionEmbedding,
              articleEmbedding
            );

            console.log(similarity);

          return {
            ...article,
            similarity,
          };
        } catch {
          return null;
        }
      })
      .filter(
        (article): article is NonNullable<typeof article> =>
          article !== null &&
          article.similarity > 0.10
      )
      .sort(
        (a, b) =>
          b.similarity - a.similarity
      )
      .slice(0, 10);

    if (!matched.length) {
      return NextResponse.json({
        result:
          "لم يتم العثور على مواد قانونية مناسبة",
      });
    }

    // تجهيز السياق القانوني
    const context = matched
      .map((article) => {
        return `
رقم المادة:
${article.articleNo}

النص:
${article.content.slice(0, 1200)}
`;
      })
      .join("\n\n----------------------\n\n");

    // استدعاء AI
    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        temperature: 0,

        top_p: 0.1,

        messages: [
          {
            role: "system",
            content: `
أنت محامي مصري خبير بالقانون المصري.

التزم بالآتي:
- تحليل السؤال قانونيًا.
- استخدام جميع المواد القانونية المهمة.
- تقديم إجابة شاملة وواضحة.
- عدم نسخ النصوص القانونية كاملة.
- تلخيص المواد القانونية بشكل احترافي.
- ذكر العقوبات أو الشروط المهمة.
- تنظيم الإجابة بطريقة سهلة للمحامي.
`,
          },

          {
            role: "user",
            content: `
السؤال القانوني:
${question}

المواد القانونية:
${context}

أعطني:

1- ملخص قانوني واضح

2- أهم المواد المرتبطة

3- العقوبات أو الشروط المهمة

4- جميع النقاط القانونية المهمة

رتب الإجابة بشكل احترافي.
`,
          },
        ],
      });

    const result =
      completion.choices[0].message.content;

   return NextResponse.json({
  result,

  matchedCount: matched.length,

  sources: matched.map((article) => ({
    lawName: article.lawName,

    articleNo: article.articleNo,
  })),
});
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      result: "حدث خطأ أثناء البحث القانوني",
    });
  }
}