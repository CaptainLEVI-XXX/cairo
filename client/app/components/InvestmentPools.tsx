import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  Coins,
  BarChart3,
  Percent,
  DollarSign,
  Activity,
} from "lucide-react";

export interface Pool {
  id: string;
  name: string;
  riskLevel: string;
  expectedReturn: number;
  currentAllocation: number;
  tokens: Array<{
    symbol: string;
    allocation: number;
    price: number;
  }>;
  aiConfidence: number;
  volume24h: number;
  tvl: number;
}

interface InvestmentPoolsProps {
  selectedStrategy: string;
  investmentType: "sip" | "lump";
  onInvestmentProceed: (poolId: string) => void;
}

const InvestmentPools: React.FC<InvestmentPoolsProps> = ({
  selectedStrategy,
  investmentType,
  onInvestmentProceed,
}) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        // Mock data for demonstration
        const mockPools = [
          {
            id: "pool-1",
            name: "DeFi Yield Maximizer",
            riskLevel: "High",
            expectedReturn: 32.5,
            currentAllocation: 40,
            tokens: [
              { symbol: "ETH", allocation: 40, price: 3245.67 },
              { symbol: "AAVE", allocation: 30, price: 89.45 },
              { symbol: "UNI", allocation: 30, price: 12.34 },
            ],
            aiConfidence: 85,
            volume24h: 1500000,
            tvl: 25000000,
          },
          {
            id: "pool-2",
            name: "Emerging L1s Portfolio",
            riskLevel: "High",
            expectedReturn: 28.8,
            currentAllocation: 60,
            tokens: [
              { symbol: "SOL", allocation: 35, price: 123.45 },
              { symbol: "AVAX", allocation: 35, price: 34.56 },
              { symbol: "MATIC", allocation: 30, price: 2.34 },
            ],
            aiConfidence: 78,
            volume24h: 2100000,
            tvl: 18000000,
          },
        ];

        setPools(mockPools);
      } catch (err) {
        setError("Failed to fetch investment pools");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [selectedStrategy, investmentType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center text-zinc-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mr-3"></div>
            Loading investment pools...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-zinc-100">
          AI-Analyzed Investment Pools
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Recommended pools based on your {selectedStrategy.replace("-", " ")}{" "}
          strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {pools.map((pool) => (
            <Card
              key={pool.id}
              className="bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-zinc-100 mb-2">
                      {pool.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Activity className="w-4 h-4" />
                      <span>Risk Level:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          pool.riskLevel === "High"
                            ? "bg-rose-500/20 text-rose-300"
                            : pool.riskLevel === "Medium"
                            ? "bg-teal-500/20 text-teal-300"
                            : "bg-indigo-500/20 text-indigo-300"
                        }`}
                      >
                        {pool.riskLevel}
                      </span>
                    </div>
                  </div>
                  <Alert className="bg-teal-500/10 border-teal-500/20">
                    <AlertDescription className="text-teal-300 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      AI Confidence:{" "}
                      <span className="font-bold">{pool.aiConfidence}%</span>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                        <Percent className="w-4 h-4" />
                        Expected Return
                      </div>
                      <div className="text-xl font-bold text-teal-400">
                        {pool.expectedReturn}% APY
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                        <DollarSign className="w-4 h-4" />
                        24h Volume
                      </div>
                      <div className="text-xl font-bold text-zinc-100">
                        {formatCurrency(pool.volume24h)}
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                        <Coins className="w-4 h-4" />
                        Total Value Locked
                      </div>
                      <div className="text-xl font-bold text-zinc-100">
                        {formatCurrency(pool.tvl)}
                      </div>
                    </div>
                  </div>

                  {/* Token Allocation */}
                  <div className="space-y-4">
                    <div className="text-sm text-zinc-400">
                      Token Allocation
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {pool.tokens.map((token) => (
                        <div
                          key={token.symbol}
                          className="bg-zinc-800/50 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <div className="text-zinc-100 font-medium">
                              {token.symbol}
                            </div>
                            <div className="text-sm text-zinc-400">
                              {token.allocation}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-zinc-100">
                              {formatCurrency(token.price)}
                            </div>
                            <div className="text-xs text-zinc-400">
                              Current Price
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pool Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Pool Allocation</span>
                      <span className="text-zinc-100">
                        {pool.currentAllocation}%
                      </span>
                    </div>
                    <Progress
                      value={pool.currentAllocation}
                      className="h-2 bg-zinc-800"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <Button
                  onClick={() => onInvestmentProceed(pool.id)}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                >
                  Invest in this Pool
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentPools;
