use starknet::ContractAddress;

#[starknet::interface]
pub trait IToken<TContractState> {
    fn balance_of(
        self: @TContractState, vault_asset: ContractAddress, owner: ContractAddress,
    ) -> u256;
    fn total_supply(self: @TContractState, vault_asset: ContractAddress) -> u256;
    fn allowance(
        self: @TContractState, vault_asset: ContractAddress, spender: ContractAddress,
    ) -> u256;
    fn transfer(
        ref self: TContractState,
        vault_asset: ContractAddress,
        receiver: ContractAddress,
        amount: u256,
    ) -> bool;
    fn transferFrom(
        ref self: TContractState,
        vault_asset: ContractAddress,
        sender: ContractAddress,
        receiver: ContractAddress,
        id: felt252,
        amount: u256,
    ) -> bool;
    fn approve(
        ref self: TContractState,
        vault_asset: ContractAddress,
        spender: ContractAddress,
        value: u256,
    ) -> bool;
}

