import { Account, Contract, json, RpcProvider } from "starknet";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const envPath = path.join(currentDirPath, ".env.local");

dotenv.config({ path: envPath });

const sepoliaRpc = process.env.SEPOLIA_RPC;
const provider = new RpcProvider({ nodeUrl: sepoliaRpc });

const owner_private_key: any = process.env.PRIVATE_KEY as string;
const owner_account_address = process.env.ACCOUNT_ADDRESS as string;
const deployer = new Account(
  provider,
  owner_account_address,
  owner_private_key,
  "1"
);

const claims_contract_class = process.env.CLAIMS_CLASS_HASH as string;
const owner = process.env.ACCOUNT_ADDRESS as string;

async function deploy_claims_contract(): Promise<Contract> {
  // Read both contract files
  const sierraContract = json.parse(
    fs
      .readFileSync(
        path.join(currentDirPath, "./target/dev/cairo_PoolManager.contract_class.json")
      )
      .toString("ascii")
  );

  const compiledContract = json.parse(
    fs
      .readFileSync(
        path.join(currentDirPath, "./target/dev/cairo_PoolManager.compiled_contract_class.json")
      )
      .toString("ascii")
  );

  if (!sierraContract.abi) {
    throw new Error("ABI not found in contract file");
  }

  const { transaction_hash, contract_address } = await deployer.deploy({
    classHash: claims_contract_class,
    constructorCalldata: [owner],
    salt: "0x" + Math.floor(Math.random() * 1000000).toString(16),
  });

  const contractAddress = contract_address;
  await provider.waitForTransaction(transaction_hash);

  // Use the Sierra contract's ABI
  const vault_factory_contract = new Contract(
    sierraContract.abi,
    String(contractAddress),
    deployer
  );

  console.log(
    "✅ Claims contract deployed at =",
    vault_factory_contract.address
  );
  
  fs.appendFile(
    envPath,
    `\nCLAIMS_CONTRACT_ADDRESS="${contractAddress}"`,
    function (err) {
      if (err) throw err;
    }
  );
  return vault_factory_contract;
}

if (import.meta.url.endsWith(process.argv[1])) {
  console.log("Deploying MultiVault Contract...");
  deploy_claims_contract().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
}