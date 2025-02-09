use starknet::ContractAddress;


#[starknet::contract]
pub mod ZKLendIntegration {
    // Starknet imports

    use starknet::contract_address::contract_address_const;
    use core::traits::{Mul};
    use cairo::interfaces::iERC20::{IERC20Dispatcher, IERC20DispatcherTrait};

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);


    use starknet::{get_contract_address, get_block_timestamp, ContractAddress};
     

    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};


    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct zkLendSpend{
        asset:ContractAddress,
        amount:u256
    }

    #[storage]
    struct Storage {
    owner:ContractAddress,
       elizia: ContractAddress,
       zklend_router: ContractAddress,
       spend_info:Map<u256,zkLendSpend>,
       spendId:u256,
       #[substorage(v0)]
       upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop,Serde, starknet::Event)]
    enum Event {
        #[flat]
        Deposited: Deposited,
        Withdraw: Withdraw,
        #[flat]
        PausableEvent: PausableComponent::Event
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct Deposited {
        #[key]
        asset: ContractAddress,
        #[key]
        amount:u256
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct Withdraw{
        #[key]
        asset: ContractAddress,
        #[key]
        amount:u256
    }
  
    #[abi(embed_v0)]
    impl ZKLendImpl of IZKLendIntegration<ContractState> {

        fn upgrade_class_hash(ref self: ContractState, class_hash: ClassHash) {
            assert(get_caller_address()==self.owner.read(),"Invalid Caller");
            self.upgradeable.upgrade(class_hash);
        }

        fn deposit_zklend(
            ref self: ContractState,asset:ContractAddress,amount:u256 
        )->(u256,u256){
            let this:ContractAddress = get_contract_address();
            let zkLendParams:zkLendSpend = zkLendSpend{ asset:asset,amount:amount};

            let asset:ContractAddress = zkLendParams.asset;
            assert(get_caller_address()==self.elizia.read(),"Invalid Caller");
            assert(is_asset_supported(asset),"Asset: Not supported");


            let (amount_out) = self
                ._zk_deposit(asset, zkLendParams.amount);

                let nextid:u256 = self.spendId.read() + 1;
            
            self.spendId.write(nextid);
                
                self.spend_info.write(nextid,zkLendParams);

            (amount_out,id)

        }

        fn withdraw_zklend(
            ref self: ContractState, id: u256
        )->u256{
            
            let spend_info = self.spend_info.read(id);
            let asset_to =spend_info.asset;
            assert(get_caller_address()==self.elizia.read(),"Invalid Caller");
            let scaled_up_balance = self
                ._get_scaled_up_amount(asset_to, spend_info.amount);

            let amount_out: u256 = self._zk_withdaw(asset_to, scaled_up_balance);

           return amount_out;
        }

        fn is_asset_supported(self:@TContractState, asset:ContractAddress)->bool{
            //implement this logic 
            true
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _zk_deposit(
            ref self: ContractState, asset_from: ContractAddress, amount_in: u256
        ) -> (u256) {
            let zklend_router = self.zklend_router.read();
            let zklend_dispatcher = IZKLendDispatcher { contract_address:zklend_router
                
            };
            let erc20_dispatcher: IERC20Dispatcher = IZKLendDispatcher{ contract_address:asset_from };
            //// println!("deposit_zklend: asset_from: {:?}, amount_in: {:?}", asset_from, amount_in);
            erc20_dispatcher.approve(zklend_router, amount_in);

            //// println!("deposit_zklend: depositing");
            let scaled_down_amount = self._get_scaled_down_amount(asset_from, amount_in);
           
            zklend_dispatcher.deposit(asset_from, amount_in.try_into().unwrap());
           

            return (scaled_down_amount);
        }


        fn _zk_withdaw(ref self: ContractState, asset: ContractAddress, amount_in: u256) -> u256 {
            let contract_address = get_contract_address();

            let erc20_dispatcher:IERC20Dispatcher =  IERC20Dispatcher{ contract_address: asset};

            let zklend_dispatcher = IZKLendDispatcher {
                contract_address: self.zklend_router.read()
            };
            let initial_contract_balance: u256 = erc20_dispatcher.balanceOf(contract_address);

            zklend_dispatcher.withdraw(asset, amount_in.try_into().unwrap());
            let current_contract_balance: u256 = erc20_dispatcher.balanceOf(contract_address);
            let user_balance: u256 = current_contract_balance - initial_contract_balance;
            return (user_balance);
        }

        fn _get_scaled_up_amount(
            self: @ContractState, asset: ContractAddress, raw_amount: u256
        ) -> u256 {
            let zklend_dispatcher = IZKLendDispatcher {
                contract_address: self.zklend_router.read()
            };
            let accumulator: u256 = zklend_dispatcher.get_lending_accumulator(asset).into();
            let scaled_up_balance = raw_amount * accumulator;
            return scaled_up_balance;
        }

        fn _get_scaled_down_amount(
            self: @ContractState, asset: ContractAddress, amount: u256
        ) -> u256 {
            let zklend_dispatcher = IZKLendDispatcher {
                contract_address: self.zklend_router.read()
            };
            let accumulator: u256 = zklend_dispatcher.get_lending_accumulator(asset).into();
            let scaled_down_balance = amount/accumulator;
            return scaled_down_balance;
        }
    }
}

