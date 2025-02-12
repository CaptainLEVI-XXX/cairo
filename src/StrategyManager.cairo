#[starknet::contract]
pub mod StrategyManager {
    use cairo::interfaces::iStrategyManager::{IStrategyManager, StrategyInfo, DepositedInfo};
    use cairo::interfaces::iPoolManager::{IPoolManagerDispatcher, IPoolManagerDispatcherTrait};
    use core::traits::Into;
    use core::num::traits::Zero;
    use starknet::{
        get_caller_address, ContractAddress, ClassHash, get_contract_address, get_block_timestamp
    };
    use openzeppelin::{
        security::reentrancyguard::ReentrancyGuardComponent, security::pausable::PausableComponent,
        upgrades::upgradeable::UpgradeableComponent, introspection::src5::SRC5Component,
    };
    use cairo::interfaces::IERC20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use cairo::interfaces::iJediswapRouter::{
        IJediswapRouterDispatcher, IJediswapRouterDispatcherTrait
    };
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::syscalls::call_contract_syscall;


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
    struct Storage {
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        reentrancyguard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        strategy_info: Map<felt252, StrategyInfo>,
        pool_info: Map<felt252, ContractAddress>,
        deposit_id: felt252,
        // deposited_info: Map<felt252, DepositedInfo>,
        next_strategy_id: felt252,
        total_registered_strategies: u256,
        elizia: ContractAddress,
        owner: ContractAddress,
        next_pool_id: felt252,
        jediswap_router: ContractAddress,
        // Serialization approach storage
        deposited_info_data: Map<(felt252, u32), felt252>, // (deposit_id, index) -> serialized data
        deposited_info_length: Map<felt252, u32>, // deposit_id -> length of serialized data
    }
    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        ReentracnyGuardEvent: ReentrancyGuardComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
        StrategyRegistered: StrategyRegistered,
        StrategyRemoved: StrategyRemoved,
        StrategyUpdated: StrategyUpdated,
        PoolAdded: PoolAdded,
        FundsRequested: FundsRequested,
        RouterUpdated: RouterUpdated
    }

    #[derive(Drop, starknet::Event)]
    pub struct StrategyRegistered {
        #[key]
        name: felt252,
        #[key]
        strategy_id: felt252,
        #[key]
        address: ContractAddress,
        deposit_selector: felt252,
        withdraw_selector: felt252
    }

    #[derive(Drop, starknet::Event)]
    pub struct StrategyRemoved {
        #[key]
        strategy_id: felt252
    }

    #[derive(Drop, starknet::Event)]
    pub struct StrategyUpdated {
        #[key]
        strategy_id: felt252,
        #[key]
        address: ContractAddress,
        deposit_selector: felt252,
        withdraw_selector: felt252
    }
    #[derive(Drop, starknet::Event)]
    pub struct PoolAdded {
        #[key]
        pool_id: felt252,
        #[key]
        pool_address: ContractAddress
    }


    #[derive(Drop, starknet::Event)]
    pub struct FundsRequested {
        #[key]
        pool_id: felt252,
        #[key]
        strategy_id: felt252,
        #[key]
        asset_to: ContractAddress,
        amount: u256,
        deposit_id: felt252
    }

    #[derive(Drop, starknet::Event)]
    pub struct RouterUpdated {
        #[key]
        old_router: ContractAddress,
        #[key]
        new_router: ContractAddress
    }
    mod Errors {
        pub const UNAUTHORIZED: felt252 = 'Unauthorized';
        pub const INVALID_STRATEGY: felt252 = 'Invalid strategy';
        pub const STRATEGY_ALREADY_EXISTS: felt252 = 'Strategy already exists';
        pub const STRATEGY_NOT_FOUND: felt252 = 'Strategy not found';
        pub const ZERO_ADDRESS: felt252 = 'zero address';
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        elizia_: ContractAddress,
        owner_: ContractAddress,
        jediswap_router_: ContractAddress
    ) {
        // Validate inputs
        assert(!elizia_.is_zero(), Errors::ZERO_ADDRESS);
        assert(!owner_.is_zero(), Errors::ZERO_ADDRESS);
        assert(!jediswap_router_.is_zero(), Errors::ZERO_ADDRESS);

        // Initialize storage
        self.elizia.write(elizia_);
        self.owner.write(owner_);
        self.jediswap_router.write(jediswap_router_);

        // Initialize counters
        self.next_strategy_id.write(1);
        self.next_pool_id.write(1);
        self.deposit_id.write(0);
        self.total_registered_strategies.write(0);
    }


    #[abi(embed_v0)]
    pub impl StrategyManager of IStrategyManager<ContractState> {
        fn get_pool(self: @ContractState, pool_id: felt252) -> ContractAddress {
            self.pool_info.read(pool_id)
        }

        fn get_total_pools(self: @ContractState) -> felt252 {
            self.next_pool_id.read() - 1
        }

        // View functions for deposits
        fn get_deposit_info(self: @ContractState, deposit_id: felt252) -> DepositedInfo {
            self.load_deposited_info(deposit_id)
        }

        fn get_total_deposits(self: @ContractState) -> felt252 {
            self.deposit_id.read()
        }
        // Enhanced version of add_pool with event emission
        fn add_pool(ref self: ContractState, pool_address: ContractAddress) -> felt252 {
            self._assert_only_owner();
            self.reentrancyguard.start();

            assert(!pool_address.is_zero(), Errors::INVALID_STRATEGY);

            let pool_id = self.next_pool_id.read();
            self.pool_info.write(pool_id, pool_address);
            self.next_pool_id.write(pool_id + 1);

            // Emit event
            self.emit(Event::PoolAdded(PoolAdded { pool_id, pool_address }));

            self.reentrancyguard.end();
            pool_id
        }

        fn update_jediswap_router(ref self: ContractState, new_router: ContractAddress) {
            self._assert_only_owner();
            assert(!new_router.is_zero(), 'Invalid router address');

            let old_router = self.jediswap_router.read();
            self.jediswap_router.write(new_router);

            self.emit(Event::RouterUpdated(RouterUpdated { old_router, new_router }));
        }

        fn add_strategy(
            ref self: ContractState,
            name: felt252,
            strategy_address: ContractAddress,
            class_hash: ClassHash,
            deposit_selector: felt252,
            withdraw_selector: felt252
        ) -> felt252 {
            // Access control
            self._assert_only_owner();
            self.reentrancyguard.start();

            // Verify strategy address is valid
            assert(!strategy_address.is_zero(), Errors::INVALID_STRATEGY);

            // Get new strategy ID
            let strategy_id = self.next_strategy_id.read();

            // Create strategy info
            let strategy = StrategyInfo {
                name: name,
                address: strategy_address,
                deposit_selector: deposit_selector,
                withdraw_selector: withdraw_selector,
                is_registered: true,
            };

            // Store strategy info
            self.strategy_info.write(strategy_id, strategy);

            // Increment counters
            self.next_strategy_id.write(strategy_id + 1);
            // Emit event
            self
                .emit(
                    Event::StrategyRegistered(
                        StrategyRegistered {
                            name: name,
                            strategy_id: strategy_id,
                            address: strategy_address,
                            deposit_selector: deposit_selector,
                            withdraw_selector: withdraw_selector
                        }
                    )
                );

            self.reentrancyguard.end();
            strategy_id
        }

        fn remove_strategy(ref self: ContractState, strategy_id: felt252) {
            self._assert_only_owner();
            self.reentrancyguard.start();

            // Verify strategy exists and is registered
            let mut strategy = self.strategy_info.read(strategy_id);
            assert(strategy.is_registered, Errors::STRATEGY_NOT_FOUND);

            // Deactivate strategy
            strategy.is_registered = false;
            self.strategy_info.write(strategy_id, strategy);

            // Emit event
            self.emit(Event::StrategyRemoved(StrategyRemoved { strategy_id }));

            self.reentrancyguard.end();
        }

        fn update_elizia(ref self:ContractState, new_:ContractAddress){
            self._assert_only_owner();
            self.elizia.write(new_);
        }

        fn update_strategy(
            ref self: ContractState,
            strategy_id: felt252,
            strategy_address: ContractAddress,
            deposit_selector: felt252,
            withdraw_selector: felt252
        ) {
            self._assert_only_owner();
            self.reentrancyguard.start();

            // Verify strategy exists
            let mut strategy = self.strategy_info.read(strategy_id);
            assert(strategy.is_registered, Errors::STRATEGY_NOT_FOUND);

            // Update strategy info
            strategy.address = strategy_address;
            strategy.deposit_selector = deposit_selector;
            strategy.withdraw_selector = withdraw_selector;

            self.strategy_info.write(strategy_id, strategy);

            // Emit event
            self
                .emit(
                    Event::StrategyUpdated(
                        StrategyUpdated {
                            strategy_id,
                            address: strategy_address,
                            deposit_selector,
                            withdraw_selector
                        }
                    )
                );

            self.reentrancyguard.end();
        }

        // View functions
        fn get_strategy(self: @ContractState, strategy_id: felt252) -> StrategyInfo {
            self.strategy_info.read(strategy_id)
        }

        fn get_total_strategies(self: @ContractState) -> u256 {
            // self.next_strategy_id.read().try_into()
            3
        }
        fn request_funds_from_pool(
            ref self: ContractState,
            pool_id: felt252,
            strategy_id: felt252,
            assets_to: ContractAddress
        ) -> DepositedInfo {
            self.pausable.assert_not_paused();
            self.reentrancyguard.start();

            let result = self._request_funds_from_pool_internal(pool_id, strategy_id, assets_to);

            // Emit event
            self
                .emit(
                    Event::FundsRequested(
                        FundsRequested {
                            pool_id,
                            strategy_id,
                            asset_to: assets_to,
                            amount: result.amount,
                            deposit_id: self.deposit_id.read()
                        }
                    )
                );

            self.reentrancyguard.end();
            result
        }
    }

    // Internal functions trait
    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _assert_only_owner(self: @ContractState) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), Errors::UNAUTHORIZED);
        }

        fn _assert_only_elizia(self: @ContractState) {
            let caller = get_caller_address();
            assert(caller == self.elizia.read(), Errors::UNAUTHORIZED);
        }

        fn _assert_strategy_exist(self: @ContractState, strategy_id: felt252) {
            let strategy_info = self.strategy_info.read(strategy_id);
            assert(strategy_info.is_registered, Errors::UNAUTHORIZED);
        }

        fn _execute_swap(
            ref self: ContractState,
            amounts: Array<u256>,
            assets: Array<ContractAddress>,
            asset_to: ContractAddress
        ) -> u256 {
            assert(assets.len() > 0, 'empty assets array');
            assert(amounts.len() > 0, 'empty amounts array');
            assert(assets.len() == amounts.len(), 'length mismatch');

            let mut i: u32 = 0;
            let mut total_amount: u256 = 0;

            loop {
                if i >= assets.len() {
                    break;
                }

                let current_asset = *assets.at(i);
                let current_amount = *amounts.at(i);

                if current_asset == asset_to {
                    total_amount = total_amount + current_amount;
                } else {
                    let swapped_amount = self._jedi_swap(current_asset, asset_to, current_amount);
                    total_amount = total_amount + swapped_amount;
                }

                i += 1;
            };

            total_amount
        }

        fn _request_funds_from_pool_internal(
            ref self: ContractState,
            pool_id: felt252,
            strategy_id: felt252,
            assets_to: ContractAddress
        ) -> DepositedInfo {
            let pool_address = self.pool_info.read(pool_id);
            assert(!pool_address.is_zero(), Errors::STRATEGY_NOT_FOUND);
            self._assert_only_elizia();
            self._assert_strategy_exist(strategy_id);

            let strategy_info = self.strategy_info.read(strategy_id);
            let selector: felt252 = strategy_info.deposit_selector;

            let pool_dispatcher = IPoolManagerDispatcher { contract_address: pool_address };
            let (amounts, assets) = pool_dispatcher
                .transfer_assets_to_strategy(strategy_info.address);

            let total_amount = self._execute_swap(amounts.clone(), assets.clone(), assets_to);

            let mut calldata = ArrayTrait::new();
            calldata.append(total_amount.try_into().unwrap());
            calldata.append(assets_to.into());

            let _ = call_contract_syscall(strategy_info.address, selector, calldata.span())
                .unwrap();

            let deposit_id = self.deposit_id.read();
            let deposited_info = DepositedInfo {
                amount: total_amount,
                asset: assets_to,
                timestamp: get_block_timestamp().into(),
                amounts,
                assets,
            };

            self.store_deposited_info(deposit_id, deposited_info.clone());
            self.deposit_id.write(deposit_id + 1);

            deposited_info
        }

        fn _jedi_swap(
            ref self: ContractState,
            asset_from: ContractAddress,
            asset_to: ContractAddress,
            amount_in: u256
        ) -> u256 {
            let router_address: ContractAddress = self.jediswap_router.read();

            if (asset_from == asset_to) {
                return (amount_in);
            }

            let contract_address = get_contract_address();
            let block_timestamp = get_block_timestamp();
            let deadline = block_timestamp + 100;
            assert(!router_address.is_zero(), 'jedi router 0');

            let mut path: Array<ContractAddress> = array![];
            path.append(asset_from);
            path.append(asset_to);

            let erc20_dispatcher: IERC20Dispatcher = IERC20Dispatcher {
                contract_address: asset_from
            };

            erc20_dispatcher.approve(router_address, amount_in);

            // change this to use the above.
            let router = self._get_jedi_router();
            let amounts = router
                .swap_exact_tokens_for_tokens(amount_in, 0, path, contract_address, deadline);
            return (*amounts.at(amounts.len() - 1));
        }

        fn _get_jedi_router(self: @ContractState) -> IJediswapRouterDispatcher {
            let jediswap_router = IJediswapRouterDispatcher {
                contract_address: self.jediswap_router.read()
            };
            jediswap_router
        }
    }


    #[generate_trait]
    impl SerializationImpl of SerializationTrait {
        fn store_deposited_info(ref self: ContractState, deposit_id: felt252, info: DepositedInfo) {
            let mut serialized = self._serialize_deposited_info(info);
            let length = serialized.len();

            // Store length
            self.deposited_info_length.write(deposit_id, length);

            // Store each element individually
            let mut i: u32 = 0;
            loop {
                if i >= length {
                    break;
                }
                self.deposited_info_data.write((deposit_id, i), *serialized.at(i.into()));
                i += 1;
            }
        }

        fn load_deposited_info(self: @ContractState, deposit_id: felt252) -> DepositedInfo {
            let length = self.deposited_info_length.read(deposit_id);

            // Recreate the serialized array
            let mut serialized = ArrayTrait::new();
            let mut i: u32 = 0;
            loop {
                if i >= length {
                    break;
                }
                let value = self.deposited_info_data.read((deposit_id, i));
                serialized.append(value);
                i += 1;
            };

            self._deserialize_deposited_info(serialized.span())
        }

        // Helper function to create serialized array (not stored)
        fn _serialize_deposited_info(self: @ContractState, info: DepositedInfo) -> Array<felt252> {
            let mut serialized: Array<felt252> = ArrayTrait::new();

            // Serialize basic fields
            serialized.append(info.amount.try_into().unwrap());
            serialized.append(info.asset.into());
            serialized.append(info.timestamp.try_into().unwrap());

            // Serialize arrays length
            serialized.append(info.amounts.len().into());

            // Serialize amounts
            let mut i = 0;
            loop {
                if i >= info.amounts.len() {
                    break;
                }
                serialized.append((*info.amounts.at(i)).try_into().unwrap());
                i += 1;
            };

            // Serialize assets
            let mut i = 0;
            loop {
                if i >= info.assets.len() {
                    break;
                }
                serialized.append((*info.assets.at(i)).into());
                i += 1;
            };

            serialized
        }

        fn _deserialize_deposited_info(
            self: @ContractState, serialized: Span<felt252>
        ) -> DepositedInfo {
            let mut current_index = 0;

            // Deserialize basic fields
            let amount: u256 = (*serialized.at(current_index)).into();
            current_index += 1;
            let asset: ContractAddress = (*serialized.at(current_index)).try_into().unwrap();
            current_index += 1;
            let timestamp: u256 = (*serialized.at(current_index)).into();
            current_index += 1;

            // Get arrays length
            let array_length: u32 = (*serialized.at(current_index)).try_into().unwrap();
            current_index += 1;

            // Deserialize amounts
            let mut amounts = ArrayTrait::new();
            let mut i = 0;
            loop {
                if i >= array_length {
                    break;
                }
                amounts.append((*serialized.at(current_index + i)).into());
                i += 1;
            };
            current_index += array_length;

            // Deserialize assets
            let mut assets = ArrayTrait::new();
            let mut i = 0;
            loop {
                if i >= array_length {
                    break;
                }
                assets.append((*serialized.at(current_index + i)).try_into().unwrap());
                i += 1;
            };

            DepositedInfo { amount, asset, timestamp, amounts, assets, }
        }
    }
}
