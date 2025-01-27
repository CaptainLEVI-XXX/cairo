use starknet::{ContractAddress,ClassHash};

#[starknet::interface]
pub trait IPoolManager<TContractState> {
    fn register_asset(
        ref self: TContractState, vault_asset: ContractAddress, name: felt252, symbol: felt252,
    ) -> felt252;
    // fn registered_assets(self: @TContractState) -> Array<ContractAddress>;
    fn total_assets(self: @TContractState, tokenId: felt252) -> u256;
    fn asset(self:@TContractState,tokenId:felt252)->ContractAddress;
    fn asset_to_tokenId(self:@TContractState, vault_asset:ContractAddress)->felt252;

    fn convert_to_assets(
        self: @TContractState,
        token_id: felt252,
        shares: u256
    ) -> u256;
    fn convert_to_shares(
        self: @TContractState,
        token_id: felt252,
        assets: u256
    ) -> u256;
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

    fn preview_deposit(
        self: @TContractState,
        token_id: felt252,
        assets: u256
    ) -> u256;
    fn preview_mint(self: @TContractState,
        token_id: felt252,
        shares: u256)->u256;
    fn preview_withdraw(
        self: @TContractState,
        token_id: felt252,
        assets: u256
    ) -> u256;
    fn preview_redeem(self: @TContractState,
        token_id: felt252,
        shares: u256)->u256;

    fn total_supply(self: @TContractState, tokenId: felt252) -> u256;
    fn name(self:@TContractState, tokenId:felt252)->felt252;
    fn symbol(self:@TContractState, tokenId:felt252)->felt252;

    fn decimals(self:@TContractState, tokenId:felt252)->u8;

    fn deposit(ref self:TContractState, tokenId:felt252, assets:u256, receiver: ContractAddress)->u256;

    fn mint(
        ref self: TContractState,
        tokenId: felt252,
        shares: u256,
        receiver: ContractAddress,
    ) -> u256;

    fn withdraw(
        ref self: TContractState,
        tokenId: felt252,
        assets: u256,
        receiver: ContractAddress,
        owner: ContractAddress,
    ) -> u256;

    fn redeem(
        ref self: TContractState,
        tokenId: felt252,
        shares: u256,
        receiver: ContractAddress,
        owner: ContractAddress,
    ) -> u256;

    fn upgrade_class_hash(ref self: TContractState, class_hash: ClassHash);
    fn set_operator(
        ref self: TContractState,
        operator: ContractAddress,
        approved: bool
    ) -> bool;


    fn approve(
        ref self: TContractState,
        spender: ContractAddress,
        id: felt252,
        amount: u256
    ) -> bool ;

    fn transfer_from(
        ref self: TContractState,
        from: ContractAddress,
        to: ContractAddress,
        id: felt252,
        amount: u256
    ) -> bool;

    fn transfer(
        ref self: TContractState,
        to: ContractAddress,
        id: felt252,
        amount: u256
    ) -> bool ;
    fn allowance(
        self: @TContractState,
        owner: ContractAddress,
        spender: ContractAddress,
        id: felt252
    ) -> u256 ;

    fn is_operator(
        self: @TContractState,
        owner: ContractAddress,
        operator: ContractAddress
    ) -> bool;

    fn balance_of(self: @TContractState, owner: ContractAddress, id: felt252) -> u256;
}
