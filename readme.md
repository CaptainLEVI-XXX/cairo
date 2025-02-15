# DeFi Protocol Technical Documentation

## Overview
This document outlines the technical architecture and implementation of DeFi protocol built for the Starknet blockchain. The protocol consists of two main components:
1. Pool Manager (ERC6909-compatible Vault)
2. Strategy Manager (Automated Investment Controller)

The protocol leverages AI-driven strategy selection through the Elizia AI agent to optimize yields across various DeFi strategies.

## Core Components

### 1. Pool Manager Contract
The Pool Manager implements both ERC6909 (Multi-Token Standard) and ERC4626 (Tokenized Vault Standard) specifications, providing a flexible and standardized vault system for multiple assets.

#### Key Features:
- Multi-asset support (ETH, USDT, USDC, etc.)
- ERC4626-compliant deposit/withdrawal mechanisms
- Asset registration system
- Share token minting/burning
- Access control and security measures

#### Core Functions:
- `deposit(tokenId, assets, receiver)`: Deposits assets and mints shares
- `withdraw(tokenId, assets, receiver, owner)`: Burns shares and returns assets
- `mint(tokenId, shares, receiver)`: Mints exact shares by depositing assets
- `redeem(tokenId, shares, receiver, owner)`: Redeems exact shares for assets
- `register_asset(vault_asset, name, symbol)`: Registers new assets in the vault
- `transfer_assets_to_strategy(requested_address)`: Transfers assets to strategies

### 2. Strategy Manager Contract
The Strategy Manager coordinates with the Elizia AI agent to optimize yield generation across different DeFi strategies.

#### Key Features:
- Strategy registration and management
- AI-driven fund allocation
- Asset conversion and routing
- JediSwap integration for token swaps
- Deposit tracking and history

## System Architecture

### Asset Flow
1. Users deposit assets into the Pool Manager
2. Pool Manager maintains asset registries and share tokens
3. Elizia AI agent triggers Strategy Manager
4. Strategy Manager:
   - Requests funds from Pool Manager
   - Converts assets to target token
   - Distributes to selected strategies

### Token Conversion Process
1. Assets are gathered from Pool Manager
2. JediSwap router converts tokens to target asset
3. Consolidated funds are sent to selected strategy

## System Flow Diagram

```mermaid
flowchart TB
    subgraph Users
        U1[User 1]
        U2[User 2]
        U3[User N]
    end

    subgraph PoolManager[Pool Manager Contract]
        PM1[Asset Registry]
        PM2[Share Tokens]
        PM3[ERC4626 Logic]
        PM4[Asset Transfer]
    end

    subgraph StrategyManager[Strategy Manager Contract]
        SM1[Strategy Registry]
        SM2[Fund Allocation]
        SM3[Token Conversion]
        SM4[Deposit Tracking]
    end

    subgraph External
        EA[Elizia AI Agent]
        JS[JediSwap]
        S1[Strategy 1]
        S2[Strategy 2]
        S3[Strategy N]
    end

    U1 & U2 & U3 -->|Deposit Assets| PoolManager
    EA -->|Request Fund Transfer| StrategyManager
    StrategyManager -->|Request Assets| PoolManager
    StrategyManager -->|Swap Tokens| JS
    StrategyManager -->|Deploy Funds| S1 & S2 & S3
    
    classDef contract fill:#f9f,stroke:#333,stroke-width:2px
    classDef external fill:#bbf,stroke:#333,stroke-width:2px
    class PoolManager,StrategyManager contract
    class EA,JS,S1,S2,S3 external
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant PM as Pool Manager
    participant SM as Strategy Manager
    participant EA as Elizia AI
    participant JS as JediSwap
    participant S as Strategy

    User->>PM: deposit(tokenId, assets, receiver)
    activate PM
    PM->>PM: mint shares
    PM-->>User: return share tokens
    deactivate PM

    EA->>SM: request_funds_from_pool()
    activate SM
    SM->>PM: transfer_assets_to_strategy()
    activate PM
    PM->>SM: return (amounts, assets)
    deactivate PM
    
    SM->>JS: approve(amount)
    SM->>JS: swap_exact_tokens_for_tokens()
    JS-->>SM: return swapped amounts
    
    SM->>S: deposit(amount)
    S-->>SM: confirm deposit
    
    SM-->>EA: return DepositedInfo
    deactivate SM
```

## Security Features

### Pool Manager
- Reentrancy protection
- Pausable functionality
- Upgradeable design
- Access control for admin functions
- Share token allowance system

### Strategy Manager
- Elizia-only access for fund requests
- Owner-restricted strategy management
- Reentrancy guards
- Deposit tracking and verification
- Slippage protection in swaps

## Integration Points

### External Protocols
- JediSwap: Used for token swaps and liquidity
- Elizia AI: Strategy selection and timing
- DeFi Strategies: Yield generation endpoints

### Internal Interfaces
- Pool Manager <-> Strategy Manager communication
- Strategy execution through dynamic selectors
- Event emission for tracking and monitoring
