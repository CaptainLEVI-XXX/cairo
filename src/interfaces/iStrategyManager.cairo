use starknet::{ContractAddress,ClassHash};

#[starknet::interface]
pub trait IStrategyManager<TContractState>{
    fn add_strategy(
        ref self: TContractState,
        name: felt252,
        strategy_address: ContractAddress,
        class_hash: ClassHash,
        deposit_selector: felt252,
        withdraw_selector: felt252
    ) -> felt252 ;

    fn remove_strategy(ref self: TContractState, strategy_id: felt252) ;

    fn update_strategy(
        ref self: TContractState,
        strategy_id: felt252,
        strategy_address: ContractAddress,
        deposit_selector: felt252,
        withdraw_selector: felt252
    ) ;

    // View functions
    fn get_strategy(self: @TContractState, strategy_id: felt252) -> StrategyInfo ;

    fn get_total_strategies(self: @TheContractState) -> u256;
}