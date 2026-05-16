import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const laws =
      await prisma.legalArticle.groupBy({
        by: ["lawName"],

        _count: {
          lawName: true,
        },
      });

    return NextResponse.json({
      laws,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      error: "Failed",
    });
  }
}