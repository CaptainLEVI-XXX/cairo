// src/types/common.ts

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  pontis_key?: string;
  CEXSymbol?: string;
}

export interface BasePoolInfo {
  address: string;
  tvl: number;
  apr: number;
}

export interface ServiceConfig {
  rpcUrl: string;
  empiricKey?: string;
  cacheTime?: number;
}

export interface PriceData {
  [symbol: string]: {
    USD: number;
    timestamp: number;
  };
}

export interface SwapEvent {
  sender: string;
  recipient: string;
  amount0In: string;
  amount1In: string;
  amount0Out: string;
  amount1Out: string;
  timestamp: number;
  blockNumber: number;
}

export interface PoolStats {
  tvl: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  priceUSD?: number;
  utilization?: number;
  totalSupply?: string;
}
