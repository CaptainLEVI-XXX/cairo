export const PoolManagerABI = [
  {
    name: "PoolManager",
    type: "impl",
    interface_name: "cairo::interfaces::iPoolManager::IPoolManager",
  },
  {
    name: "core::integer::u256",
    type: "struct",
    members: [
      {
        name: "low",
        type: "core::integer::u128",
      },
      {
        name: "high",
        type: "core::integer::u128",
      },
    ],
  },
  {
    name: "core::bool",
    type: "enum",
    variants: [
      {
        name: "False",
        type: "()",
      },
      {
        name: "True",
        type: "()",
      },
    ],
  },
  {
    name: "cairo::interfaces::iPoolManager::IPoolManager",
    type: "interface",
    items: [
      {
        name: "register_asset",
        type: "function",
        inputs: [
          {
            name: "vault_asset",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "name",
            type: "core::felt252",
          },
          {
            name: "symbol",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "total_assets",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "asset",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "asset_to_tokenId",
        type: "function",
        inputs: [
          {
            name: "vault_asset",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "convert_to_assets",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::felt252",
          },
          {
            name: "shares",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "convert_to_shares",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::felt252",
          },
          {
            name: "assets",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "max_deposit",
        type: "function",
        inputs: [
          {
            name: "vault_asset",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "max_mint",
        type: "function",
        inputs: [
          {
            name: "vault_asset",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "max_withdraw",
        type: "function",
        inputs: [
          {
            name: "vault_asset",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "max_redeem",
        type: "function",
        inputs: [
          {
            name: "vault_asset",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "preview_deposit",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::felt252",
          },
          {
            name: "assets",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "preview_mint",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::felt252",
          },
          {
            name: "shares",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "preview_withdraw",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::felt252",
          },
          {
            name: "assets",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "preview_redeem",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::felt252",
          },
          {
            name: "shares",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "total_supply",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "name",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "symbol",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "decimals",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::integer::u8",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "deposit",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
          {
            name: "assets",
            type: "core::integer::u256",
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "mint",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
          {
            name: "shares",
            type: "core::integer::u256",
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "withdraw",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
          {
            name: "assets",
            type: "core::integer::u256",
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "redeem",
        type: "function",
        inputs: [
          {
            name: "tokenId",
            type: "core::felt252",
          },
          {
            name: "shares",
            type: "core::integer::u256",
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "upgrade_class_hash",
        type: "function",
        inputs: [
          {
            name: "class_hash",
            type: "core::starknet::class_hash::ClassHash",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "set_operator",
        type: "function",
        inputs: [
          {
            name: "operator",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "approved",
            type: "core::bool",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "approve",
        type: "function",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "id",
            type: "core::felt252",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "transfer_from",
        type: "function",
        inputs: [
          {
            name: "from",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "to",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "id",
            type: "core::felt252",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "transfer",
        type: "function",
        inputs: [
          {
            name: "to",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "id",
            type: "core::felt252",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "allowance",
        type: "function",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "id",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "is_operator",
        type: "function",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "operator",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "balance_of",
        type: "function",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "id",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        name: "pause",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "unpause",
        type: "function",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "transfer_assets_to_strategy",
        type: "function",
        inputs: [
          {
            name: "requested_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "(core::array::Array::<core::integer::u256>, core::array::Array::<core::starknet::contract_address::ContractAddress>)",
          },
        ],
        state_mutability: "external",
      },
      {
        name: "set_strategy_manager",
        type: "function",
        inputs: [
          {
            name: "_strategy_manager",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "get_registered_assets",
        type: "function",
        inputs: [],
        outputs: [
          {
            type: "core::array::Array::<core::starknet::contract_address::ContractAddress>",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
  {
    name: "constructor",
    type: "constructor",
    inputs: [
      {
        name: "owner_",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "strategy_manager_",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "struct",
    name: "cairo::PoolManager::PoolManager::Deposit",
    type: "event",
    members: [
      {
        kind: "key",
        name: "id",
        type: "core::felt252",
      },
      {
        kind: "key",
        name: "caller",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "data",
        name: "assets",
        type: "core::integer::u256",
      },
      {
        kind: "data",
        name: "shares",
        type: "core::integer::u256",
      },
    ],
  },
  {
    kind: "struct",
    name: "cairo::PoolManager::PoolManager::Withdraw",
    type: "event",
    members: [
      {
        kind: "key",
        name: "id",
        type: "core::felt252",
      },
      {
        kind: "key",
        name: "caller",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "receiver",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "data",
        name: "assets",
        type: "core::integer::u256",
      },
      {
        kind: "data",
        name: "shares",
        type: "core::integer::u256",
      },
    ],
  },
  {
    kind: "struct",
    name: "cairo::PoolManager::PoolManager::AssetRegistered",
    type: "event",
    members: [
      {
        kind: "key",
        name: "vault_asset",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "tokenId",
        type: "core::felt252",
      },
      {
        kind: "data",
        name: "name",
        type: "core::felt252",
      },
      {
        kind: "data",
        name: "symbol",
        type: "core::felt252",
      },
    ],
  },
  {
    kind: "struct",
    name: "cairo::PoolManager::PoolManager::Transfer",
    type: "event",
    members: [
      {
        kind: "key",
        name: "from",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "to",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "id",
        type: "core::felt252",
      },
      {
        kind: "key",
        name: "amount",
        type: "core::integer::u256",
      },
    ],
  },
  {
    kind: "struct",
    name: "cairo::PoolManager::PoolManager::OperatorSet",
    type: "event",
    members: [
      {
        kind: "key",
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "data",
        name: "approved",
        type: "core::bool",
      },
    ],
  },
  {
    kind: "struct",
    name: "cairo::PoolManager::PoolManager::Approval",
    type: "event",
    members: [
      {
        kind: "key",
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "id",
        type: "core::felt252",
      },
      {
        kind: "data",
        name: "amount",
        type: "core::integer::u256",
      },
    ],
  },
  {
    kind: "struct",
    name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
    type: "event",
    members: [
      {
        kind: "data",
        name: "class_hash",
        type: "core::starknet::class_hash::ClassHash",
      },
    ],
  },
  {
    kind: "enum",
    name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Upgraded",
        type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
      },
    ],
  },
  {
    kind: "enum",
    name: "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
    type: "event",
    variants: [],
  },
  {
    kind: "enum",
    name: "openzeppelin_introspection::src5::SRC5Component::Event",
    type: "event",
    variants: [],
  },
  {
    kind: "struct",
    name: "openzeppelin_security::pausable::PausableComponent::Paused",
    type: "event",
    members: [
      {
        kind: "data",
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "struct",
    name: "openzeppelin_security::pausable::PausableComponent::Unpaused",
    type: "event",
    members: [
      {
        kind: "data",
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "enum",
    name: "openzeppelin_security::pausable::PausableComponent::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Paused",
        type: "openzeppelin_security::pausable::PausableComponent::Paused",
      },
      {
        kind: "nested",
        name: "Unpaused",
        type: "openzeppelin_security::pausable::PausableComponent::Unpaused",
      },
    ],
  },
  {
    kind: "enum",
    name: "cairo::PoolManager::PoolManager::Event",
    type: "event",
    variants: [
      {
        kind: "nested",
        name: "Deposit",
        type: "cairo::PoolManager::PoolManager::Deposit",
      },
      {
        kind: "nested",
        name: "Withdraw",
        type: "cairo::PoolManager::PoolManager::Withdraw",
      },
      {
        kind: "nested",
        name: "AssetRegistered",
        type: "cairo::PoolManager::PoolManager::AssetRegistered",
      },
      {
        kind: "nested",
        name: "Transfer",
        type: "cairo::PoolManager::PoolManager::Transfer",
      },
      {
        kind: "nested",
        name: "OperatorSet",
        type: "cairo::PoolManager::PoolManager::OperatorSet",
      },
      {
        kind: "nested",
        name: "Approval",
        type: "cairo::PoolManager::PoolManager::Approval",
      },
      {
        kind: "flat",
        name: "UpgradeableEvent",
        type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
      },
      {
        kind: "flat",
        name: "ReentracnyGuardEvent",
        type: "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
      },
      {
        kind: "flat",
        name: "SRC5Event",
        type: "openzeppelin_introspection::src5::SRC5Component::Event",
      },
      {
        kind: "flat",
        name: "PausableEvent",
        type: "openzeppelin_security::pausable::PausableComponent::Event",
      },
    ],
  },
] as const;
