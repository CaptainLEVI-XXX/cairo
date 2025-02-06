// zklendFetcher.ts
import axios from "axios";

// Define supported token types
type SupportedToken = "STRK" | "ETH" | "USDC" | "USDT";

interface Token {
  symbol: SupportedToken;
  name: string;
  decimals: number;
}

// Matching the exact API response structure
interface ZKLendPoolResponse {
  token: {
    symbol: SupportedToken;
    name: string;
    decimals: number;
  };
  price: {
    decimals: number;
    price: string;
    quote_currency: string;
  };
  supply_amount: string;
  debt_amount: string;
  available_liquidity: string;
  lending_apy: {
    net_apy: number;
    raw_apy: number;
    reward_apy: number | null;
  };
  borrowing_apy: {
    net_apy: number;
    raw_apy: number;
    reward_apy: number | null;
  };
  supplier_count: number;
  borrower_count: number;
}

interface PoolStats {
  token: Token;
  totalSupply: string; // Raw supply amount
  totalSupplyUSD: number; // Supply in USD
  totalBorrow: string; // Raw borrow amount
  totalBorrowUSD: number; // Borrow in USD
  availableLiquidity: string; // Raw available liquidity
  availableLiquidityUSD: number; // Available liquidity in USD
  supplyAPR: {
    total: number; // net_apy from lending_apy
    base: number; // raw_apy from lending_apy
    reward: number; // reward_apy from lending_apy
  };
  borrowAPR: {
    total: number; // net_apy from borrowing_apy
    base: number; // raw_apy from borrowing_apy
    reward: number; // reward_apy from borrowing_apy
  };
  utilizationRate: number; // Calculated from supply and borrow
  supplierCount: number;
  borrowerCount: number;
  timestamp: number;
}

// Constants
const ZKLEND_API = "https://app.zklend.com/api/pools";
const SUPPORTED_TOKENS: SupportedToken[] = ["STRK", "ETH", "USDC", "USDT"];
const TOKEN_ADDRESSES: Record<SupportedToken, string> = {
  STRK: "0x6d8fa671ef84f791b7f601fa79fea8f6ceb70b5fa84189e3159d532162efc21",
  ETH: "0x01b5bd713e72fdc5d63ffd83762f81297f6175a5e0a4771cdadbc1dd5fe72cb1",
  USDC: "0x047ad51726d891f972e74e4ad858a261b43869f7126ce7436ee0b2529a98f486",
  USDT: "0x811d8da5dc8a2206ea7fd0b28627c2d77280a515126e62baa4d78e22714c4a",
};

class ZKLendDataFetcher {
  async getPoolStats(): Promise<PoolStats[]> {
    try {
      const response = await axios.get<ZKLendPoolResponse[]>(ZKLEND_API);

      return response.data
        .filter((pool): pool is ZKLendPoolResponse =>
          SUPPORTED_TOKENS.includes(pool.token.symbol)
        )
        .map((pool) => this.processPoolData(pool));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching ZKLend data:", error.message);
      }
      throw error;
    }
  }

  private processPoolData(pool: ZKLendPoolResponse): PoolStats {
    const priceUSD =
      this.normalizeHexValue(pool.price.price) /
      Math.pow(10, pool.price.decimals);

    // Calculate USD values
    const totalSupplyUSD = this.calculateUSDValue(
      pool.supply_amount,
      priceUSD,
      pool.token.decimals
    );

    const totalBorrowUSD = this.calculateUSDValue(
      pool.debt_amount,
      priceUSD,
      pool.token.decimals
    );

    const availableLiquidityUSD = this.calculateUSDValue(
      pool.available_liquidity,
      priceUSD,
      pool.token.decimals
    );

    // Calculate utilization rate
    const utilizationRate =
      totalSupplyUSD > 0 ? totalBorrowUSD / totalSupplyUSD : 0;

    return {
      token: {
        symbol: pool.token.symbol,
        name: pool.token.name,
        decimals: pool.token.decimals,
      },
      totalSupply: pool.supply_amount,
      totalSupplyUSD,
      totalBorrow: pool.debt_amount,
      totalBorrowUSD,
      availableLiquidity: pool.available_liquidity,
      availableLiquidityUSD,
      supplyAPR: {
        total: pool.lending_apy.net_apy * 100, // Convert to percentage
        base: pool.lending_apy.raw_apy * 100,
        reward: (pool.lending_apy.reward_apy || 0) * 100,
      },
      borrowAPR: {
        total: pool.borrowing_apy.net_apy * 100, // Convert to percentage
        base: pool.borrowing_apy.raw_apy * 100,
        reward: (pool.borrowing_apy.reward_apy || 0) * 100,
      },
      utilizationRate: utilizationRate * 100, // Convert to percentage
      supplierCount: pool.supplier_count,
      borrowerCount: pool.borrower_count,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  private normalizeHexValue(value: string): number {
    if (value.startsWith("0x")) {
      return Number(BigInt(value));
    }
    return Number(value);
  }

  private calculateUSDValue(
    amount: string,
    priceUSD: number,
    decimals: number
  ): number {
    const normalizedAmount =
      this.normalizeHexValue(amount) / Math.pow(10, decimals);
    return normalizedAmount * priceUSD;
  }

  async getPoolStatsByToken(symbol: SupportedToken): Promise<PoolStats | null> {
    const stats = await this.getPoolStats();
    return stats.find((pool) => pool.token.symbol === symbol) || null;
  }
}

// Example usage
async function main() {
  try {
    const fetcher = new ZKLendDataFetcher();
    const pools = await fetcher.getPoolStats();
    console.log("All pools:", JSON.stringify(pools, null, 2));

    // Get specific pool
    const ethPool = await fetcher.getPoolStatsByToken("ETH");
    console.log("ETH pool:", JSON.stringify(ethPool, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run if this is the main module
if (require.main === module) {
  main();
}

export {
  ZKLendDataFetcher,
  type PoolStats,
  type Token,
  type SupportedToken,
  SUPPORTED_TOKENS,
  TOKEN_ADDRESSES,
};
