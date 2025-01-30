// // aprService.ts
// import { RpcProvider, Contract } from "starknet";
// import axios from "axios";
// import {
//   TokenInfo,
//   PoolInfo,
//   Reserves,
//   TokenPrices,
//   JediSwapAPR,
//   MySwapAPR,
//   ZKLendAPR,
//   AllAPRs,
//   MySwapVolumeData,
//   MySwapTVLData,
//   ZKLendPool,
// } from "../types/interfaceAPR";

// const ADDRESSES = {
//   JEDISWAP_FACTORY:
//     "0x01a40d8e899a4b755b21d3692397b5a19da7d1f5729247af151c4d67d5157609",
//   TOKENS: {
//     ETH: {
//       address:
//         "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
//       symbol: "ETH",
//       decimals: 18,
//     },
//     USDC: {
//       address:
//         "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
//       symbol: "USDC",
//       decimals: 6,
//     },
//     USDT: {
//       address:
//         "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
//       symbol: "USDT",
//       decimals: 6,
//     },
//     DAI: {
//       address:
//         "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
//       symbol: "DAI",
//       decimals: 18,
//     },
//     WBTC: {
//       address:
//         "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
//       symbol: "WBTC",
//       decimals: 8,
//     },
//   } as const,
// };

// const JEDISWAP_FACTORY_ABI = [
//   {
//     name: "get_pair",
//     type: "function",
//     inputs: [
//       { name: "token0", type: "felt" },
//       { name: "token1", type: "felt" },
//     ],
//     outputs: [{ name: "pair", type: "felt" }],
//     stateMutability: "view",
//   },
// ] as const;

// const JEDISWAP_PAIR_ABI = [
//   {
//     name: "get_reserves",
//     type: "function",
//     inputs: [],
//     outputs: [
//       { name: "reserve0", type: "felt" },
//       { name: "reserve1", type: "felt" },
//       { name: "block_timestamp_last", type: "felt" },
//     ],
//     stateMutability: "view",
//   },
// ] as const;

// export class StarkNetAPRService {
//   private provider: RpcProvider;
//   private readonly FEE_PERCENTAGE = 0.003;
//   private readonly DAYS_TO_ANALYZE = 7;
//   private factoryContract: Contract;

//   constructor(rpcUrl: string) {
//     this.provider = new RpcProvider({ nodeUrl: rpcUrl });
//     this.factoryContract = new Contract(
//       JEDISWAP_FACTORY_ABI,
//       ADDRESSES.JEDISWAP_FACTORY,
//       this.provider
//     );
//   }

//   async getJediSwapAPRs(): Promise<JediSwapAPR[]> {
//     try {
//       const pairs = await this._fetchJediSwapPairs();
//       const aprPromises = pairs.map(async (pair) => {
//         const volume = await this._fetchJediSwapVolume(pair.address);
//         const [reserves, prices] = await Promise.all([
//           this._getReserves(pair.address),
//           this._fetchTokenPrices([pair.token0.symbol, pair.token1.symbol]),
//         ]);

//         const tvl = this._calculateTVL(reserves, prices, pair);
//         const apr = this._calculateAPR(volume, tvl);

//         return {
//           protocol: "JediSwap" as const,
//           pair: `${pair.token0.symbol}/${pair.token1.symbol}`,
//           address: pair.address,
//           apr,
//           tvl,
//           volume24h: volume,
//           reserves,
//         };
//       });

//       return await Promise.all(aprPromises);
//     } catch (error) {
//       console.error("Error fetching JediSwap APRs:", error);
//       return [];
//     }
//   }

//   async getMySwapAPRs(): Promise<MySwapAPR[]> {
//     try {
//       const pools = [
//         { pair: "ETH-USDC", number: 1 },
//         { pair: "ETH-USDT", number: 4 },
//         { pair: "ETH-DAI", number: 2 },
//         { pair: "USDT-USDC", number: 5 },
//         { pair: "USDC-DAI", number: 6 },
//       ] as const;

//       const aprPromises = pools.map(async (pool) => {
//         const [volume, tvlData] = await Promise.all([
//           this._fetchMySwapVolume(pool.number),
//           this._fetchMySwapTVL(pool.number),
//         ]);

//         const tvl = tvlData[0]?.TVL || 0;
//         const apr = this._calculateAPR(volume, tvl);

//         return {
//           protocol: "MySwap" as const,
//           pair: pool.pair,
//           poolNumber: pool.number,
//           apr,
//           tvl,
//           volume24h: volume,
//         };
//       });

//       return await Promise.all(aprPromises);
//     } catch (error) {
//       console.error("Error fetching MySwap APRs:", error);
//       return [];
//     }
//   }

//   async getZKLendAPRs(): Promise<ZKLendAPR[]> {
//     try {
//       const response = await axios.get<{ data: ZKLendPool[] }>(
//         "https://app.zklend.com/api/pools"
//       );
//       const data = response.data;

//       return data.data
//         .filter((pool) =>
//           ["STRK", "ETH", "USDC", "USDT"].includes(pool.token.symbol)
//         )
//         .map((pool) => {
//           const tvl = this._calculateZKLendTVL(pool);
//           return {
//             protocol: "ZKLend" as const,
//             asset: pool.token.symbol,
//             address: pool.token.address,
//             apr: pool.lending_apy.net_apy,
//             borrowApr: pool.borrowing_apy.net_apy,
//             tvl,
//             totalSupply: pool.total_supply_tokens,
//             totalBorrow: pool.total_borrow_tokens,
//           };
//         });
//     } catch (error) {
//       console.error("Error fetching ZKLend APRs:", error);
//       return [];
//     }
//   }

