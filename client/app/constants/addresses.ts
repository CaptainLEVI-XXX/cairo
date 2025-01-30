// src/constants/addresses.ts
export const ADDRESSES = {
  JEDISWAP: {
    FACTORY:
      "0x01a40d8e899a4b755b21d3692397b5a19da7d1f5729247af151c4d67d5157609",
    ROUTER: "0x041fd22b238fa21cfb074f0d8d1c02f0fe324bb9dba2d0f6f265292e162ba4c",
  },
  MYSWAP: {
    ROUTER:
      "0x01a40d8e899a4b755b21d3692397b5a19da7d1f5729247af151c4d67d5157609",
  },
  ZKLEND: {
    LENDING_POOL:
      "0x4c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05",
  },
  EMPIRIC_PROXY:
    "0x012fadd803960d4f173cc5194506eb7aa84e0c9007b88f84016d7f570094b154",
  TOKENS: {
    ETH: {
      address:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      symbol: "ETH",
      decimals: 18,
      pontis_key: "ETH/USD",
      CEXSymbol: "ETH",
    },
    USDC: {
      address:
        "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
      symbol: "USDC",
      decimals: 6,
      pontis_key: "USDC/USD",
      CEXSymbol: "USDC",
    },
    USDT: {
      address:
        "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
      symbol: "USDT",
      decimals: 6,
      pontis_key: "USDT/USD",
      CEXSymbol: "USDT",
    },
    DAI: {
      address:
        "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
      symbol: "DAI",
      decimals: 18,
      pontis_key: "DAI/USD",
      CEXSymbol: "DAI",
    },
    WBTC: {
      address:
        "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
      symbol: "WBTC",
      decimals: 8,
      pontis_key: "BTC/USD",
      CEXSymbol: "BTC",
    },
  },
} as const;

// src/constants/config.ts
export const CONFIG = {
  MYSWAP: {
    API_BASE_URL: "https://ddektitdlncgg.cloudfront.net/myswapapi/pool",
    SUPPORTED_POOLS: [
      { pair: "ETH-USDC", number: 1 },
      { pair: "ETH-USDT", number: 4 },
      { pair: "ETH-DAI", number: 2 },
      { pair: "USDT-USDC", number: 5 },
      { pair: "USDC-DAI", number: 6 },
    ],
  },
  ZKLEND: {
    API_URL: "https://app.zklend.com/api/pools",
    SUPPORTED_TOKENS: ["STRK", "ETH", "USDC", "USDT"],
  },
  EMPIRIC: {
    AGGREGATION_MODE: "84959893733710",
  },
  NETWORK: {
    BLOCK_TIME: 3, // seconds
    BLOCKS_PER_DAY: 28800, // 24 * 60 * 60 / BLOCK_TIME
  },
  APR: {
    DAYS_TO_ANALYZE: 7,
    FEE_PERCENTAGE: 0.003,
    MIN_TVL: 1000, // Minimum TVL to consider pool active
  },
} as const;
