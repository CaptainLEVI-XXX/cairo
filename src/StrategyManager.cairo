#[starknet::contract]
pub mod StrategyManager {
    use cairo::interfaces::iStrategyManager::IStrategyManager;
    use cairo::interfaces::iPoolManager::IPoolManager;
    use core::traits::{Into, TryInto};
    use core::num::traits::Zero;
    use starknet::{
        get_caller_address, ContractAddress, ClassHash, contract_address_const, get_contract_address
    };
    use openzeppelin::{
        security::reentrancyguard::ReentrancyGuardComponent,
        upgrades::upgradeable::UpgradeableComponent,
        introspection::src5::SRC5Component,
    };
    use cairo::interfaces::iERC20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[derive(Copy, Drop, Serde, starknet::Store)]
    pub struct StrategyInfo {
        pub name: felt252,
        pub address: ContractAddress,
        pub deposit_selector: felt252,
        pub withdraw_selector: felt252,
        pub is_registered: bool,
    }

    // Error definitions
    mod Errors {
        pub const UNAUTHORIZED: felt252 = 'Unauthorized';
        pub const INVALID_STRATEGY: felt252 = 'Invalid strategy';
        pub const STRATEGY_ALREADY_EXISTS: felt252 = 'Strategy already exists';
        pub const STRATEGY_NOT_FOUND: felt252 = 'Strategy not found';
    }

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(
        path: ReentrancyGuardComponent, storage: reentrancyguard, event: ReentracnyGuardEvent
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[storage]
    struct Storage {
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        reentrancyguard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        strategy_info: Map<felt252, StrategyInfo>,
        pool_info: Map<felt252,ContractAddress>,
        next_strategy_id: felt252,
        total_registered_strategies: u256,
        elizia: ContractAddress,
        owner: ContractAddress,
        next_pool_id:u256,
        jediswap_router:ContractAddress
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        StrategyRegistered: StrategyRegistered,
        StrategyRemoved: StrategyRemoved,
        StrategyUpdated: StrategyUpdated
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

    #[constructor]
    fn constructor(ref self: ContractState, elizia_: ContractAddress, owner_: ContractAddress) {
        self.elizia.write(elizia_);
        self.owner.write(owner_);
        self.next_strategy_id.write(1);
    }

    #[abi(embed_v0)]
    impl StrategyManager of IStrategyManager<ContractState> {
        fn add_pool(ref self:ContractState,pool_address:ContractAddress)->felt252{

            self._assert_only_owner();

            assert(!pool_address.is_zero(), Errors::INVALID_STRATEGY);

            let pool_id = self.next_pool_id.read();

            self.pool_info.write(pool_id,pool_address);
            self.next_pool_id.write(pool_id + 1);

            pool_id
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
            self.emit(
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
            self.emit(
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
            self.next_strategy_id.read().try_into().unwrap();
        }

        fn request_funds_from_pool(ref self: ContractState,pool_id:felt252,strategy_id:felt252){
            let pool_address:ContractAddress =  self.pool_info(felt252);
            assert(!pool_address.is_zero(), Errors::STRATEGY_NOT_FOUND);
            _assert_only_elizia();
            _assert_strategy_exist(strategy_id);
            let strategy_info = self.strategy_info.read(strategy_id);
            let selector: felt252 = strategy_info.deposit_selector;
            let pool_dispatcher:IPoolDispatcher = IPoolDispatcher{
                contract_address:pool_address
            };
            pool_dispatcher.transfer_assets_to_strategy(strategy_info.address);

            self._swap

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

        fn _assert_strategy_exist(self:@ContractState, strategy_id:felt252){
            let strategy_info = self.strategy_info.read(strategy_id);
            assert(strategy_info.is_registered, Errors::UNAUTHORIZED);
        }

        // fn _selector_for_action_type(self:@ContractState,strategy_id:felt252, action_type:u8)->felt252{
        //     let strategy_info = self.strategy_info.read(strategy_id);
        //     let result:felt252; 
        //     if action_type == 0.into() result = strategy_info.deposit_selector;
        //     else if action_type ==1.into() result =strategy_info.withdraw_selector;
        //     else result = 0.into();
        //     assert(result!= 0.into(),Errors::UNAUTHORIZED);

        // }

        fn _execute_swap(ref self ContractState)

        fn _jedi_swap(
            ref self: ContractState,
            asset_from: ContractAddress,
            asset_to: ContractAddress,
            amount_in: u256,
            routerAddr: ContractAddress
        ) -> u256 {
            if (asset_from == asset_to) {
                return (amount_in);
            }

            let contract_address = get_contract_address();
            let block_timestamp = get_block_timestamp();
            let deadline = block_timestamp + 100;
            assert(!routerAddr.is_zero(), 'jedi router 0');

            let mut path: Array<ContractAddress> = array![];
            path.append(asset_from);
            path.append(asset_to);

            let erc20_dispatcher :IERC20Dispatcher = IERC20Dispatcher{contract_address :asset_from };

            erc20_dispatcher.approve(routerAddr, amount_in);

            // change this to use the above.
            let router = self._get_jedi_router();
            let amounts = router
                .swap_exact_tokens_for_tokens(amount_in, 0, path, contract_address, deadline);
            return (*amounts.at(amounts.len() - 1));
        }

    }
}