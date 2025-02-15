// app/api/apr/route.ts
import { NextResponse } from "next/server";
import { WhitelistedEkuboFetcher } from "./ekubo/Ekubo_APR";
import { ZKLendDataFetcher } from "./zklend/ZKLend_APR";

export async function GET() {
  try {
    // Initialize fetchers
    const ekuboFetcher = new WhitelistedEkuboFetcher();
    const zklendFetcher = new ZKLendDataFetcher();

    // Get data from both protocols
    const [ekuboPools, zklendData] = await Promise.all([
      ekuboFetcher.getAllPoolStats(),
      zklendFetcher.getPoolStats(), // Assuming this is your method name
    ]);

    return NextResponse.json({
      ekubo: ekuboPools,
      zklend: zklendData,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching APR data:", error);
    return NextResponse.json(
      { error: "Failed to fetch APR data" },
      { status: 500 }
    );
  }
}
