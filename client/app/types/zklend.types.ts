// src/types/zklend.types.ts
import { TokenInfo, BasePoolInfo } from "./common";

export interface ZKLendPool extends BasePoolInfo {
  token: TokenInfo;
  marketSize: {
    amount: string;
    usd: number;
  };
  totalBorrow: {
    amount: string;
    usd: number;
  };
  utilization: number;
  apys: {
    deposit: {
      base: number;
      reward: number;
      total: number;
    };
    borrow: {
      base: number;
      reward: number;
      total: number;
    };
  };
  price: {
    value: string;
    decimals: number;
  };
}

export interface ZKLendMarketData {
  token: {
    symbol: string;
    address: string;
    decimals: number;
  };
  price: {
    price: string;
    decimals: number;
  };
  lending_apy: {
    net_apy: number;
    base_apy: number;
    reward_apy: number;
  };
  borrowing_apy: {
    net_apy: number;
    base_apy: number;
    reward_apy: number;
  };
  total_supply_tokens: string;
  total_borrow_tokens: string;
  supply_amount: string;
}

export interface ZKLendResponse {
  markets: ZKLendPool[];
  totalValueLocked: number;
  totalBorrowed: number;
}
