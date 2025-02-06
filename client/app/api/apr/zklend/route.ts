// app/api/apr/zklend/route.ts
import { NextResponse } from "next/server";
import { ZKLendDataFetcher } from "./ZKLend_APR";

export async function GET() {
  try {
    const zklendFetcher = new ZKLendDataFetcher();
    const data = await zklendFetcher.getPoolStats();

    return NextResponse.json({
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching ZKLend data:", error);
    return NextResponse.json(
      { error: "Failed to fetch ZKLend data" },
      { status: 500 }
    );
  }
}
