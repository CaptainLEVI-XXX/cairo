// use starknet::ContractAddress;


// #[starknet::contract]
// mod Jediswap {
//     // Starknet imports
//     use starknet::contract_address::contract_address_const;
//     use core::integer::u256_sqrt;
//     use core::num::traits::Zero;
//     use core::panic_with_felt252;
//     use starknet::{get_contract_address, get_block_timestamp, ContractAddress};

//     // // External imports

//     #[storage]
//     struct Storage {}

//     #[event]
//     #[derive(Drop, starknet::Event)]
//     enum Event {}

//     #[abi(embed_v0)]
//     impl JediswapImpl of IJediswapIntegration<ContractState> {
//         /// @notice Function to utilise open loans through jediswap
//         /// @param loan_id Id of the existing loan
//         /// @param dest_address Secondary market address to swap to
//         /// @return spend_loan_result Returns the struct of type SpendLoanResult, containing
//         /// loan_id, dest_address, and returned_amount
//         fn swap_jedi_swap(
//             ref self: ContractState,
//             from_token: ContractAddress,
//             to_token: ContractAddress,
//             amount: u256
//         ) -> SpendLoanResult {
//             //// println!("swap_jedi_swap 1");
//             swaps.assert_no_swaps();
//             let dest_address = to_token; // 
//             let router = self._get_jedi_router();

//             let current_amount: felt252 = amount.try_into().unwrap();
//             let current_market: felt252 = from_token.try_into().unwrap();
//             //// println!("swap_jedi_swap 3: {}", current_amount);
//             //// println!("swap_jedi_swap 3 addr: {}", current_market);

//             let amount_out: u256 = self
//                 ._jedi_swap(from_token, to_token, amount, router.contract_address);
//             //// println!("swap_jedi_swap 4");

//             // settle and transfer funds back to dToken
//             let contract_address = get_contract_address();
//             // self.spend._post_spend(contract_address, amount_out, dest_address);
//             //// println!("swap_jedi_swap 5");

//             // let spend_loan_result: SpendLoanResult = SpendLoanResult {
//             //     loan_id: loan_id,
//             //     return_market: dest_address,
//             //     return_amount: amount_out,
//             //     additional_params: array![]
//             // };
//             //// println!("swap_jedi_swap 6");

//             return (spend_loan_result);
//         }


//         fn add_liquidity_jediswap(
//             ref self: ContractState, spend_params: SpendParams, swaps: Array<SwapInfo>
//         ) -> SpendLoanResult {
//             let id = spend_params.loan_id;

//             // parse swap info
//             let (tokenA, tokenB) = swaps
//                 .assert_exactly_two_swaps(spend_params.swap_info_sizes.span());

//             let this = get_contract_address();
//             let router = self._get_jedi_router();
//             let block_timestamp = get_block_timestamp();
//             //// println!("add_liquidity_jediswap 1");
//             let loan = self.spend._pre_spend(id);
//             //// println!("add_liquidity_jediswap 2");
//             let (_, tokenAAddr, amountA, tokenBAddr, amountB) = self
//                 .v2dexliquidity
//                 ._pre_add_liquidity(loan, tokenA, tokenB);
//             //// println!("add_liquidity_jediswap 3");
//             ERC20HelperLib::approve(tokenAAddr, router.contract_address, amountA);
//             ERC20HelperLib::approve(tokenBAddr, router.contract_address, amountB);
//             //// println!("add_liquidity_jediswap 4");
//             // add liquidity
//             let deadline: u64 = block_timestamp + 100;
//             let (_amountA, _amountB, liquidity) = router
//                 .add_liquidity(tokenAAddr, tokenBAddr, amountA, amountB, 1, 1, this, deadline,);

//             //// println!("add_liquidity_jediswap 5");
//             // TODO Assert residual tokens < 0.1%

