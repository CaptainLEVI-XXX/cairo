// src/types/jediswap.types.ts
import { TokenInfo, BasePoolInfo, SwapEvent } from "./common";

export interface JediSwapPool extends BasePoolInfo {
  token0: TokenInfo;
  token1: TokenInfo;
  reserves: {
    reserve0: string;
    reserve1: string;
    blockTimestampLast: string;
  };
  volume24h: number;
  fees24h: number;
  feesUSD: number;
  totalSupply: string;
}

export interface JediSwapPairData {
  pair: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
}

export interface JediSwapReserves {
  reserve0: string;
  reserve1: string;
  blockTimestampLast: string;
}

export interface JediSwapSwapEvent extends SwapEvent {
  pair: string;
}

export interface JediSwapResponse {
  pools: JediSwapPool[];
  totalValueLocked: number;
  volume24h: number;
  fees24h: number;
}
