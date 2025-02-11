use starknet::{ContractAddress, ClassHash};

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct StrategyInfo {
    pub name: felt252,
    pub address: ContractAddress,
    pub deposit_selector: felt252,
    pub withdraw_selector: felt252,
    pub is_registered: bool,
}

#[derive(Clone,Drop, Serde)]
pub struct DepositedInfo {
    pub amount: u256,
    pub asset: ContractAddress,
    pub timestamp: u256,
    pub amounts: Array<u256>,
    pub assets: Array<ContractAddress>
}

#[starknet::interface]
pub trait IStrategyManager<TContractState> {
    // Add strategy to the system
    fn add_strategy(
        ref self: TContractState,
        name: felt252,
        strategy_address: ContractAddress,
        class_hash: ClassHash,
        deposit_selector: felt252,
        withdraw_selector: felt252
    ) -> felt252;

    // Remove strategy from the system
    fn remove_strategy(ref self: TContractState, strategy_id: felt252);

    // Update existing strategy
    fn update_strategy(
        ref self: TContractState,
        strategy_id: felt252,
        strategy_address: ContractAddress,
        deposit_selector: felt252,
        withdraw_selector: felt252
    );

    // Add pool to the system
    fn add_pool(ref self: TContractState, pool_address: ContractAddress) -> felt252;

    // Request funds from pool
    fn request_funds_from_pool(
        ref self: TContractState,
        pool_id: felt252,
        strategy_id: felt252,
        assets_to: ContractAddress
    ) -> DepositedInfo;

    // View functions
    fn get_strategy(self: @TContractState, strategy_id: felt252) -> StrategyInfo;
    fn get_total_strategies(self: @TContractState) -> u256;
}