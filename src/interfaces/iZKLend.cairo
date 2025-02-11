use starknet::ContractAddress;

#[starknet::interface]
pub trait IZKLend<TContractState> {
    fn deposit(ref self: TContractState, token: ContractAddress, amount: felt252);
    fn withdraw(ref self: TContractState, token: ContractAddress, amount: felt252);
    fn get_lending_accumulator(self: @TContractState, token: ContractAddress) -> felt252;
}