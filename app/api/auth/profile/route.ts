import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, mobile, loginId, avatar } = body;

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(mobile !== undefined && { mobile }),
        ...(loginId !== undefined && { loginId }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        fullName: user.fullName,
        mobile: user.mobile,
        loginId: user.loginId,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