//             // get LP token address
//             let factory = router.factory();
//             let jediswapFactory_dispatcher = IJediSwapFactoryDispatcher {
//                 contract_address: factory
//             };
//             let pair_address = jediswapFactory_dispatcher.get_pair(tokenAAddr, tokenBAddr);
//             assert(pair_address.is_non_zero(), 'L3::Jedi::Invalid Pair addr');

//             let additional_params = array![]; // no additional params
//             let spend_loan_result: SpendLoanResult = SpendLoanResult {
//                 loan_id: id,
//                 return_market: pair_address,
//                 return_amount: liquidity,
//                 additional_params: additional_params
//             };
//             return (spend_loan_result);
//         }

//         /// @notice Reverts the utilised loan, from secondary market to original loan market
//         /// @param loan_id The id of the utilised loan
//         /// @return revert_loan_result Returns the struct type RevertLoanResult, containing loan_id,
//         /// returned_market and returned amount
//         fn revert_swap_jedi_swap(
//             ref self: ContractState, revert_params: RevertSpendParams, swaps: Array<SwapInfo>
//         ) -> RevertLoanResult {
//             //// println!("revert_swap_jedi_swap 1");

//             // parse swap info
//             let swapInfo = swaps.assert_exactly_one_swap(revert_params.swap_info_sizes.span());

//             let loan_id = revert_params.loan_id;

//             let loan_record = self.spend._pre_spend(loan_id);

//             let asset_to = Dispatchers::dToken_dispatcher(loan_record.market)
//                 .get_underlying_asset();
//             assert(swapInfo.toToken == asset_to, 'L3::Revert::Invalid toToken');
//             assert(swapInfo.amount == loan_record.current_amount, 'L3::Revert::Invalid amount');

//             let amount_out = SwapRouterLib::swap(
//                 self.v2dexliquidity._get_avnu_dispatcher(),
//                 loan_record.current_market,
//                 swapInfo.toToken,
//                 swapInfo.amount,
//                 1_u256, // ignoring min amount out as dToken anyways check for slippage
//                 loan_record.market,
//                 swapInfo.routes
//             );

//             //// println!("revert_swap_jedi_swap 3");

//             assert(amount_out > 0, 'token bought < 0');
//             let revert_loan_result: RevertLoanResult = RevertLoanResult {
//                 loan_id: loan_id, return_market: asset_to, return_amount: amount_out
//             };
//             return (revert_loan_result);
//         }

//         fn remove_liquidity_jediswap(
//             ref self: ContractState, revert_params: RevertSpendParams, swaps: Array<SwapInfo>
//         ) -> RevertLoanResult {
//             let loan_id = revert_params.loan_id;

//             // parse swap info
//             let (tokenA, tokenB) = swaps
//                 .assert_exactly_two_swaps(revert_params.swap_info_sizes.span());

//             let loan_record = self.spend._pre_spend(loan_id);
//             let router = self._get_jedi_router();
//             let this = get_contract_address();
//             let (token0, token1) = self._get_pair_tokens(loan_record.current_market);

//             let block_timestamp = get_block_timestamp();
//             let deadline = block_timestamp + 100;

//             //// println!("remove_liquidity_jediswap 1");

//             ERC20HelperLib::approve(
//                 loan_record.current_market, router.contract_address, loan_record.current_amount
//             );
//             let (amount0, amount1) = router
//                 .remove_liquidity(
//                     token0, token1, loan_record.current_amount, 1, 1, this, deadline,
//                 );

//             //// println!("Jedi amount0 {:?}", amount0);
//             //// println!("Jedi amount1 {:?}", amount1);

//             //// println!("remove_liquidity_jediswap 2");

//             //// println!("******************* {:?}", tokenA.toToken);

//             let (asset_to, amountOut) = self
//                 .v2dexliquidity
//                 ._post_remove_liquidity(
//                     loan_record, token0, amount0, token1, amount1, tokenA, tokenB
//                 );

//             // note @dev, transfering manully to handle unswaped tokens
//             self.spend._post_spend(get_contract_address(), amountOut, asset_to);

