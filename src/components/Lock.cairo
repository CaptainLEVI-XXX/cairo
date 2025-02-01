#[starknet::component]
pub mod PoolManagerFactory {
    use cairo::interfaces::iPoolManagerFactory::IPoolManagerFactory;
    use starknet::{
        ClassHash,
        ContractAddress,
        SyscallResultTrait,
        get_caller_address()
    };
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[derive(Drop, Serde, starknet::Store)]
    struct LockInfo {
    lock_end: u64,     // Timestamp when lock ends
    lock_period: u256,  // Lock period in days
    amount_locked: u256, // Amount of tokens locked
    }

    #[storage]
    struct Storage {
        // address,tokenId->lockInfo
       user_locks:Map<(ContractAddress,felt252),LockInfo>
    }

    #[event]
    pub enum Event {
        AssetLocked: AssetLocked
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct AssetLocked {
    #[key]
    user: ContractAddress,
    #[key]
    token_id: felt252,
    amount: u256,
    lock_period: u256,
    lock_end: u64
}

#[embeddable_as(LockImpl)]
impl Lock<
    TContractState, +HasComponent<TContractState>,
> of ILock<ComponentState<TContractState>> {
    /// Returns true if the contract is paused, and false otherwise.
    fn get_lock_info(self: @ComponentState<TContractState>,user:ContractAddress,tokenId:felt252) -> bool {
        self.Pausable_paused.read()
    }


}



    #[generate_trait]
    impl InternalFunctionsImpl of InternalFunctions {

        fn update_lock_info(ref self :ComponentState,lock_days:u64,receiver:ContractAddress,tokenId:felt252,assets:u256){

            // Calculate lock end time
           let lock_end = get_block_timestamp() + (lock_days * 86400_u64); // 86400 seconds per day
              
           // Store lock information
           let lock_info = LockInfo {
            lock_end,
            lock_period: lock_days,
            amount_locked: assets,
            initial_shares: shares
            };

           self.user_locks.write((receiver, tokenId), lock_info);

           self.emit(
            Event::AssetLocked(
                AssetLocked { 
                    user: receiver,
                    token_id: tokenId,
                    amount: assets,
                    lock_period: lock_days,
                    lock_end
                }
            );
        )
        }



    }
}