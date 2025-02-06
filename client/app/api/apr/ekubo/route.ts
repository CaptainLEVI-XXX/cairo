import { NextResponse } from "next/server";
import { WhitelistedEkuboFetcher } from "./Ekubo_APR";

export async function GET() {
  try {
    const ekuboFetcher = new WhitelistedEkuboFetcher();
    const pools = await ekuboFetcher.getAllPoolStats();

    return NextResponse.json({
      data: pools,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching Ekubo data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Ekubo data" },
      { status: 500 }
    );
  }
}
