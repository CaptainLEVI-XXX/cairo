import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, DollarSign, Coins, ArrowUpRight } from "lucide-react";

const Dashboard = () => {
  // Sample investment data
  const investments = [
    {
      id: "high-risk",
      name: "High Growth Vault",
      invested: 5000,
      currentValue: 5750,
      returns: 15,
      gradient: "from-rose-500 to-rose-600",
    },
    {
      id: "medium-risk",
      name: "Balanced Vault",
      invested: 10000,
      currentValue: 11200,
      returns: 12,
      gradient: "from-sky-500 to-sky-600",
    },
    {
      id: "low-risk",
      name: "Stable Vault",
      invested: 15000,
      currentValue: 15900,
      returns: 6,
      gradient: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Investment Dashboard
          </h1>
          <p className="text-gray-600">
            Track and manage your crypto investments
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Wallet className="w-4 h-4" />
                <span>Total Portfolio</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  $32,850
                </span>
                <span className="text-green-600 flex items-center text-sm">
                  +12.5%
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Total Earnings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">$2,850</span>
                <span className="text-green-600 flex items-center text-sm">
                  +8.2%
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Coins className="w-4 h-4" />
                <span>Average APY</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">11.2%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Investments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Active Investments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {investments.map((investment) => (
              <Card
                key={investment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${investment.gradient}`}
                    >
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-base">
                      {investment.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Invested</span>
                      <span className="font-medium text-gray-900">
                        ${investment.invested.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Value</span>
                      <span className="font-medium text-gray-900">
                        ${investment.currentValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Returns</span>
                      <span className="text-green-600 font-medium">
                        +{investment.returns}%
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Manage Investment
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
