use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
    stop_cheat_caller_address
};
use starknet::contract_address::contract_address_const;
use starknet::ContractAddress;
use core::traits::Into;

use cairo::interfaces::iPoolManager::{IPoolManagerDispatcher, IPoolManagerDispatcherTrait};
use cairo::interfaces::IERC20::{IERC20Dispatcher, IERC20DispatcherTrait};

// Helper function to deploy mock ERC20 token
fn deploy_mock_token() -> ContractAddress {
    let erc20_class = declare("MockERC20").unwrap().contract_class();
    let mut calldata = ArrayTrait::new();
    let (tokenaddress, _) = erc20_class.deploy(@calldata).unwrap();
    println!("Im here mock token");
    tokenaddress
}

// Helper function to deploy PoolManager and setup initial state
fn setup(){
    // println!("Im here Pool Maager token");
    // let pool_manager_class = declare("PoolManager").unwrap().contract_class();
    // let admin: ContractAddress = contract_address_const::<1>();

    // println!("Im here Pool Maager token");

    // let token_address: ContractAddress = deploy_mock_token();

    // let mut calldata = ArrayTrait::new();
    // calldata.append(admin.into());

    // let (pool_manager_address, _) = pool_manager_class.deploy(@calldata).unwrap();

    let pDAI: felt252 = 'pDAI';

    println!("{:?}",pDAI)

    // println!("Im here Pool Maager token");

    // // Mint some tokens for testing
    // let amount: u256 = 1000;
    // IERC20Dispatcher { contract_address: token_address }.permissioned_mint(admin, amount);

    // (pool_manager_address, token_address)
}

#[test]
fn test_register_asset() {
    // println!("Starting test");
    // let (pool_manager_address, token_address) = setup();
    // let pool_manager = IPoolManagerDispatcher { contract_address: pool_manager_address };
    // let admin: ContractAddress = contract_address_const::<1>();

    // start_cheat_caller_address(pool_manager_address, admin);

    // // Using single-character strings to ensure they fit in felt252
    // let name: felt252 = 'mETH';
    // let symbol: felt252 = 'mETH';

    // let token_id = pool_manager.register_asset(token_address, name, symbol);

    // assert(token_id == 1, 'Invalid token ID');
    // assert(pool_manager.asset(token_id) == token_address, 'Invalid asset address');
    // assert(pool_manager.name(token_id) == name, 'Invalid name');
    // assert(pool_manager.symbol(token_id) == symbol, 'Invalid symbol');

    // stop_cheat_caller_address(pool_manager_address);
}

// #[test]
// fn test_deposit_and_withdraw() {
//     let (pool_manager_address, token_address) = setup();
//     let pool_manager = IPoolManagerDispatcher { contract_address: pool_manager_address };
//     let admin: ContractAddress = contract_address_const::<1>();
//     let user: ContractAddress = contract_address_const::<2>();

//     // Register asset
//     start_cheat_caller_address(pool_manager_address, admin);
//     let token_id = pool_manager.register_asset(token_address, 'Test Pool Token', 'TPT');
//     stop_cheat_caller_address(pool_manager_address);

//     // Setup token approvals and transfers
//     let deposit_amount: u256 = 100000000000000000000; // 100 tokens
//     let token = IERC20Dispatcher { contract_address: token_address };

//     // Transfer some tokens to user
//     start_cheat_caller_address(token_address, admin);
//     token.transfer(user, deposit_amount);
//     stop_cheat_caller_address(token_address);

//     // Approve pool manager to spend tokens
//     start_cheat_caller_address(token_address, user);
//     token.approve(pool_manager_address, deposit_amount);

//     // Test deposit
//     let shares = pool_manager.deposit(token_id, deposit_amount, user);
//     assert(shares == deposit_amount, 'Invalid shares received');
//     assert(pool_manager.balance_of(user, token_id) == shares, 'Invalid balance after deposit');

//     // Test withdraw
//     let withdraw_amount = deposit_amount / 2;
//     let shares_to_burn = pool_manager.withdraw(token_id, withdraw_amount, user, user);

//     assert(
//         pool_manager.balance_of(user, token_id) == deposit_amount - shares_to_burn,
//         'Invalid balance after withdraw'
//     );
//     assert(token.balance_of(user) == withdraw_amount, 'Invalid token balance after withdraw');

//     stop_cheat_caller_address(token_address);
// }

// #[test]
// fn test_preview_deposit_and_withdraw() {
//     let (pool_manager_address, token_address) = setup();
//     let pool_manager = IPoolManagerDispatcher { contract_address: pool_manager_address };
//     let admin: ContractAddress = contract_address_const::<1>();

//     // Register asset
//     start_cheat_caller_address(pool_manager_address, admin);
//     let token_id = pool_manager.register_asset(token_address, 'Test Pool Token', 'TPT');
//     stop_cheat_caller_address(pool_manager_address);

//     let deposit_amount: u256 = 100000000000000000000; // 100 tokens

//     // Test preview deposit
//     let expected_shares = pool_manager.preview_deposit(token_id, deposit_amount);
//     assert(expected_shares == deposit_amount, 'Invalid preview deposit amount');

//     // Test preview withdraw
//     let withdraw_amount = deposit_amount / 2;
//     let expected_shares_to_burn = pool_manager.preview_withdraw(token_id, withdraw_amount);
//     assert(expected_shares_to_burn == withdraw_amount, 'Invalid preview withdraw amount');
// }