//   async getAllAPRs(): Promise<AllAPRs> {
//     const [jediSwap, mySwap, zkLend] = await Promise.all([
//       this.getJediSwapAPRs(),
//       this.getMySwapAPRs(),
//       this.getZKLendAPRs(),
//     ]);

//     return { jediSwap, mySwap, zkLend };
//   }

//   private async _fetchJediSwapPairs(): Promise<PoolInfo[]> {
//     const tokens = Object.values(ADDRESSES.TOKENS);
//     const tokenPairs: Array<{ token0: TokenInfo; token1: TokenInfo }> = [];

//     // Create all possible pairs avoiding duplicates
//     for (let i = 0; i < tokens.length; i++) {
//       for (let j = i + 1; j < tokens.length; j++) {
//         tokenPairs.push({
//           token0: {
//             address: tokens[i].address,
//             symbol: tokens[i].symbol,
//             decimals: tokens[i].decimals,
//           },
//           token1: {
//             address: tokens[j].address,
//             symbol: tokens[j].symbol,
//             decimals: tokens[j].decimals,
//           },
//         });
//       }
//     }

//     const validPairs: PoolInfo[] = [];

//     for (const { token0, token1 } of tokenPairs) {
//       try {
//         const pairAddress = await this.factoryContract.get_pair(
//           token0.address,
//           token1.address
//         );
//         if (pairAddress) {
//           validPairs.push({
//             token0,
//             token1,
//             address: pairAddress.toString(),
//           });
//         }
//       } catch (error) {
//         console.error(
//           `Error fetching pair for ${token0.symbol}/${token1.symbol}:`,
//           error
//         );
//       }
//     }

//     return validPairs;
//   }

//   private async _getReserves(pairAddress: string): Promise<Reserves> {
//     const pairContract = new Contract(
//       JEDISWAP_PAIR_ABI,
//       pairAddress,
//       this.provider
//     );
//     const { reserve0, reserve1 } = await pairContract.get_reserves();
//     return {
//       reserve0: reserve0.toString(),
//       reserve1: reserve1.toString(),
//     };
//   }

//   private async _fetchJediSwapVolume(_pairAddress: string): Promise<number> {
//     // Mock implementation - replace with actual API call
//     return Math.random() * 1000000;
//   }

//   private async _fetchTokenPrices(tokens: string[]): Promise<number[]> {
//     // Mock implementation - replace with actual price feed
//     const mockPrices: TokenPrices = {
//       ETH: 3000,
//       USDC: 1,
//       USDT: 1,
//       DAI: 1,
//       WBTC: 50000,
//     };
//     return tokens.map((token) => mockPrices[token] || 0);
//   }

//   private async _fetchMySwapVolume(poolNumber: number): Promise<number> {
//     try {
//       const response = await axios.get<{ data: MySwapVolumeData[] }>(
//         `https://ddektitdlncgg.cloudfront.net/myswapapi/pool/${poolNumber}/volume`
//       );

//       let totalVolume = 0;
//       const volumeData = response.data.data.slice(0, this.DAYS_TO_ANALYZE);
//       volumeData.forEach((day) => {
//         Object.values(day.volume_usd).forEach((tokenVol) => {
//           totalVolume += tokenVol.usd;
//         });
//       });
//       return totalVolume / this.DAYS_TO_ANALYZE;
//     } catch (error) {
//       console.error(
//         `Error fetching MySwap volume for pool ${poolNumber}:`,
//         error
//       );
//       return 0;
//     }
//   }

//   private async _fetchMySwapTVL(poolNumber: number): Promise<MySwapTVLData[]> {
//     try {
//       const response = await axios.get<{ data: MySwapTVLData[] }>(
//         `https://ddektitdlncgg.cloudfront.net/myswapapi/pool/${poolNumber}/tvl.json`
//       );
//       return response.data.data;
//     } catch (error) {
//       console.error(`Error fetching MySwap TVL for pool ${poolNumber}:`, error);
//       return [{ TVL: 0 }];
//     }
//   }

//   private _calculateAPR(volumeUSD: number, tvlUSD: number): number {
//     if (!tvlUSD || tvlUSD === 0) return 0;
//     const dailyFees = volumeUSD * this.FEE_PERCENTAGE;
//     return ((dailyFees / tvlUSD + 1) ** (365 / this.DAYS_TO_ANALYZE) - 1) * 100;
//   }

//   private _calculateTVL(
//     reserves: Reserves,
//     prices: number[],
//     pool: PoolInfo
//   ): number {
//     const token0Value =
//       (Number(reserves.reserve0) / 10 ** pool.token0.decimals) * prices[0];
//     const token1Value =
//       (Number(reserves.reserve1) / 10 ** pool.token1.decimals) * prices[1];
//     return token0Value + token1Value;
//   }

//   private _calculateZKLendTVL(pool: ZKLendPool): number {
//     const price = parseInt(pool.price.price) / 10 ** pool.price.decimals;
//     const supply = parseInt(pool.supply_amount) / 10 ** pool.token.decimals;
//     return price * supply;
//   }
// }
