"use client"

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import Wallet from "../Wallet/Wallet";

const DeFiPlatform = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVault, setSelectedVault] = useState(null);

  const vaults = [
    {
      id: "high-risk",
      name: "High Growth Vault",
      description: "Aggressive growth strategy focusing on emerging crypto assets and DeFi protocols with higher potential returns",
      riskLevel: "High",
      color: "rose",
      icon: "📈",
      features: ["Emerging DeFi Assets", "Yield Optimization", "Active Rebalancing"],
      apy: 32.5,
      tvl: 2500000,
      tokens: [
        { symbol: "ETH", amount: "450", value: "1,200,000", bgColor: "bg-blue-500" },
        { symbol: "USDC", amount: "750,000", value: "750,000", bgColor: "bg-blue-400" },
        { symbol: "STRK", amount: "25,000", value: "500,000", bgColor: "bg-purple-500" }
      ]
    },
    {
      id: "medium-risk",
      name: "Balanced Vault",
      description: "Balanced approach with established crypto assets, providing moderate growth with managed risk",
      riskLevel: "Medium",
      color: "teal",
      icon: "⚖️",
      features: ["Blue-chip Assets", "Risk Management", "Regular Optimization"],
      apy: 18.7,
      tvl: 5000000,
      tokens: [
        { symbol: "ETH", amount: "300", value: "800,000", bgColor: "bg-blue-500" },
        { symbol: "USDC", amount: "500,000", value: "500,000", bgColor: "bg-blue-400" }
      ]
    },
    {
      id: "low-risk",
      name: "Stable Vault",
      description: "Conservative strategy focused on capital preservation using stablecoins and established assets",
      riskLevel: "Low",
      color: "indigo",
      icon: "🛡️",
      features: ["Stablecoin Focus", "Capital Protection", "Consistent Returns"],
      apy: 12.4,
      tvl: 8000000,
      tokens: [
        { symbol: "USDC", amount: "1,000,000", value: "1,000,000", bgColor: "bg-blue-400" },
        { symbol: "USDT", amount: "500,000", value: "500,000", bgColor: "bg-green-500" }
      ]
    }
  ];

  const VaultCard = ({ vault, onClick }) => (
    <div 
      className="bg-[#1a1b1f] rounded-lg p-6 cursor-pointer transition-all duration-200 hover:bg-[#1f2023]"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-opacity-20 flex items-center justify-center text-2xl">
          {vault.icon}
        </div>
        <div>
          <h3 className="text-xl font-medium text-gray-100">{vault.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{vault.description}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Risk Level</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            vault.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400' :
            vault.riskLevel === 'Medium' ? 'bg-teal-500/20 text-teal-400' :
            'bg-indigo-500/20 text-indigo-400'
          }`}>
            {vault.riskLevel}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Current APY</span>
          <span className="text-teal-400 font-medium">{vault.apy}%</span>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-3">Key Features</div>
          <div className="space-y-2">
            {vault.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const VaultDetails = ({ vault, onBack }) => (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg bg-[#1a1b1f] hover:bg-[#1f2023] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h2 className="text-2xl font-medium text-gray-100">{vault.name}</h2>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Value Locked', value: `$${(vault.tvl).toLocaleString()}` },
          { label: 'Current APY', value: `${vault.apy}%` },
          { label: 'Risk Level', value: vault.riskLevel },
          { label: 'Active Strategies', value: vault.tokens.length }
        ].map((stat, index) => (
          <div key={index} className="bg-[#1a1b1f] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
            <div className="text-xl font-medium text-gray-100">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1b1f] rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-100 mb-4">Token Distribution</h3>
        <div className="grid grid-cols-2 gap-4">
          {vault.tokens.map((token) => (
            <div key={token.symbol} className="bg-[#1f2023] rounded-lg p-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${token.bgColor} flex items-center justify-center text-white font-medium`}>
                    {token.symbol[0]}
                  </div>
                  <span className="text-gray-100">{token.symbol}</span>
                </div>
                <span className="text-teal-400">${token.value}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount Locked</span>
                <span className="text-gray-300">{token.amount} {token.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="text-xl font-medium text-teal-400">STRKTropy</div>
            <nav className="flex space-x-6">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`${currentPage === 'home' ? 'text-gray-100' : 'text-gray-500'}`}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  setCurrentPage('vaults');
                  setSelectedVault(null);
                }}
                className={`${currentPage === 'vaults' ? 'text-gray-100' : 'text-gray-500'}`}
              >
                Vaults
              </button>
            </nav>
          </div>
          <Wallet />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'vaults' && !selectedVault && (
          <>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-medium text-gray-100 mb-2">Investment Vaults</h1>
              <p className="text-gray-400">Select a vault strategy that matches your investment goals</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {vaults.map(vault => (
                <VaultCard
                  key={vault.id}
                  vault={vault}
                  onClick={() => setSelectedVault(vault)}
                />
              ))}
            </div>
          </>
        )}
        
        {currentPage === 'vaults' && selectedVault && (
          <VaultDetails
            vault={selectedVault}
            onBack={() => setSelectedVault(null)}
          />
        )}
      </main>
    </div>
  );
};

export default DeFiPlatform;