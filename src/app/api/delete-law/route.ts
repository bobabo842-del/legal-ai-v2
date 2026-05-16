import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const lawName = body.lawName;

    await prisma.legalArticle.deleteMany({
      where: {
        lawName,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      error: "Failed",
    });
  }
}