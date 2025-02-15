use starknet::{ContractAddress, ClassHash};

/// Trait defining the interface for a Pool Manager smart contract in StarkNet.
/// This trait provides methods to manage assets, perform conversions, and handle deposits,
/// withdrawals, minting, and redeeming.
#[starknet::interface]
pub trait IPoolManager<TContractState> {
    /// Registers a new asset in the pool.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `vault_asset`: Address of the asset to register.
    /// - `name`: Name of the asset as a `felt252`.
    /// - `symbol`: Symbol of the asset as a `felt252`.
    /// Returns:
    /// - A unique identifier (`felt252`) for the registered asset.
    fn register_asset(
        ref self: TContractState, vault_asset: ContractAddress, name: felt252, symbol: felt252,
    ) -> felt252;

    // Uncomment if needed: Fetches an array of all registered asset addresses.
    // fn registered_assets(self: @TContractState) -> Array<ContractAddress>;

    /// Retrieves the total assets held for a specific token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The ID of the token to query.
    /// Returns:
    /// - The total assets (`u256`) for the given token ID.
    fn total_assets(self: @TContractState, tokenId: felt252) -> u256;

    /// Fetches the underlying asset's address for a given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The ID of the token to query.
    /// Returns:
    /// - The address (`ContractAddress`) of the underlying asset.
    fn asset(self: @TContractState, tokenId: felt252) -> ContractAddress;

    /// Maps a registered asset address to its associated token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `vault_asset`: The asset address to map.
    /// Returns:
    /// - The token ID (`felt252`) corresponding to the asset.
    fn asset_to_tokenId(self: @TContractState, vault_asset: ContractAddress) -> felt252;

    /// Converts shares to assets for a given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `token_id`: The ID of the token to convert.
    /// - `shares`: The number of shares to convert.
    /// Returns:
    /// - The equivalent amount of assets (`u256`).
    fn convert_to_assets(self: @TContractState, token_id: felt252, shares: u256) -> u256;

    /// Converts assets to shares for a given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `token_id`: The ID of the token to convert.
    /// - `assets`: The amount of assets to convert.
    /// Returns:
    /// - The equivalent number of shares (`u256`).
    fn convert_to_shares(self: @TContractState, token_id: felt252, assets: u256) -> u256;

