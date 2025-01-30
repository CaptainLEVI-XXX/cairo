// src/types/myswap.types.ts
import { TokenInfo, BasePoolInfo, SwapEvent } from "./common";

export interface MySwapPool extends BasePoolInfo {
  poolId: number;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  reserves: {
    reserveA: string;
    reserveB: string;
  };
  volume7d: number;
  fees7d: number;
  feesUSD: number;
  lpToken: string;
}

export interface MySwapVolumeData {
  volume: {
    [token: string]: number;
  };
  volume_usd: {
    [token: string]: {
      native: number;
      usd: number;
    };
  };
  timestamp: number;
}

export interface MySwapTVLData {
  TVL: number;
  timestamp: number;
}

export interface MySwapPoolData {
  poolId: number;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  lpToken: string;
}

export interface MySwapSwapEvent extends SwapEvent {
  poolId: number;
}

export interface MySwapResponse {
  pools: MySwapPool[];
  totalValueLocked: number;
  volume7d: number;
  fees7d: number;
}
