use starknet::ContractAddress;

#[starknet::interface]
pub trait IPoolManager<TContractState> {
    fn register_asset(
        ref self: TContractState, vault_asset: ContractAddress, name: felt252, symbol: felt252,
    ) -> bool;
    fn registered_assets(self: @TContractState) -> Array<ContractAddress>;
    fn total_assets(self: @TContractState, vault_asset: ContractAddress) -> u256;
    fn convert_to_shares(self: @TContractState, vault_asset: ContractAddress, assets: u256) -> u256;
    fn convert_to_assets(self: @TContractState, vault_asset: ContractAddress, shares: u256) -> u256;
    fn max_deposit(
        self: @TContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256;
    fn max_mint(
        self: @TContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256;
    fn max_withdraw(
        self: @TContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256;
    fn max_redeem(
        self: @TContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256;

    fn preview_deposit(self: @TContractState, vault_asset: ContractAddress, assets: u256) -> u256;
    fn preview_mint(self: @TContractState, vault_asset: ContractAddress, shares: u256) -> u256;
    fn preview_withdraw(self: @TContractState, vault_asset: ContractAddress, assets: u256) -> u256;
    fn preview_redeem(self: @TContractState, vault_asset: ContractAddress, assets: u256) -> u256;

    fn total_supply(self: @TContractState, vault_asset: ContractAddress) -> u256;
    fn name(self: @TContractState, vault_asset: ContractAddress) -> felt252;
    fn symbol(self: @TContractState, vault_asset: ContractAddress) -> felt252;
    fn decimals(self: @TContractState, vault_asset: ContractAddress) -> felt252;

    fn deposit(
        ref self: TContractState,
        vault_asset: ContractAddress,
        assets: u256,
        receiver: ContractAddress,
    ) -> u256;
    fn mint(
        ref self: TContractState,
        vault_asset: ContractAddress,
        shares: u256,
        receiver: ContractAddress,
    ) -> u256;

    fn withdraw(
        ref self: TContractState,
        vault_asset: ContractAddress,
        assets: u256,
        receiver: ContractAddress,
        owner: ContractAddress,
    ) -> u256;
    fn redeem(
        ref self: TContractState,
        vault_asset: ContractAddress,
        shares: u256,
        receiver: ContractAddress,
        owner: ContractAddress,
    ) -> u256;
}
