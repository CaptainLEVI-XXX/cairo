use starknet::ContractAddress;

#[starknet::interface]
pub trait IMultiToken<TContractState> {
    /// @notice Owner balance of an id.
    /// @param owner The address of the owner.
    /// @param id The id of the token.
    /// @return amount The balance of the token.
    fn balanceOf(self: @TContractState, owner: ContractAddress, id: felt252) -> u256;
    /// @notice Spender allowance of an id.
    /// @param owner The address of the owner.
    /// @param spender The address of the spender.
    /// @param id The id of the token.
    /// @return amount The allowance of the token.
    fn allowance(self: @TContractState, spender: ContractAddress, id: u256) -> felt252;
    /// @notice Transfers an amount of an id from the caller to a receiver.
    /// @param receiver The address of the receiver.
    /// @param id The id of the token.
    /// @param amount The amount of the token.
    fn transfer(
        ref self: TContractState, receiver: ContractAddress, id: felt252, amount: u256,
    ) -> bool;
    /// @notice Transfers an amount of an id from a sender to a receiver.
    /// @param sender The address of the sender.
    /// @param receiver The address of the receiver.
    /// @param id The id of the token.
    /// @param amount The amount of the token.
    fn transferFrom(
        ref self: TContractState,
        sender: ContractAddress,
        receiver: ContractAddress,
        id: felt252,
        amount: u256,
    ) -> bool;
    /// @notice Approves an amount of an id to a spender.
    /// @param spender The address of the spender.
    /// @param id The id of the token.
    /// @param amount The amount of the token.
    fn approve(
        ref self: TContractState, sender: ContractAddress, is: felt252, amount: u256,
    ) -> bool;
}

