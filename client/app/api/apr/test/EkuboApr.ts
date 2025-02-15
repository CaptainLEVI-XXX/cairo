// Dont use this for now.. giving nonce error
import axios from "axios";
import { Contract, RpcProvider } from "starknet";

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
  extension: string;
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
  onChainApr: number | null;
  tokens: {
    token0: TokenInfo;
    token1: TokenInfo;
  };
}

interface FeeSnapshot {
  timestamp: number;
  feesPerLiquidity0: bigint;
  feesPerLiquidity1: bigint;
  liquidity: bigint;
  sqrtPrice: bigint;
}

class WhitelistedEkuboFetcher {
  private readonly baseUrl: string;
  private readonly quoterUrl: string;
  private readonly provider: RpcProvider;
  private readonly contract: Contract;
  private readonly whitelistedTokens: TokenInfo[];
  private priceCache: Map<string, number>;
  private feeSnapshots: Map<string, FeeSnapshot[]>;

  constructor(
    baseUrl: string = "https://starknet-mainnet-api.ekubo.org",
    quoterUrl: string = "https://starknet-mainnet-quoter-api.ekubo.org",
    providerUrl: string = "https://starknet-mainnet.infura.io/v3/c34637d8780347e9a85d41a10b707d24",
    contractAddress: string = "0x00000005dd3d2f4429af886cd1a3b08289dbcea99a294197e9eb43b0e0325b4b"
  ) {
    this.baseUrl = baseUrl;
    this.quoterUrl = quoterUrl;
    this.priceCache = new Map();
    this.feeSnapshots = new Map();

    // Initialize Starknet provider and contract
    this.provider = new RpcProvider({ nodeUrl: providerUrl });
    this.contract = new Contract(ABI, contractAddress, this.provider);

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

  private async getPoolState(
    pool: EkuboPool,
    token0: TokenInfo,
    token1: TokenInfo
  ) {
    try {
      // Make read-only calls to get pool state
      const [liquidity, price, feesPerLiquidity] = await Promise.all([
        this.contract.get_pool_liquidity(
          token0.l2_token_address,
          token1.l2_token_address,
          pool.fee,
          pool.tick_spacing,
          pool.extension
        ),
        this.contract.get_pool_price(
          token0.l2_token_address,
          token1.l2_token_address,
          pool.fee,
          pool.tick_spacing,
          pool.extension
        ),
        this.contract.get_pool_fees_per_liquidity(
          token0.l2_token_address,
          token1.l2_token_address,
          pool.fee,
          pool.tick_spacing,
          pool.extension
        ),
      ]);

      return {
        timestamp: Math.floor(Date.now() / 1000),
        feesPerLiquidity0: BigInt(feesPerLiquidity[0]),
        feesPerLiquidity1: BigInt(feesPerLiquidity[1]),
        liquidity: BigInt(liquidity),
        sqrtPrice: BigInt(price),
      };
    } catch (error) {
      console.error("Error fetching pool state:", error);
      return null;
    }
  }

  private getPoolId(
    pool: EkuboPool,
    token0: TokenInfo,
    token1: TokenInfo
  ): string {
    return `${token0.l2_token_address}-${token1.l2_token_address}-${pool.fee}-${pool.tick_spacing}`;
  }

  private async updatePoolSnapshot(
    pool: EkuboPool,
    token0: TokenInfo,
    token1: TokenInfo
  ) {
    const poolId = this.getPoolId(pool, token0, token1);
    const currentState = await this.getPoolState(pool, token0, token1);

    if (!currentState) return null;

    let snapshots = this.feeSnapshots.get(poolId) || [];
    snapshots.push(currentState);

    // Keep only last 30 days of snapshots
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    snapshots = snapshots.filter((s) => s.timestamp >= thirtyDaysAgo);

    this.feeSnapshots.set(poolId, snapshots);
    return currentState;
  }

  private calculateOnChainAPR(
    pool: EkuboPool,
    token0: TokenInfo,
    token1: TokenInfo,
    snapshots: FeeSnapshot[],
    token0Price: number,
    token1Price: number
  ): number {
    if (snapshots.length < 2) return 0;

    // Sort snapshots by timestamp
    snapshots.sort((a, b) => a.timestamp - b.timestamp);
    const oldestSnapshot = snapshots[0];
    const latestSnapshot = snapshots[snapshots.length - 1];

    // Calculate time elapsed in days
    const timeElapsedDays =
      (latestSnapshot.timestamp - oldestSnapshot.timestamp) / (24 * 60 * 60);
    if (timeElapsedDays === 0) return 0;

    // Calculate fee growth
    const feeGrowth0 =
      latestSnapshot.feesPerLiquidity0 - oldestSnapshot.feesPerLiquidity0;
    const feeGrowth1 =
      latestSnapshot.feesPerLiquidity1 - oldestSnapshot.feesPerLiquidity1;

    // Calculate average liquidity
    const avgLiquidity =
      (Number(latestSnapshot.liquidity) + Number(oldestSnapshot.liquidity)) / 2;

    // Calculate fees earned in token amounts
    // Calculate fees earned in token amounts
    const feesEarned0 = Number(
      (feeGrowth0 * BigInt(avgLiquidity)) / BigInt(2 ** 128)
    );
    const feesEarned1 = Number(
      (feeGrowth1 * BigInt(avgLiquidity)) / BigInt(2 ** 128)
    );

    // Convert to USD
    const feesUSD = feesEarned0 * token0Price + feesEarned1 * token1Price;

    // Calculate TVL
    const tvl0 = Number(latestSnapshot.liquidity) * token0Price;
    const tvl1 = Number(latestSnapshot.liquidity) * token1Price;
    const totalTVL = tvl0 + tvl1;

    if (totalTVL === 0) return 0;

    // Annualize the rate
    const annualizedFees = (feesUSD * 365) / timeElapsedDays;
    return (annualizedFees * 100) / totalTVL;
  }

  private normalizeFee(fee: string): number {
    const feeBI = BigInt(fee);
    const denominator = BigInt(2) ** BigInt(128);
    return Number((feeBI * BigInt(100)) / denominator);
  }

  private calculateVolumeBased24hAPR(
    pool: EkuboPool,
    token0: TokenInfo,
    token1: TokenInfo
  ): number {
    const token0Price =
      this.priceCache.get(this.normalizeAddress(token0.l2_token_address)) || 0;
    const token1Price =
      this.priceCache.get(this.normalizeAddress(token1.l2_token_address)) || 0;

    // Calculate TVL in USD
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
    const totalTVLUSD = tvl0USD + tvl1USD;

    if (totalTVLUSD === 0) return 0;

    // Calculate volume in USD
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
    const totalVolumeUSD = volume0USD + volume1USD;

    // Get fee percentage
    const feePercent = this.normalizeFee(pool.fee);

    // Calculate APR using fee percentage and volume
    return (totalVolumeUSD * (feePercent / 100) * 365 * 100) / totalTVLUSD;
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

      const stats = await Promise.all(
        response.data.topPools
          .filter(
            (pool) => pool.volume0_24h !== "0" || pool.volume1_24h !== "0"
          )
          .map(async (pool) => {
            const token0Price = this.priceCache.get(normalizedToken0) || 0;
            const token1Price = this.priceCache.get(normalizedToken1) || 0;

            // Get volume-based APR
            const volumeBasedAPR = this.calculateVolumeBased24hAPR(
              pool,
              token0,
              token1
            );

            // Get on-chain APR
            const poolId = this.getPoolId(pool, token0, token1);
            await this.updatePoolSnapshot(pool, token0, token1);
            const snapshots = this.feeSnapshots.get(poolId) || [];
            const onChainAPR =
              snapshots.length >= 2
                ? this.calculateOnChainAPR(
                    pool,
                    token0,
                    token1,
                    snapshots,
                    token0Price,
                    token1Price
                  )
                : null;

            // Calculate volume and TVL in USD
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
            return {
              token0Symbol: token0.symbol,
              token1Symbol: token1.symbol,
              fee: pool.fee,
              tickSpacing: pool.tick_spacing,
              extension: pool.extension,
              volume24h: {
                token0: pool.volume0_24h,
                token1: pool.volume1_24h,
                usd: volume0USD + volume1USD,
              },
              fees24h: {
                token0: pool.fees0_24h,
                token1: pool.fees1_24h,
                usd:
                  this.tokenToUSD(
                    pool.fees0_24h,
                    token0.decimals,
                    token0Price
                  ) +
                  this.tokenToUSD(pool.fees1_24h, token1.decimals, token1Price),
              },
              tvl: {
                token0: pool.tvl0_total,
                token1: pool.tvl1_total,
                usd: tvl0USD + tvl1USD,
              },
              apr: volumeBasedAPR,
              onChainApr: onChainAPR,
              tokens: {
                token0,
                token1,
              },
            };
          })
      );

      // Sort by TVL (highest first)
      return stats.sort((a, b) => b.tvl.usd - a.tvl.usd);
    } catch (error) {
      console.error(
        `Error fetching pool data for ${token0.symbol}/${token1.symbol}:`,
        error
      );
      return [];
    }
  }

