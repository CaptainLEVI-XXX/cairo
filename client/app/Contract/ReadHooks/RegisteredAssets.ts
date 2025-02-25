type Asset = {
  address: string;
  tokenId: bigint | null;
  isLoading: boolean;
  error: Error | null;
};

const RegisteredAssets = async (contract) => {
  try {
    // Get all registered assets
    const registeredAssets = await contract.get_registered_assets();
    console.log("registeredAssets", registeredAssets);

    if (!registeredAssets) {
      return [];
    }

    const assets: Asset[] = [];

    // Loop through each asset and fetch its token ID
    for (const address of registeredAssets) {
      try {
        const tokenId = await contract.asset_to_tokenId(address);
        console.log(`Token ID for address ${address}:`, tokenId);

        assets.push({
          address,
          tokenId: BigInt(tokenId.toString()),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error(`Error fetching token ID for address ${address}:`, error);
        assets.push({
          address,
          tokenId: null,
          isLoading: false,
          error: error as Error,
        });
      }
    }

    console.log("Final assets array:", assets);
    return assets;
  } catch (error) {
    console.error("Error fetching registered assets:", error);
    return [];
  }
};

export default RegisteredAssets;
