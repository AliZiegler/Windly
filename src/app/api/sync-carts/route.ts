import { NextResponse } from "next/server";
import { syncAllCartStatuses } from "@/app/actions/CartActions";

export async function GET() {
    const result = await syncAllCartStatuses();
    return NextResponse.json(result);
}
