pub mod interfaces {
    pub mod IERC20;
    pub mod iTokenMetadata;
    pub mod iPoolManager;
    pub mod iPoolManagerFactory;
    pub mod iStrategyManager;
    pub mod iJediswapRouter;
    pub mod iZKLendIntegration;
    pub mod iZKLend;
}

pub mod integrations{
    pub mod ekubo;
    pub mod hashstack;
    pub mod jediswap;
    pub mod starkfarm;
    pub mod zkLend;
}

pub mod PoolManager;
pub mod PoolManagerFactory;
pub mod MockERC20;
pub mod StrategyManager;

