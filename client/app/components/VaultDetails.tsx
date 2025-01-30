import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Coins,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  Activity,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VaultDetailsProps {
  vault: {
    id: string;
    name: string;
    description: string;
    riskLevel: string;
    gradient: string;
    tvl: number;
    apy: number;
  };
  onBack: () => void; // Add this line
}

const VaultDetails: React.FC<VaultDetailsProps> = ({ vault }) => {
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInvest = async () => {
    setIsLoading(true);
    try {
      // Add your investment logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      console.log("Investment processed:", {
        vaultId: vault.id,
        amount: investmentAmount,
      });
    } catch (error) {
      console.error("Investment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateExpectedReturns = (amount: string) => {
    const principal = parseFloat(amount) || 0;
    const annualReturn = (principal * vault.apy) / 100;
    return {
      monthly: annualReturn / 12,
      annual: annualReturn,
    };
  };

  const returns = calculateExpectedReturns(investmentAmount);

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg bg-gradient-to-r ${vault.gradient}`}
            >
              <Coins className="w-6 h-6 text-zinc-100" />
            </div>
            <div>
              <CardTitle className="text-2xl text-zinc-100">
                {vault.name}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                {vault.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <DollarSign className="w-4 h-4" />
                  Total Value Locked
                </div>
                <div className="text-xl font-bold text-zinc-100">
                  {formatCurrency(vault.tvl)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Current APY
                </div>
                <div className="text-xl font-bold text-teal-400">
                  {vault.apy}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <Users className="w-4 h-4" />
                  Active Investors
                </div>
                <div className="text-xl font-bold text-zinc-100">1,234</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <Activity className="w-4 h-4" />
                  Risk Level
                </div>
                <div
                  className={`text-xl font-bold bg-gradient-to-r ${vault.gradient} bg-clip-text text-transparent`}
                >
                  {vault.riskLevel}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Allocation */}
          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100">
                Investment Allocation
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Current distribution across networks and protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Network Distribution */}
              <div>
                <div className="text-sm font-medium text-zinc-100 mb-4">
                  Network Distribution
                </div>
                <div className="space-y-4">
                  {[
                    {
                      network: "Starknet",
                      percentage: 45,
                      color: "bg-indigo-500",
                    },
                    {
                      network: "Ethereum",
                      percentage: 30,
                      color: "bg-blue-500",
                    },
                    {
                      network: "Arbitrum",
                      percentage: 15,
                      color: "bg-purple-500",
                    },
                    {
                      network: "Optimism",
                      percentage: 10,
                      color: "bg-red-500",
                    },
                  ].map((item) => (
                    <div key={item.network} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">{item.network}</span>
                        <span className="text-zinc-400">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-300`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol Distribution */}
              <div>
                <div className="text-sm font-medium text-zinc-100 mb-4">
                  Protocol Distribution
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { protocol: "MakerDAO", amount: "2.5M", percentage: 25 },
                    { protocol: "Aave", amount: "2M", percentage: 20 },
                    { protocol: "Curve", amount: "1.5M", percentage: 15 },
                    { protocol: "Lido", amount: "1.5M", percentage: 15 },
                    { protocol: "Uniswap", amount: "1M", percentage: 10 },
                    { protocol: "Others", amount: "1.5M", percentage: 15 },
                  ].map((item) => (
                    <div
                      key={item.protocol}
                      className="bg-zinc-900/50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-zinc-200 font-medium">
                          {item.protocol}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {item.percentage}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-zinc-300">{item.amount}</div>
                        <div className="text-xs text-zinc-500">TVL</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-Rebalancing Info */}
              <Alert className="bg-zinc-900/50 border-teal-500/20">
                <AlertDescription className="text-zinc-400 flex items-start gap-2">
                  <Activity className="w-4 h-4 text-teal-400 mt-0.5" />
                  <span>
                    Portfolio is automatically rebalanced to maintain optimal
                    risk-adjusted returns across networks and protocols.
                  </span>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Investment Section */}
          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100">
                Invest in Vault
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Enter the amount you want to invest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <Input
                    type="number"
                    placeholder="Enter investment amount"
                    value={investmentAmount}
                    onChange={(e: {
                      target: { value: React.SetStateAction<string> };
                    }) => setInvestmentAmount(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {investmentAmount && parseFloat(investmentAmount) > 0 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-zinc-900/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">
                        Expected Monthly Returns
                      </span>
                      <span className="text-teal-400">
                        {formatCurrency(returns.monthly)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">
                        Expected Annual Returns
                      </span>
                      <span className="text-teal-400">
                        {formatCurrency(returns.annual)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleInvest}
                disabled={
                  !investmentAmount ||
                  parseFloat(investmentAmount) <= 0 ||
                  isLoading
                }
                className={`w-full bg-gradient-to-r ${vault.gradient} text-white hover:opacity-90 transition-opacity`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-zinc-100/30 border-t-zinc-100 rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Invest Now"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Vault Security */}
          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <CardTitle className="text-lg text-zinc-100">
                  Vault Security
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1.5 rounded-full bg-teal-400/10">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-100 mb-1">
                    Smart Contract Audited
                  </div>
                  <div className="text-zinc-400">
                    All smart contracts are thoroughly audited by leading
                    security firms
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1.5 rounded-full bg-teal-400/10">
                  <Wallet className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-100 mb-1">
                    Asset Security
                  </div>
                  <div className="text-zinc-400">
                    Assets are secured using industry-leading custody solutions
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1.5 rounded-full bg-teal-400/10">
                  <Activity className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-100 mb-1">
                    24/7 Monitoring
                  </div>
                  <div className="text-zinc-400">
                    Continuous monitoring and risk assessment of all positions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default VaultDetails;
