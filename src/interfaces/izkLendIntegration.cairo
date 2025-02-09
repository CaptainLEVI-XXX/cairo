use starknet::{ContractAddress,ClassHash};

#[starknet::interface]
 pub trait IZkLendIntegration<TContractState>{

    fn deposit_zklend(
        ref self: TContractState,asset:ContractAddress,amount:u256 
    )->(u256,ContractAddress,u256);

    fn is_asset_supported(self:@TContractState, asset:ContractAddress)->bool;

    fn withdraw_zklend(
        ref self: TContractState, id: u256
    )->u256;

    fn upgrade_class_hash(ref self: TContractState, class_hash: ClassHash);
}
