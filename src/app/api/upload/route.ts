import { getEmbedding } from "../../../lib/vector";

import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

import pdf from "pdf-parse-fixed";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({
        error: "No file uploaded",
      });
    }

    // قراءة الملف
    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    // استخراج النص من PDF
    const parsed = await pdf(buffer);

    let cleanedText = parsed.text;

    // تنظيف النص
    cleanedText = cleanedText.replace(/\s+/g, " ");

    cleanedText = cleanedText.replace(
      /صفحة\s*\d+/g,
      ""
    );

    cleanedText = cleanedText.replace(
      /فهرس/gi,
      ""
    );

    cleanedText = cleanedText.replace(
      /المحتويات/gi,
      ""
    );

    cleanedText = cleanedText.replace(
      /الباب\s+\S+/g,
      ""
    );

    cleanedText = cleanedText.replace(
      /الفصل\s+\S+/g,
      ""
    );

    cleanedText = cleanedText.replace(
      /[^\u0600-\u06FFa-zA-Z0-9\s]/g,
      " "
    );

    cleanedText = cleanedText.trim();

    // تقسيم المواد القانونية
    const articles = cleanedText
      .split(/المادة\s+\d+/g)
      .filter(
        (text) => text.trim().length > 50
      );

    const articleNumbers =
      cleanedText.match(/المادة\s+\d+/g) || [];

    console.log(
      "Total Articles:",
      articles.length
    );

    // حذف النسخة القديمة من نفس القانون
    await prisma.legalArticle.deleteMany({
      where: {
        lawName: file.name,
      },
    });

    // حفظ المواد الجديدة
    for (let i = 0; i < articles.length; i++) {
      const content = articles[i].trim();

      if (!content) continue;

      const articleNo =
        articleNumbers[i] ||
        `مادة ${i + 1}`;

      console.log("Saving", articleNo);

      // إنشاء embedding
      const embedding =
        await getEmbedding(content);

      // حفظ داخل قاعدة البيانات
      await prisma.legalArticle.create({
        data: {
          lawName: file.name,

          articleNo,

          content,

          embedding: JSON.stringify(
            embedding
          ),
        },
      });
    }

    return NextResponse.json({
      success: true,

      lawName: file.name,

      totalArticles: articles.length,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      error: "Failed to upload PDF",
    });
  }
}