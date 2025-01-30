import { Account, json, RpcProvider } from "starknet";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

// Get current file URL and directory
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

// Use path.join for file paths
const envPath = path.join(currentDirPath, ".env.local");

dotenv.config({ path: envPath });

const sepoliaRpc = process.env.SEPOLIA_RPC as string;
const provider = new RpcProvider({ nodeUrl: sepoliaRpc });

const owner_private_key: any = process.env.PRIVATE_KEY as string;
const owner_account_address = process.env.ACCOUNT_ADDRESS as string;
const owner = new Account(
  provider,
  owner_account_address,
  owner_private_key,
  "1"
);

export async function get_claims_class() {
  const Sierra = json.parse(
    fs
      .readFileSync(
        path.join(currentDirPath, "./target/dev/cairo_PoolManager.contract_class.json")
      )
      .toString("ascii")
  );
  const Casm = json.parse(
    fs
      .readFileSync(
        path.join(currentDirPath, "./target/dev/cairo_PoolManager.compiled_contract_class.json")
      )
      .toString("ascii")
  );

  const declareResponse = await owner.declareIfNot({
    contract: Sierra,
    casm: Casm,
  });

  fs.appendFile(
    envPath,
    `\nCLAIMS_CLASS_HASH=${declareResponse.class_hash}`,
    function (err) {
      if (err) throw err;
    }
  );

  return declareResponse.class_hash;
}

// Update the entry point check for ES modules
if (import.meta.url.endsWith(process.argv[1])) {
  get_claims_class().catch(console.error);
}