import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Removed Supabase client initialization and related code

export async function POST(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const session = await auth();
    const recipeId = params.recipeId;

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // Optional: Check if recipe exists, though not strictly necessary for link generation
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true }, // Select minimal data
    });

    if (!recipe) {
      return NextResponse.json({ error: "食谱不存在" }, { status: 404 });
    }

    // Generate a simple, predictable share ID (could be just the recipeId or a transformed version)
    // For this simple version, we'll use the recipeId itself or a prefix
    const shareId = `share-${recipeId}`;

    // Generate the share URL using an environment variable for the app URL or a fallback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${appUrl}/shared/${shareId}`; // Assuming a route /shared/[shareId] exists

    // No database interaction for storing the share link in this simple version
    console.log(`Generated share link for recipe ${recipeId}: ${shareUrl}`);

    return NextResponse.json({
      shareId, // The generated ID, can be used by the client if needed
      shareUrl, // The full URL to be shared
      success: true,
    });

  } catch (error) {
    console.error("Error generating share link:", error);
    // If prisma.recipe.findUnique fails or any other error occurs
    return NextResponse.json({ error: "生成分享链接失败" }, { status: 500 });
  }
}
