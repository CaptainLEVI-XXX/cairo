
#[starknet::contract]
pub mod PoolManager {
    use starknet::event::EventEmitter;
    use cairo::interfaces::iPoolManager::{IPoolManager, TokenMetadata};
    use core::traits::{Into,TryInto};
    use core::num::traits::Zero;
    use starknet::{
        get_caller_address, ContractAddress, ClassHash, contract_address_const, get_contract_address
    };
    use openzeppelin::{
        security::reentrancyguard::ReentrancyGuardComponent,
        security::pausable::PausableComponent,
        upgrades::upgradeable::UpgradeableComponent, introspection::src5::SRC5Component,
    };
    use cairo::interfaces::iERC20::{IERC20Dispatcher, IERC20DispatcherTrait};
 

    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    pub const max: u128 = 340282366920938463463374607431768211;

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(
        path: ReentrancyGuardComponent, storage: reentrancyguard, event: ReentracnyGuardEvent,
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl ReentrantInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        reentrancyguard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        balance_of: Map<(ContractAddress, felt252), u256>,
        allowances: Map<(ContractAddress, ContractAddress, felt252), u256>,
        is_operator: Map<(ContractAddress, ContractAddress), bool>,
        total_supply: Map<felt252, u256>,
        owner: ContractAddress,
        asset_to_tokenId: Map<ContractAddress, felt252>,
        tokenId_to_asset: Map<felt252, ContractAddress>,
        token_metadata: Map<felt252, TokenMetadata>,
        next_tokenId: felt252,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Deposit: Deposit,
        Withdraw: Withdraw,
        AssetRegistered: AssetRegistered,
        Transfer: Transfer,
        OperatorSet: OperatorSet,
        Approval: Approval,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        ReentracnyGuardEvent: ReentrancyGuardComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        PausableEvent: PausableComponent::Event
    }