    /// Determines the maximum depositable assets for a given vault asset and address.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `vault_asset`: The address of the asset.
    /// - `address`: The depositor's address.
    /// Returns:
    /// - The maximum depositable amount (`u256`).
    fn max_deposit(
        self: @TContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256;

    /// Determines the maximum shares that can be minted for a given vault asset and address.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `vault_asset`: The address of the asset.
    /// - `address`: The minter's address.
    /// Returns:
    /// - The maximum mintable shares (`u256`).
    fn max_mint(
        self: @TContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256;

    /// Determines the maximum assets that can be withdrawn for a given vault asset and address.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `vault_asset`: The address of the asset.
    /// - `address`: The owner's address.
    /// Returns:
    /// - The maximum withdrawable amount (`u256`).
    fn max_withdraw(
        self: @TContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256;

    /// Determines the maximum shares that can be redeemed for a given vault asset and address.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `vault_asset`: The address of the asset.
    /// - `address`: The owner's address.
    /// Returns:
    /// - The maximum redeemable shares (`u256`).
    fn max_redeem(
        self: @TContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256;

    /// Previews the amount of shares for a given token ID when depositing a specific asset amount.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `token_id`: The token ID.
    /// - `assets`: The amount of assets to deposit.
    /// Returns:
    /// - The equivalent shares (`u256`).
    fn preview_deposit(self: @TContractState, token_id: felt252, assets: u256) -> u256;

    /// Previews the amount of assets required for minting a specific number of shares for a given
    /// token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `token_id`: The token ID.
    /// - `shares`: The number of shares to mint.
    /// Returns:
    /// - The equivalent asset amount (`u256`).
    fn preview_mint(self: @TContractState, token_id: felt252, shares: u256) -> u256;

    /// Previews the number of shares required to withdraw a specific asset amount for a given token
    /// ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `token_id`: The token ID.
    /// - `assets`: The amount of assets to withdraw.
    /// Returns:
    /// - The equivalent shares (`u256`).
    fn preview_withdraw(self: @TContractState, token_id: felt252, assets: u256) -> u256;
    /// Previews the number of assets received when redeeming a specific number of shares for a
    /// given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `token_id`: The token ID.
    /// - `shares`: The number of shares to redeem.
    /// Returns:
    /// - The equivalent amount of assets (`u256`).
    fn preview_redeem(self: @TContractState, token_id: felt252, shares: u256) -> u256;

    /// Retrieves the total supply of shares for a given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The token ID.
    /// Returns:
    /// - The total supply of shares (`u256`).
    fn total_supply(self: @TContractState, tokenId: felt252) -> u256;

    /// Fetches the name of the token associated with the given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The token ID.
    /// Returns:
    /// - The name of the token (`felt252`).
    fn name(self: @TContractState, tokenId: felt252) -> felt252;

    /// Fetches the symbol of the token associated with the given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The token ID.
    /// Returns:
    /// - The symbol of the token (`felt252`).
    fn symbol(self: @TContractState, tokenId: felt252) -> felt252;

    /// Fetches the decimal precision of the token associated with the given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The token ID.
    /// Returns:
    /// - The decimal precision of the token (`u8`).
    fn decimals(self: @TContractState, tokenId: felt252) -> u8;

    /// Allows a user to deposit assets and receive shares for a given token ID.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The token ID.
    /// - `assets`: The amount of assets to deposit.
    /// - `receiver`: Address of the account to receive the shares.
    /// Returns:
    /// - The number of shares received (`u256`).
    fn deposit(
        ref self: TContractState, tokenId: felt252, assets: u256, receiver: ContractAddress
    ) -> u256;

    /// Mints shares for a user by depositing the equivalent amount of assets.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The token ID.
    /// - `shares`: The number of shares to mint.
    /// - `receiver`: Address of the account to receive the shares.
    /// Returns:
    /// - The amount of assets deposited (`u256`).
    fn mint(
        ref self: TContractState, tokenId: felt252, shares: u256, receiver: ContractAddress,
    ) -> u256;

    /// Withdraws assets by burning a specified amount of shares.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The token ID.
    /// - `assets`: The amount of assets to withdraw.
    /// - `receiver`: Address of the account to receive the assets.
    /// - `owner`: Address of the account owning the shares.
    /// Returns:
    /// - The number of shares burned (`u256`).
    fn withdraw(
        ref self: TContractState,
        tokenId: felt252,
        assets: u256,
        receiver: ContractAddress,
        owner: ContractAddress,
    ) -> u256;

    /// Redeems shares for a specified amount of assets.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `tokenId`: The token ID.
    /// - `shares`: The number of shares to redeem.
    /// - `receiver`: Address of the account to receive the assets.
    /// - `owner`: Address of the account owning the shares.
    /// Returns:
    /// - The amount of assets received (`u256`).
    fn redeem(
        ref self: TContractState,
        tokenId: felt252,
        shares: u256,
        receiver: ContractAddress,
        owner: ContractAddress,
    ) -> u256;

    /// Upgrades the class hash of the Pool Manager contract.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `class_hash`: The new class hash to upgrade to.
    fn upgrade_class_hash(ref self: TContractState, class_hash: ClassHash);

    /// Sets or removes an operator for the caller's account.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `operator`: The address of the operator to set or remove.
    /// - `approved`: Boolean indicating whether the operator is approved or removed.
    /// Returns:
    /// - `true` if the operation was successful, otherwise `false`.
    fn set_operator(ref self: TContractState, operator: ContractAddress, approved: bool) -> bool;

    /// Approves a spender to spend a specified amount of assets on behalf of the caller.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `spender`: Address of the account to approve.
    /// - `id`: The token ID.
    /// - `amount`: The amount of assets to approve.
    /// Returns:
    /// - `true` if the approval was successful, otherwise `false`.
    fn approve(
        ref self: TContractState, spender: ContractAddress, id: felt252, amount: u256
    ) -> bool;

    /// Transfers assets from one account to another on behalf of the owner.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `from`: Address of the account to transfer from.
    /// - `to`: Address of the account to transfer to.
    /// - `id`: The token ID.
    /// - `amount`: The amount of assets to transfer.
    /// Returns:
    /// - `true` if the transfer was successful, otherwise `false`.
    fn transfer_from(
        ref self: TContractState,
        from: ContractAddress,
        to: ContractAddress,
        id: felt252,
        amount: u256
    ) -> bool;

    /// Transfers assets to another account.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `to`: Address of the recipient.
    /// - `id`: The token ID.
    /// - `amount`: The amount of assets to transfer.
    /// Returns:
    /// - `true` if the transfer was successful, otherwise `false`.
    fn transfer(ref self: TContractState, to: ContractAddress, id: felt252, amount: u256) -> bool;

    /// Retrieves the allowance of a spender for a specific token ID on behalf of the owner.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `owner`: Address of the account owning the assets.
    /// - `spender`: Address of the approved spender.
    /// - `id`: The token ID.
    /// Returns:
    /// - The amount of assets approved (`u256`).
    fn allowance(
        self: @TContractState, owner: ContractAddress, spender: ContractAddress, id: felt252
    ) -> u256;

    /// Checks if an operator is approved for the given owner.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `owner`: Address of the account.
    /// - `operator`: Address of the operator.
    /// Returns:
    /// - `true` if the operator is approved, otherwise `false`.
    fn is_operator(
        self: @TContractState, owner: ContractAddress, operator: ContractAddress
    ) -> bool;

    /// Retrieves the balance of a specific token ID for an owner.
    /// Parameters:
    /// - `self`: Reference to the contract state.
    /// - `owner`: Address of the account.
    /// - `id`: The token ID.
    /// Returns:
    /// - The balance of the token (`u256`).
    fn balance_of(self: @TContractState, owner: ContractAddress, id: felt252) -> u256;

    fn pause(ref self: TContractState);
    fn unpause(ref self: TContractState);
    fn transfer_assets_to_strategy(
        ref self: TContractState, requested_address: ContractAddress
    ) -> (Array<u256>, Array<ContractAddress>);

    fn set_strategy_manager(ref self:TContractState,_strategy_manager:ContractAddress);
    fn get_registered_assets( self: @TContractState)->Array<ContractAddress>;
}

/// Struct representing metadata for a token managed by the Pool Manager.
/// Fields:
/// - `name`: The name of the token.
/// - `symbol`: The symbol of the token.
/// - `decimals`: The decimal precision of the token.
/// - `total_supply`: The total supply of the token.
/// - `underlying_asset`: The address of the underlying asset.
/// - `is_registered`: Boolean indicating if the token is registered.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct TokenMetadata {
    pub name: felt252,
    pub symbol: felt252,
    pub decimals: u8,
    pub total_supply: u256,
    pub underlying_asset: ContractAddress,
    pub is_registered: bool,
}

