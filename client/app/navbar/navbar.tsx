import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Home, Wallet } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
              CryptoVault
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center space-x-4">
            <Button variant="ghost" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Invest
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Dashboard
            </Button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost">Sign In</Button>
            <Button className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:opacity-90">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