    #[derive(Drop, Serde, starknet::Event)]
    pub struct Deposit {
        #[key]
        id: felt252,
        #[key]
        caller: ContractAddress,
        #[key]
        owner: ContractAddress,
        assets: u256,
        shares: u256,
    }
    #[derive(Drop, Serde, starknet::Event)]
    pub struct Withdraw {
        #[key]
        id: felt252,
        #[key]
        caller: ContractAddress,
        #[key]
        receiver: ContractAddress,
        #[key]
        owner: ContractAddress,
        assets: u256,
        shares: u256,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct AssetRegistered {
        #[key]
        vault_asset: ContractAddress,
        #[key]
        tokenId: felt252,
        name: felt252,
        symbol: felt252,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        #[key]
        id: felt252,
        #[key]
        amount: u256
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct Approval {
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        #[key]
        id: felt252,
        amount: u256,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct OperatorSet {
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        approved: bool,
    }


    mod Error {
        pub const UNAUTHORIZED: felt252 = 'UNAUTHORIZED';
        pub const AssetNotRegistered: felt252 = 'AssetNotRegistered';
        pub const ZeroShares: felt252 = 'ZeroShares';
        pub const ZeroAssets: felt252 = 'ZeroAssets';
        pub const AssetAlreadyRegistered: felt252 = 'AssetAlreadyRegistered';
        pub const InvalidReceiver: felt252 = 'InvalidReceiver';
        pub const InsufficientAllowance: felt252 = 'InsufficientAllowance';
        pub const InvalidAsset: felt252 = 'InvalidAsset';
        pub const InvalidCalldata: felt252 = 'Invalid Calldata';
        pub const PoolIsPaused: felt252 = 'PoolIsPaused';
    }


    #[constructor]
    fn constructor(ref self: ContractState, owner_: ContractAddress) {
        self.owner.write(owner_);
    }

    #[abi(embed_v0)]
    pub impl PoolManager of IPoolManager<ContractState> {
        fn upgrade_class_hash(ref self: ContractState, class_hash: ClassHash) {
            self._assert_owner();
            self.upgradeable.upgrade(class_hash);
        }
        fn register_asset(
            ref self: ContractState, vault_asset: ContractAddress, name: felt252, symbol: felt252
        ) -> felt252 {
            assert(self.asset_to_tokenId.read(vault_asset) == 0, Error::AssetAlreadyRegistered);

            let erc20_dispatcher: IERC20Dispatcher = IERC20Dispatcher {
                contract_address: vault_asset
            };
            let asset_decimal: u8 = erc20_dispatcher.decimals();
            let total_supply = erc20_dispatcher.total_supply();
            let current_id: felt252 = self.next_tokenId.read();

            let tokenId: felt252 = current_id + 1.into();
            self.next_tokenId.write(tokenId);
            self.asset_to_tokenId.write(vault_asset, tokenId);
            self.tokenId_to_asset.write(tokenId, vault_asset);

            let mut token_metadata: TokenMetadata = self.token_metadata.read(tokenId);
            token_metadata.name = name;
            token_metadata.symbol = symbol;
            token_metadata.decimals = asset_decimal;
            token_metadata.total_supply = total_supply;
            token_metadata.underlying_asset = vault_asset;
            token_metadata.is_registered = true;

            self.token_metadata.write(tokenId, token_metadata);

            //Emit an Event

            self
                .emit(
                    Event::AssetRegistered(
                        AssetRegistered {
                            vault_asset: vault_asset, tokenId: tokenId, name: name, symbol: symbol
                        }
                    )
                );

            tokenId
        }

        fn asset(self: @ContractState, tokenId: felt252) -> ContractAddress {
            let vault_asset: ContractAddress = self.tokenId_to_asset.read(tokenId);
            vault_asset
        }

        fn total_assets(self: @ContractState, tokenId: felt252) -> u256 {
            let vault_asset: ContractAddress = self.tokenId_to_asset.read(tokenId);
            let this_contract = get_caller_address();
            let erc20_dispatcher: IERC20Dispatcher = IERC20Dispatcher {
                contract_address: vault_asset
            };
            let amount: u256 = erc20_dispatcher.balance_of(this_contract);
            amount
        }

        fn decimals(self: @ContractState, tokenId: felt252) -> u8 {
            let token_metadata = self.token_metadata.read(tokenId);
            token_metadata.decimals
        }

        fn name(self: @ContractState, tokenId: felt252) -> felt252 {
            let token_metadata = self.token_metadata.read(tokenId);
            token_metadata.name
        }

        fn symbol(self: @ContractState, tokenId: felt252) -> felt252 {
            let token_metadata = self.token_metadata.read(tokenId);
            token_metadata.symbol
        }

        fn asset_to_tokenId(self: @ContractState, vault_asset: ContractAddress) -> felt252 {
            let tokenId: felt252 = self.asset_to_tokenId.read(vault_asset);
            tokenId
        }

        fn deposit(
            ref self: ContractState, tokenId: felt252, assets: u256, receiver: ContractAddress
        ) -> u256 {
            self.pausable.assert_not_paused();
            self.reentrancyguard.start();
            let shares = self.preview_deposit(tokenId, assets);
            assert(!shares.is_zero(), 'ZERO_SHARES');

            let caller = get_caller_address();
            let asset = self.asset(tokenId);

            // Transfer assets from caller
            IERC20Dispatcher { contract_address: asset }
                .transfer_from(caller, get_contract_address(), assets);

            self._mint(receiver, tokenId, shares);

            self
                .emit(
                    Event::Deposit(Deposit { id: tokenId, caller, owner: receiver, assets, shares })
                );

            self.after_deposit(tokenId, assets, shares);
            self.reentrancyguard.end();
            shares
        }

        fn mint(
            ref self: ContractState, tokenId: felt252, shares: u256, receiver: ContractAddress
        ) -> u256 {
            self.pausable.assert_not_paused();
            self.reentrancyguard.start();
            let assets = self.preview_mint(tokenId, shares);
            assert(!assets.is_zero(), 'Zero_ASSETs');

            let caller = get_caller_address();
            let asset = self.asset(tokenId);

            // Transfer assets from caller
            IERC20Dispatcher { contract_address: asset }
                .transfer_from(caller, get_contract_address(), assets);

            self._mint(receiver, tokenId, shares);

            self
                .emit(
                    Event::Deposit(Deposit { id: tokenId, caller, owner: receiver, assets, shares })
                );

            self.after_deposit(tokenId, assets, shares);
            self.reentrancyguard.end();
            assets
        }

        fn redeem(
            ref self: ContractState,
            tokenId: felt252,
            shares: u256,
            receiver: ContractAddress,
            owner: ContractAddress
        ) -> u256 {
            self.pausable.assert_not_paused();
            self.reentrancyguard.start();
            let assets = self.preview_redeem(tokenId, shares);
            assert(assets.is_zero(), 'ZERO Assets');
            let caller = get_caller_address();

            if caller != owner {
                let allowed = self.allowances.read((owner, caller, tokenId));
                if allowed != max.into() {
                    self.allowances.write((owner, caller, tokenId), allowed - shares);
                }
            }

            self.before_withdraw(tokenId, assets, shares);
            self._burn(owner, tokenId, shares);

            let asset = self.asset(tokenId);
            IERC20Dispatcher { contract_address: asset }.transfer(receiver, assets);

            self
                .emit(
                    Event::Withdraw(
                        Withdraw { id: tokenId, caller, receiver, owner, assets, shares }
                    )
                );

            self.reentrancyguard.end();

            assets
        }

        fn withdraw(
            ref self: ContractState,
            tokenId: felt252,
            assets: u256,
            receiver: ContractAddress,
            owner: ContractAddress
        ) -> u256 {
            self.pausable.assert_not_paused();
            self.reentrancyguard.start();
            let shares = self.preview_withdraw(tokenId, assets);
            let caller = get_caller_address();

            if caller != owner {
                let allowed = self.allowances.read((owner, caller, tokenId));
                if allowed != max.into() {
                    self.allowances.write((owner, caller, tokenId), allowed - shares);
                }
            }

            // self.before_withdraw(tokenId, assets, shares);
            self._burn(owner, tokenId, shares);

            let asset = self.asset(tokenId);
            IERC20Dispatcher { contract_address: asset }.transfer(receiver, assets);

            self
                .emit(
                    Event::Withdraw(
                        Withdraw { id: tokenId, caller, receiver, owner, assets, shares }
                    )
                );

            self.reentrancyguard.end();

            shares
        }

        fn preview_deposit(self: @ContractState, token_id: felt252, assets: u256) -> u256 {
            self.convert_to_shares(token_id, assets)
        }

        fn preview_mint(self: @ContractState, token_id: felt252, shares: u256) -> u256 {
            let supply = self.total_supply.read(token_id);
            if supply.is_zero() {
                shares
            } else {
                let numerator = shares * self.total_assets(token_id);
                let denominator = supply;
                numerator / denominator
            }
        }

        fn preview_redeem(self: @ContractState, token_id: felt252, shares: u256) -> u256 {
            self.convert_to_assets(token_id, shares)
        }


        fn preview_withdraw(self: @ContractState, token_id: felt252, assets: u256) -> u256 {
            let supply = self.total_supply.read(token_id);
            if supply.is_zero() {
                assets
            } else {
                let numerator: u256 = assets * supply;
                let denominator: u256 = self.total_assets(token_id);
                numerator / denominator
            }
        }

        fn convert_to_shares(self: @ContractState, token_id: felt252, assets: u256) -> u256 {
            let supply = self.total_supply.read(token_id);
            if supply.is_zero() {
                assets
            } else {
                let numerator: u256 = assets * supply;
                let denominator: u256 = self.total_assets(token_id);
                numerator / denominator
            }
        }

        fn convert_to_assets(self: @ContractState, token_id: felt252, shares: u256) -> u256 {
            let supply = self.total_supply.read(token_id);
            if supply.is_zero() {
                shares
            } else {
                let numerator: u256 = shares * self.total_assets(token_id);
                let denominator: u256 = supply;
                numerator / denominator
            }
        }


        fn max_deposit(
            self: @ContractState, vault_asset: ContractAddress, address: ContractAddress,
        ) -> u256 {
            max.into()
        }
        fn max_mint(
            self: @ContractState, vault_asset: ContractAddress, address: ContractAddress,
        ) -> u256 {
            max.into()
        }
        fn max_withdraw(
            self: @ContractState, vault_asset: ContractAddress, address: ContractAddress,
        ) -> u256 {
            max.into()
        }
        fn max_redeem(
            self: @ContractState, vault_asset: ContractAddress, address: ContractAddress,
        ) -> u256 {
            max.into()
        }

        fn total_supply(self: @ContractState, tokenId: felt252) -> u256 {
            let supply = self.total_supply.read(tokenId);
            supply
        }

        fn set_operator(
            ref self: ContractState, operator: ContractAddress, approved: bool
        ) -> bool {
            self.pausable.assert_not_paused();
            self.reentrancyguard.start();
            let caller = get_caller_address();
            self.is_operator.write((caller, operator), approved);
            self
                .emit(
                    Event::OperatorSet(OperatorSet { owner: caller, spender: operator, approved, })
                );
            self.reentrancyguard.end();
            true
        }

        fn approve(
            ref self: ContractState, spender: ContractAddress, id: felt252, amount: u256
        ) -> bool {
            let caller = get_caller_address();
            self.allowances.write((caller, spender, id), amount);
            self.emit(Event::Approval(Approval { owner: caller, spender, id, amount, }));
            true
        }

        fn transfer_from(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            id: felt252,
            amount: u256
        ) -> bool {
            let caller = get_caller_address();

            if (from != caller && !self.is_operator.read((from, caller))) {
                let current_allowance = self.allowances.read((from, caller, id));
                assert(current_allowance >= amount, 'insufficient permission');

                if (current_allowance != max.into()) {
                    self.allowances.write((from, caller, id), current_allowance - amount);
                }
            }

            self._transfer(from, to, id, amount);
            true
        }

        fn transfer(
            ref self: ContractState, to: ContractAddress, id: felt252, amount: u256
        ) -> bool {
            let caller = get_caller_address();
            self._transfer(caller, to, id, amount);
            true
        }
        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress, id: felt252
        ) -> u256 {
            self.allowances.read((owner, spender, id))
        }

        fn is_operator(
            self: @ContractState, owner: ContractAddress, operator: ContractAddress
        ) -> bool {
            self.is_operator.read((owner, operator))
        }

        fn balance_of(self: @ContractState, owner: ContractAddress, id: felt252) -> u256 {
            self.balance_of.read((owner, id))
        }

        fn pause(ref self : ContractState){
            self._assert_owner();
            self.pausable.pause();
        }

        fn unpause(ref self : ContractState){
            self._assert_owner();
            self.pausable.unpause();
        }

        fn transfer_assets_to_strategy(ref self: ContractState){
            self._assert_owner();  // replace this strategy address
            self.pausable.assert_not_paused();
            self.reentrancyguard.start();
        
            let total_tokens:u8 = self.next_tokenId.read().try_into().unwrap();
            let strategy_address = get_caller_address();
        
            // Loop through all token IDs (starting from 1 since 0 is not used)
            let mut current_id: u8 = 1;
            loop {
                if current_id > total_tokens {
                    break;
                }
        
                // Get the underlying asset address for this token ID
                let asset_address:ContractAddress = self.tokenId_to_asset.read(current_id.try_into().unwrap());
                
                // Skip if no asset registered for this ID
                if asset_address.is_zero() {
                    current_id += 1;
                    continue;
                }
        
                let erc20_dispatcher = IERC20Dispatcher { contract_address: asset_address };
                
                // Get total assets in vault for this token
                let vault_balance = erc20_dispatcher.balance_of(get_contract_address());
                
                // Calculate 80% of balance (using basis points: 8000 = 80%)
                let transfer_amount = (vault_balance * 8000_u256) / 10000_u256;
                
                // Only transfer if there's a non-zero amount
                if !transfer_amount.is_zero() {
                    // Transfer 80% to strategy
                    erc20_dispatcher.transfer(strategy_address, transfer_amount);
                }
        
                current_id += 1;
            };
        
            self.reentrancyguard.end();
        }   

    }


    #[generate_trait]
    impl InternalFunctionsImpl of InternalFunctions {
        fn _assert_owner(self: @ContractState) {
            assert(get_caller_address() == self.owner.read(), Error::UNAUTHORIZED);
        }

        fn _transfer(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            id: felt252,
            amount: u256
        ) {
            let from_balance = self.balance_of.read((from, id));
            assert(from_balance >= amount, 'insufficient balance');

            self.balance_of.write((from, id), from_balance - amount);
            let to_balance = self.balance_of.read((to, id));
            self.balance_of.write((to, id), to_balance + amount);

            self.emit(Event::Transfer(Transfer { from, to, id, amount, }));
        }


        fn _mint(ref self: ContractState, to: ContractAddress, token_id: felt252, amount: u256) {
            assert(!to.is_zero(), 'INVALID_RECIPIENT');

            self.total_supply.write(token_id, self.total_supply.read(token_id) + amount);

            self.balance_of.write((to, token_id), self.balance_of.read((to, token_id)) + amount);

            self
                .emit(
                    Event::Transfer(
                        Transfer { from: contract_address_const::<0>(), to, id: token_id, amount }
                    )
                );
        }

        fn _burn(ref self: ContractState, from: ContractAddress, token_id: felt252, amount: u256) {
            assert(!from.is_zero(), 'INVALID_SENDER');

            self.total_supply.write(token_id, self.total_supply.read(token_id) - amount);

            self
                .balance_of
                .write((from, token_id), self.balance_of.read((from, token_id)) - amount);

            self
                .emit(
                    Event::Transfer(
                        Transfer { from, to: contract_address_const::<0>(), id: token_id, amount }
                    )
                );
        }

        fn before_withdraw(
            ref self: ContractState, token_id: felt252, assets: u256, shares: u256
        ) {}

        fn after_deposit(ref self: ContractState, token_id: felt252, assets: u256, shares: u256) {}
    }
}

