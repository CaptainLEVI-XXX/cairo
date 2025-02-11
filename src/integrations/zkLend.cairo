#[starknet::contract]
pub mod ZKLendIntegration {
    use starknet::{get_contract_address, get_caller_address, get_block_timestamp, ContractAddress, ClassHash};
    use core::traits::Into;
    use core::num::traits::Zero;
    use cairo::interfaces::IERC20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use cairo::interfaces::iZKLendIntegration::IZKLendIntegration;
    use cairo::interfaces::iZKLend::{IZKLendDispatcher, IZKLendDispatcherTrait};
    use openzeppelin::upgrades::upgradeable::UpgradeableComponent;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    // Error definitions
    mod Errors {
        pub const INVALID_CALLER: felt252 = 'Invalid caller';
        pub const UNSUPPORTED_ASSET: felt252 = 'Asset not supported';
        pub const INVALID_AMOUNT: felt252 = 'Invalid amount';
        pub const ZERO_ADDRESS: felt252 = 'Zero address not allowed';
        pub const DEPOSIT_FAILED: felt252 = 'Deposit failed';
        pub const WITHDRAW_FAILED: felt252 = 'Withdraw failed';
    }

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct ZkLendSpend {
        asset: ContractAddress,
        amount: u256,
        timestamp: u64
    }

    #[storage]
    struct Storage {
        owner: ContractAddress,
        strategy_manager: ContractAddress,
        zklend_router: ContractAddress,
        spend_info: Map<u256, ZkLendSpend>,
        spend_id: u256,
        supported_assets: Map<ContractAddress, bool>,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Deposited: Deposited,
        Withdrawn: Withdrawn,
        AssetSupported: AssetSupported,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct Deposited {
        #[key]
        asset: ContractAddress,
        #[key]
        amount: u256,
        scaled_amount: u256,
        spend_id: u256
    }

    #[derive(Drop, starknet::Event)]
    struct Withdrawn {
        #[key]
        asset: ContractAddress,
        #[key]
        amount: u256,
        scaled_amount: u256,
        spend_id: u256
    }

    #[derive(Drop, starknet::Event)]
    struct AssetSupported {
        #[key]
        asset: ContractAddress,
        supported: bool
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner_: ContractAddress,
        strategy_manager_: ContractAddress,
        zklend_router_: ContractAddress
    ) {
        assert(!owner_.is_zero(), Errors::ZERO_ADDRESS);
        assert(!strategy_manager_.is_zero(), Errors::ZERO_ADDRESS);
        assert(!zklend_router_.is_zero(), Errors::ZERO_ADDRESS);
        
        self.owner.write(owner_);
        self.strategy_manager.write(strategy_manager_);
        self.zklend_router.write(zklend_router_);
        self.spend_id.write(0);
    }

    #[abi(embed_v0)]
    impl ZKLendImpl of IZKLendIntegration<ContractState> {
        fn upgrade_class_hash(ref self: ContractState, class_hash: ClassHash) {
            self._assert_only_owner();
            self.upgradeable.upgrade(class_hash);
        }

        fn deposit_zklend(
            ref self: ContractState,
            asset: ContractAddress,
            amount: u256
        ) -> (u256, ContractAddress, u256) {
            // Access control
            self._assert_only_strategy_manager();
            assert(self.is_asset_supported(asset), Errors::UNSUPPORTED_ASSET);
            assert(!asset.is_zero(), Errors::ZERO_ADDRESS);
            assert(amount > 0, Errors::INVALID_AMOUNT);

            // Create spend info
            let zk_lend_params = ZkLendSpend {
                asset,
                amount,
                timestamp: get_block_timestamp().try_into().unwrap()
            };

            // Perform deposit
            let scaled_amount = self._zk_deposit(asset, amount);
            
            // Update storage
            let spend_id = self.spend_id.read() + 1;
            self.spend_info.write(spend_id, zk_lend_params);
            self.spend_id.write(spend_id);

            // Emit event
            self.emit(Event::Deposited(
                Deposited {
                    asset,
                    amount,
                    scaled_amount,
                    spend_id
                }
            ));

            (scaled_amount, asset, spend_id)
        }

        fn withdraw_zklend(ref self: ContractState, id: u256) -> u256 {
            // Access control
            self._assert_only_strategy_manager();
            
            // Get spend info
            let spend_info = self.spend_info.read(id);
            assert(!spend_info.asset.is_zero(), 'Invalid spend ID');

            // Calculate withdrawal amount
            let scaled_up_balance = self._get_scaled_up_amount(
                spend_info.asset,
                spend_info.amount
            );

            // Perform withdrawal
            let amount_out = self._zk_withdraw(spend_info.asset, scaled_up_balance);

            // Emit event
            self.emit(Event::Withdrawn(
                Withdrawn {
                    asset: spend_info.asset,
                    amount: amount_out,
                    scaled_amount: scaled_up_balance,
                    spend_id: id
                }
            ));

            amount_out
        }

        fn is_asset_supported(self: @ContractState, asset: ContractAddress) -> bool {
            self.supported_assets.read(asset)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _assert_only_owner(self: @ContractState) {
            assert(get_caller_address() == self.owner.read(), Errors::INVALID_CALLER);
        }

        fn _assert_only_strategy_manager(self: @ContractState) {
            assert(
                get_caller_address() == self.strategy_manager.read(),
                Errors::INVALID_CALLER
            );
        }

        fn _zk_deposit(
            ref self: ContractState,
            asset_from: ContractAddress,
            amount_in: u256
        ) -> u256 {
            let zklend_router = self.zklend_router.read();
            let zklend_dispatcher = IZKLendDispatcher { contract_address: zklend_router };
            
            // First approve the transfer
            let erc20_dispatcher = IERC20Dispatcher { contract_address: asset_from };
            erc20_dispatcher.approve(zklend_router, amount_in);

            // Calculate scaled amount before deposit
            let scaled_down_amount = self._get_scaled_down_amount(asset_from, amount_in);
            
            // Perform deposit
            zklend_dispatcher.deposit(asset_from, amount_in.try_into().unwrap());

            scaled_down_amount
        }

        fn _zk_withdraw(
            ref self: ContractState,
            asset: ContractAddress,
            amount_in: u256
        ) -> u256 {
            let contract_address = get_contract_address();
            let erc20_dispatcher = IERC20Dispatcher { contract_address: asset };
            let zklend_dispatcher = IZKLendDispatcher {
                contract_address: self.zklend_router.read()
            };

            // Record initial balance
            let initial_balance = erc20_dispatcher.balance_of(contract_address);

            // Perform withdrawal
            zklend_dispatcher.withdraw(asset, amount_in.try_into().unwrap());

            // Calculate actual withdrawn amount
            let final_balance = erc20_dispatcher.balance_of(contract_address);
            assert(final_balance >= initial_balance, 'Invalid withdrawal');
            
            final_balance - initial_balance
        }

        fn _get_scaled_up_amount(
            self: @ContractState,
            asset: ContractAddress,
            raw_amount: u256
        ) -> u256 {
            let zklend_dispatcher = IZKLendDispatcher {
                contract_address: self.zklend_router.read()
            };
            let accumulator: u256 = zklend_dispatcher.get_lending_accumulator(asset).into();
            raw_amount * accumulator
        }

        fn _get_scaled_down_amount(
            self: @ContractState,
            asset: ContractAddress,
            amount: u256
        ) -> u256 {
            let zklend_dispatcher = IZKLendDispatcher {
                contract_address: self.zklend_router.read()
            };
            let accumulator: u256 = zklend_dispatcher.get_lending_accumulator(asset).into();
            amount / accumulator
        }
    }
}