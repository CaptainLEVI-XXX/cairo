use starknet::ContractAddress;

#[starknet::interface]
pub trait ITokenMetadata<TContractState> {
    fn name(self: @TContractState, vault_asset: ContractAddress) -> felt252;
    fn symbol(self: @TContractState, vault_asset: ContractAddress) -> felt252;
    fn decimals(self: @TContractState, vault_asset: ContractAddress) -> u8;
}
