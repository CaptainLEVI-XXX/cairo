//-------------Code Without On Chain Fetching------------\\

import axios from "axios";

interface EkuboPool {
  fee: string;
  tick_spacing: number;
  extension: string;
  volume0_24h: string;
  volume1_24h: string;
  fees0_24h: string;
  fees1_24h: string;
  tvl0_total: string;
  tvl1_total: string;
  tvl0_delta_24h: string;
  tvl1_delta_24h: string;
}

interface TokenPrice {
  token: string;
  price: number;
}

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  l2_token_address: string;
  sort_order: number;
  total_supply: string | null;
  hidden?: boolean;
  logo_url: string;
}

interface PoolStats {
  token0Symbol: string;
  token1Symbol: string;
  fee: string;
  tickSpacing: number;
  volume24h: {
    token0: string;
    token1: string;
    usd: number;
  };
  fees24h: {
    token0: string;
    token1: string;
    usd: number;
  };
  tvl: {
    token0: string;
    token1: string;
    usd: number;
  };
  apr: number;
  tokens: {
    token0: TokenInfo;
    token1: TokenInfo;
  };
}

class WhitelistedEkuboFetcher {
  private readonly baseUrl: string;
  private readonly quoterUrl: string;
  private readonly whitelistedTokens: TokenInfo[];
  private priceCache: Map<string, number>;

  constructor(
    baseUrl: string = "https://starknet-mainnet-api.ekubo.org",
    quoterUrl: string = "https://starknet-mainnet-quoter-api.ekubo.org"
  ) {
    this.baseUrl = baseUrl;
    this.quoterUrl = quoterUrl;
    this.priceCache = new Map();

    // Whitelist of supported tokens
    this.whitelistedTokens = [
      {
        name: "Wrapped BTC",
        symbol: "WBTC",
        decimals: 8,
        l2_token_address:
          "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
        sort_order: 0,
        total_supply: null,
        logo_url:
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/7dcb2db2-a7a7-44af-660b-8262e057a100/logo",
      },
      {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        l2_token_address:
          "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        sort_order: 5,
        total_supply: null,
        logo_url:
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
      },
      {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        l2_token_address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        sort_order: 3,
        total_supply: null,
        logo_url:
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
      },
      {
        name: "Dai Stablecoin",
        symbol: "DAI",
        decimals: 18,
        l2_token_address:
          "0x05574eb6b8789a91466f902c380d978e472db68170ff82a5b650b95a58ddf4ad",
        sort_order: 4,
        total_supply: null,
        logo_url:
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/919e761b-56f7-4f53-32aa-5e066f7f6200/logo",
      },
    ];
  }

  private normalizeAddress(address: string): string {
    return "0x" + address.replace("0x", "").padStart(64, "0");
  }

  private async refreshPrices(): Promise<void> {
    try {
      const response = await axios.get<{ prices: TokenPrice[] }>(
        `${this.quoterUrl}/prices/0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8`
      );
      response.data.prices.forEach(({ token, price }) => {
        const normalizedAddress = this.normalizeAddress(token);
        this.priceCache.set(normalizedAddress, price);
      });
    } catch (error) {
      console.error("Error fetching prices:", error);
      throw error;
    }
  }

  private async getPoolStats(
    token0: TokenInfo,
    token1: TokenInfo
  ): Promise<PoolStats[]> {
    const normalizedToken0 = this.normalizeAddress(token0.l2_token_address);
    const normalizedToken1 = this.normalizeAddress(token1.l2_token_address);

    try {
      const response = await axios.get<{ topPools: EkuboPool[] }>(
        `${this.baseUrl}/pair/${normalizedToken0}/${normalizedToken1}/pools`
      );

      return response.data.topPools
        .filter((pool) => pool.volume0_24h !== "0" || pool.volume1_24h !== "0")
        .map((pool) => this.processPoolData(pool, token0, token1));
    } catch (error) {
      console.error(
        `Error fetching pool data for ${token0.symbol}/${token1.symbol}:`,
        error
      );
      return [];
    }
  }

  private processPoolData(
    pool: EkuboPool,
    token0: TokenInfo,
    token1: TokenInfo
  ): PoolStats {
    const token0Price =
      this.priceCache.get(this.normalizeAddress(token0.l2_token_address)) || 0;
    const token1Price =
      this.priceCache.get(this.normalizeAddress(token1.l2_token_address)) || 0;

    const volume0USD = this.tokenToUSD(
      pool.volume0_24h,
      token0.decimals,
      token0Price
    );
    const volume1USD = this.tokenToUSD(
      pool.volume1_24h,
      token1.decimals,
      token1Price
    );
    const tvl0USD = this.tokenToUSD(
      pool.tvl0_total,
      token0.decimals,
      token0Price
    );
    const tvl1USD = this.tokenToUSD(
      pool.tvl1_total,
      token1.decimals,
      token1Price
    );

    const fees0USD = this.tokenToUSD(
      pool.fees0_24h,
      token0.decimals,
      token0Price
    );
    const fees1USD = this.tokenToUSD(
      pool.fees1_24h,
      token1.decimals,
      token1Price
    );

    const apr = this.calculateAPR(fees0USD + fees1USD, tvl0USD + tvl1USD);

    return {
      token0Symbol: token0.symbol,
      token1Symbol: token1.symbol,
      fee: pool.fee,
      tickSpacing: pool.tick_spacing,
      volume24h: {
        token0: pool.volume0_24h,
        token1: pool.volume1_24h,
        usd: volume0USD + volume1USD,
      },
      fees24h: {
        token0: pool.fees0_24h,
        token1: pool.fees1_24h,
        usd: fees0USD + fees1USD,
      },
      tvl: {
        token0: pool.tvl0_total,
        token1: pool.tvl1_total,
        usd: tvl0USD + tvl1USD,
      },
      apr,
      tokens: {
        token0,
        token1,
      },
    };
  }

  private tokenToUSD(amount: string, decimals: number, price: number): number {
    const value = Number(BigInt(amount)) / Math.pow(10, decimals);
    return value * price;
  }

  private calculateAPR(totalFeesUSD: number, totalTVLUSD: number): number {
    if (totalTVLUSD === 0) return 0;
    return (totalFeesUSD * 365 * 100) / totalTVLUSD;
  }

  async getAllPoolStats(): Promise<PoolStats[]> {
    // Refresh prices first
    await this.refreshPrices();

    const allPools: PoolStats[] = [];
    const tokens = this.whitelistedTokens;

    // Get all possible token pairs
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const poolStats = await this.getPoolStats(tokens[i], tokens[j]);
        allPools.push(...poolStats);
      }
    }

    // Sort by TVL (highest first)
    return allPools.sort((a, b) => b.tvl.usd - a.tvl.usd);
  }
}

// Example usage
async function main() {
  try {
    const fetcher = new WhitelistedEkuboFetcher();
    const allPools = await fetcher.getAllPoolStats();
    console.log("All pool stats:", JSON.stringify(allPools, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

if (require.main === module) {
  main();
}

export { WhitelistedEkuboFetcher, type PoolStats, type TokenInfo };