//             let revert_loan_result: RevertLoanResult = RevertLoanResult {
//                 loan_id: loan_id, return_market: asset_to, return_amount: amountOut
//             };
//             return (revert_loan_result);
//         }

//         fn get_usd_value_jedi_swap(
//             ref self: ContractState, loan_id: felt252, additional_params: Array<felt252>
//         ) -> USDValue {
//             //// println!("get_usd_value_jedi_swap 1[]");
//             let loan_record = self.open._get_open_loan(loan_id);
//             let mut totalSupply: u256 = 0;
//             let mut tokenA = contract_address_const::<0>();
//             let mut tokenB = contract_address_const::<0>();
//             let mut reserveA: u256 = 0;
//             let mut reserveB: u256 = 0;
//             //// println!("get_usd_value_jedi_swap 2");
//             if (loan_record.l3_category == Constants::CATEGORY_LIQUIDITY) {
//                 //// println!("get_usd_value_jedi_swap 3");
//                 let jediswap_pair_dispatcher = IJediSwapPairDispatcher {
//                     contract_address: loan_record.current_market
//                 };

//                 totalSupply = jediswap_pair_dispatcher.totalSupply();
//                 tokenA = jediswap_pair_dispatcher.token0();
//                 tokenB = jediswap_pair_dispatcher.token1();
//                 let (_reserveA, _reserveB, _) = jediswap_pair_dispatcher.get_reserves();
//                 reserveA = _reserveA;
//                 reserveB = _reserveB;
//             }

//             //// println!("get_usd_value_jedi_swap 4");
//             self
//                 .spend
//                 ._get_usd_value_jedi_swap(
//                     loan_record, totalSupply, tokenA, reserveA, tokenB, reserveB
//                 )
//         }
//     }


//     #[generate_trait]
//     impl InternalImpl of InternalTrait {
//         /// @notice function that calls the jediswap router to swap two tokens
//         /// @param asset_from, token address to swap from
//         /// @param asset_to, token address to swap to
//         /// @param amount_in, amount of token to swap
//         /// @return amount_out, the amount that is returned in asset_to market after the swap
//         fn _jedi_swap(
//             ref self: ContractState,
//             asset_from: ContractAddress,
//             asset_to: ContractAddress,
//             amount_in: u256,
//             routerAddr: ContractAddress
//         ) -> u256 {
//             if (asset_from == asset_to) {
//                 return (amount_in);
//             }

//             let contract_address = get_contract_address();
//             let block_timestamp = get_block_timestamp();
//             let deadline = block_timestamp + 100;
//             assert(!routerAddr.is_zero(), 'jedi router 0');

//             let mut path: Array<ContractAddress> = array![];
//             path.append(asset_from);
//             path.append(asset_to);

//             let erc20_dispatcher: IERC20Dispatcher = IERC20Dispatcher {
//                 contract_address: asset_from
//             };

//             erc20_dispatcher.approve(routerAddr, amount_in);

//             // change this to use the above.
//             let router = self._get_jedi_router();
//             let amounts = router
//                 .swap_exact_tokens_for_tokens(amount_in, 0, path, contract_address, deadline);
//             return (*amounts.at(amounts.len() - 1));
//         }

//         fn _get_pair_tokens(
//             self: @ContractState, pair_address: ContractAddress
//         ) -> (ContractAddress, ContractAddress) {
//             let jediswap_pair_dispatcher = IJediSwapPairDispatcher {
//                 contract_address: pair_address
//             };
//             let token0 = jediswap_pair_dispatcher.token0();
//             let token1 = jediswap_pair_dispatcher.token1();
//             return (token0, token1);
//         }

//         fn _get_jedi_router(self: @ContractState) -> IJediswapRouterDispatcher {
//             let router = self.borrow_common.l3Comptroller.read().get_jedi_router();
//             return IJediswapRouterDispatcher { contract_address: router };
//         }
//     }
// }
