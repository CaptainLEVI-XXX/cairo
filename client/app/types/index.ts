import { PoolStats } from "./common";
import { JediSwapPool } from "./jediswap.types";
import { MySwapPool } from "./myswap.types";
import { ZKLendPool } from "./zklend.types";

// src/types/index.ts
export * from "./common";
export * from "./jediswap.types";
export * from "./myswap.types";
export * from "./zklend.types";

// Combined types for full protocol data
export interface ProtocolData {
  jediswap: {
    pools: JediSwapPool[];
    totalValueLocked: number;
    volume24h: number;
    fees24h: number;
  };
  myswap: {
    pools: MySwapPool[];
    totalValueLocked: number;
    volume7d: number;
    fees7d: number;
  };
  zklend: {
    markets: ZKLendPool[];
    totalValueLocked: number;
    totalBorrowed: number;
  };
}

// APR data type for unified response
export interface APRData {
  protocol: "JediSwap" | "MySwap" | "ZKLend";
  pair?: string;
  token?: string;
  address: string;
  apr: number;
  tvl: number;
  volume24h?: number;
  fees24h?: number;
  borrowAPR?: number;
  utilization?: number;
}

// Error types
export interface ServiceError extends Error {
  code?: string;
  details?: never;
  protocol?: string;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface PoolCache {
  [protocol: string]: {
    [poolAddress: string]: CacheEntry<PoolStats>;
  };
}