  private tokenToUSD(amount: string, decimals: number, price: number): number {
    const value = Number(BigInt(amount)) / Math.pow(10, decimals);
    return value * price;
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

// ABI for the Ekubo contract
const ABI = [
  {
    name: "get_pool_liquidity",
    type: "function",
    inputs: [
      { name: "token0", type: "felt" },
      { name: "token1", type: "felt" },
      { name: "fee", type: "felt" },
      { name: "tick_spacing", type: "felt" },
      { name: "extension", type: "felt" },
    ],
    outputs: [{ name: "liquidity", type: "felt" }],
  },
  {
    name: "get_pool_price",
    type: "function",
    inputs: [
      { name: "token0", type: "felt" },
      { name: "token1", type: "felt" },
      { name: "fee", type: "felt" },
      { name: "tick_spacing", type: "felt" },
      { name: "extension", type: "felt" },
    ],
    outputs: [{ name: "sqrt_price", type: "felt" }],
  },
  {
    name: "get_pool_fees_per_liquidity",
    type: "function",
    inputs: [
      { name: "token0", type: "felt" },
      { name: "token1", type: "felt" },
      { name: "fee", type: "felt" },
      { name: "tick_spacing", type: "felt" },
      { name: "extension", type: "felt" },
    ],
    outputs: [
      { name: "fees_per_liquidity_0", type: "felt" },
      { name: "fees_per_liquidity_1", type: "felt" },
    ],
  },
];

export {
  WhitelistedEkuboFetcher,
  type PoolStats,
  type EkuboPool,
  type TokenInfo,
  type TokenPrice,
};
