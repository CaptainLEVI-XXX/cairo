
#[starknet::interface]
pub trait ITokenMetadata<TContractState> {

    fn name(self:@TContractState,id: felt252)->felt252;
    fn symbol(self:@TContractState,id:u256)->felt252;
    fn decimals(self:@TContractState,id:felt252)->u8;

}

