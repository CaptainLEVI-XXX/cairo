#[starknet::contract]
pub mod PoolManagerFactory {
    use cairo::interfaces::iPoolManagerFactory::IPoolManagerFactory;
    use starknet::{
        ClassHash,
        ContractAddress,
        SyscallResultTrait
    };
    use openzeppelin::utils::deployments;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        pool_manager_class_hash:ClassHash,
        deployment_count:u256
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
    }

    #[abi(embed_v0)]
    impl PoolManagerFactory of IPoolManagerFactory<ContractState> {
        fn deploy_new_contract(
            ref self: ContractState,
            salt: felt252,
            class_hash: ClassHash,
            constructor_calldata: Array<felt252>
        ) -> ContractAddress {
            // Deploy the contract
            let (contract_address, _) = starknet::syscalls::deploy_syscall(
                class_hash,
                salt,
                constructor_calldata.span(),
                false
            ).unwrap_syscall();

            // Update state
            let count = self.deployment_count.read();
            self.deployment_count.write(count + 1);

            contract_address
        }

        fn predict_address(
            self: @ContractState,

            salt: felt252,
            class_hash: ClassHash,
            constructor_calldata: Array<felt252>
        ) -> ContractAddress {
            // Calculate the expected contract address
            deployments::calculate_contract_address_from_deploy_syscall(
                salt,
                class_hash,
                constructor_calldata.span(),
                starknet::contract_address_const::<0>()
            )
        }
        fn get_deployment_count(self: @ContractState) -> u256 {
            self.deployment_count.read()
        }
    }
}