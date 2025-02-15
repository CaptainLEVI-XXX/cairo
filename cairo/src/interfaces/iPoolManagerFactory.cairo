use starknet::{ClassHash, ContractAddress};

#[starknet::interface]
pub trait IPoolManagerFactory<TContractState> {
    fn deploy_new_contract(
        ref self: TContractState,
        salt: felt252,
        class_hash: ClassHash,
        owner:ContractAddress,
        strategy_manager:ContractAddress
    
    ) -> ContractAddress;
    fn predict_address(
        self: @TContractState,
        salt: felt252,
        class_hash: ClassHash,
        constructor_calldata: Array<felt252>
    ) -> ContractAddress;


    fn get_deployment_count(self: @TContractState) -> u256;
}
