use starknet::{ContractAddress, ClassHash};

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

    fn upgrade_class_hash(ref self: TContractState, class_hash: ClassHash);
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct VaultData {
    pub total_supply: u256,
    pub decimals: u8,
    pub name: felt252,
    pub symbol: felt252,
    pub is_registered: bool,
}


#[starknet::contract]
pub mod PoolManager {
    use super::{IPoolManager, VaultData};
    use core::traits::Into;
    use core::num::traits::Zero;
    use starknet::{
        get_block_timestamp, get_caller_address, ContractAddress, ClassHash, contract_address_const,get_contract_address
    };
    use openzeppelin::{
        security::reentrancyguard::ReentrancyGuardComponent,
        upgrades::upgradeable::UpgradeableComponent, introspection::src5::SRC5Component,
    };
    use cairo::interfaces::IERC20::{IERC20Dispatcher, IERC20DispatcherTrait};

    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(
        path: ReentrancyGuardComponent, storage: reentrancyguard, event: ReentracnyGuardEvent,
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl ReentrantInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        reentrancyguard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        vaults: Map<ContractAddress, ContractAddress>,
        balance_of: Map<(ContractAddress, ContractAddress), u256>,
        allowance: Map<(ContractAddress, ContractAddress, ContractAddress), u256>,
        owner:ContractAddress
    }


    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Deposit: Deposit,
        Withdraw: Withdraw,
        AssetRegistered: AssetRegistered,
        Transfer: Transfer,
        Approval: Approval,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        ReentracnyGuardEvent: ReentrancyGuardComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }


    #[derive(Drop, Serde, starknet::Event)]
    pub struct Deposit {
        #[key]
        caller: ContractAddress,
        #[key]
        owner: ContractAddress,
        #[key]
        vault_asset: ContractAddress,
        assets: u256,
        shares: u256,
    }
    #[derive(Drop, Serde, starknet::Event)]
    pub struct Withdraw {
        #[key]
        caller: ContractAddress,
        #[key]
        receiver: ContractAddress,
        #[key]
        owner: ContractAddress,
        #[key]
        vault_asset: ContractAddress,
        assets: u256,
        shares: u256,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct AssetRegistered {
        #[key]
        vault_asset: ContractAddress,
        #[key]
        caller: ContractAddress,
        #[key]
        name: felt252,
        symbol: felt252,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct Transfer {
        #[key]
        vault_asset: ContractAddress,
        #[key]
        caller: ContractAddress,
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        amount: ContractAddress,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct Approval {
        #[key]
        vault_asset: ContractAddress,
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        amount: ContractAddress,
    }


    mod Error {
        
        pub const UNAUTHORIZED:felt252 ='UNAUTHORIZED';
        pub const AssetNotRegistered: felt252 = 'AssetNotRegistered';
        pub const ZeroShares: felt252 = 'ZeroShares';
        pub const ZeroAssets: felt252 = 'ZeroAssets';
        pub const AssetAlreadyRegistered: felt252 = 'AssetAlreadyRegistered';
        pub const InvalidReceiver: felt252 = 'InvalidReceiver';
        pub const InsufficientAllowance: felt252 = 'InsufficientAllowance';
        pub const InvalidAsset: felt252 = 'InvalidAsset';
        pub const InvalidCalldata: felt252 = 'Invalid Calldata';
    
    }


    #[constructor]
    fn constructor(ref self: ContractState,owner_: ContractAddress){
        self.owner.write(owner_);
    }

    #[abi(embed_v0)]
    pub impl PoolManager of super::IPoolManager<ContractState> {
        
        fn upgrade_class_hash(ref self: ContractState, class_hash: ClassHash) {
            self._assert_owner();
            self.upgradeable.upgrade(class_hash);
        }
        fn register_asset(ref self:ContractState, vault_asset:ContractAddress,name:felt252,symbol:felt252)->bool{
            
            self._assert_invalid_calldata(vault_asset);
            self._assert_vault_registred(vault_asset);
            
            let mut vault:VaultData = self.vaults.read(vault_asset);
            let flag:bool = true;
            let this_contract = get_contract_address();
            let erc20_dispatcher:IERC20Dispatcher = IERC20Dispatcher{ contract_address:vault_asset};
            vault.total_supply = erc20_dispatcher.balance_of(this_contract);
            vault.decimals =erc20_dispatcher.decimals();
            vault.name = name;
            vault.name = symbol;
            vault.is_registered = flag;
            self.vaults.write(vault_asset,vault);

            self.emit(AssetRegistered {vault_asset:vault_asset,caller:get_caller_address(),name,symbol});
            
            flag

        }
    fn total_assets(self: @ContractState, vault_asset: ContractAddress) -> u256{
        4
    }
    fn convert_to_shares(self: @ContractState, vault_asset: ContractAddress, assets: u256) -> u256{
        4
    }
    fn convert_to_assets(self: @ContractState, vault_asset: ContractAddress, shares: u256) -> u256{
        4
    }
    fn max_deposit(
        self: @ContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256{
        4
    }
    fn max_mint(
        self: @ContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256{
        4
    }
    fn max_withdraw(
        self: @ContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256{
        4
    }
    fn max_redeem(
        self: @ContractState, vault_asset: ContractAddress, address: ContractAddress,
    ) -> u256{4
    }

    fn preview_deposit(self: @ContractState, vault_asset: ContractAddress, assets: u256) -> u256{
        4
    }
    fn preview_mint(self: @ContractState, vault_asset: ContractAddress, shares: u256) -> u256{
        4
    }
    fn preview_withdraw(self: @ContractState, vault_asset: ContractAddress, assets: u256) -> u256{
        4
    }
    fn preview_redeem(self: @ContractState, vault_asset: ContractAddress, assets: u256) -> u256{
        4
    }

    fn total_supply(self: @ContractState, vault_asset: ContractAddress) -> u256{
        4
    }
    fn name(self: @ContractState, vault_asset: ContractAddress) -> felt252{
        4
    }
    fn symbol(self: @ContractState, vault_asset: ContractAddress) -> felt252{
        4
    }
    fn decimals(self: @ContractState, vault_asset: ContractAddress) -> felt252{
        4
    }

    fn deposit(
        ref self: ContractState,
        vault_asset: ContractAddress,
        assets: u256,
        receiver: ContractAddress,
    ) -> u256{
        4
    }
    fn mint(
        ref self: ContractState,
        vault_asset: ContractAddress,
        shares: u256,
        receiver: ContractAddress,
    ) -> u256{
        4
    }

    fn withdraw(
        ref self: ContractState,
        vault_asset: ContractAddress,
        assets: u256,
        receiver: ContractAddress,
        owner: ContractAddress,
    ) -> u256{
        4
    }
    fn redeem(
        ref self: ContractState,
        vault_asset: ContractAddress,
        shares: u256,
        receiver: ContractAddress,
        owner: ContractAddress,
    ) -> u256{
        4
    }




    }


    #[generate_trait]
    impl InternalFunctionsImpl of InternalFunctions {
        fn _assert_owner(self: @ContractState) {
            assert(get_caller_address() == self.owner.read(), Error::UNAUTHORIZED);
        }

        fn _assert_vault_registred(self:@ContractState,vault_asset:ContractAddress){
            let vaultMetadata:VaultData = self.vaults.read(vault_asset);
            assert(!vaultMetadata.is_registered,Error::AssetAlreadyRegistered);
        }

        fn _assert_invalid_calldata(self: @ContractState,address:ContractAddress){
            assert(address.is_zero(),Error::InvalidCalldata);
        }
    }

    




}
