import { NextResponse } from "next/server";
import { paymentSchema } from "@/lib/validations";
import { postInvoicePayment } from "@/lib/postingEngine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { method, amount, date } = parsed.data;

    const result = await postInvoicePayment(id, method, amount, new Date(date));

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process payment";
    console.error("Invoice payment error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
