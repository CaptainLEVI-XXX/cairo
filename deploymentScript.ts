import { Account, Contract, json, RpcProvider } from "starknet";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

// Setup
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const envPath = path.join(currentDirPath, ".env.local");

dotenv.config({ path: envPath });

// Provider and account setup
const provider = new RpcProvider({ nodeUrl: process.env.SEPOLIA_RPC });
const owner = new Account(
    provider,
    process.env.ACCOUNT_ADDRESS as string,
    process.env.PRIVATE_KEY as string,
    "1"
);

async function deployContract(contractName: string, constructorArgs: any[] = []) {
    console.log(`Processing ${contractName}...`);

    try {
        // Read contract files
        const sierraContract = json.parse(
            fs.readFileSync(
                path.join(currentDirPath, `./target/dev/cairo_${contractName}.contract_class.json`)
            ).toString("ascii")
        );

        const compiledContract = json.parse(
            fs.readFileSync(
                path.join(currentDirPath, `./target/dev/cairo_${contractName}.compiled_contract_class.json`)
            ).toString("ascii")
        );

        // Declare contract
        console.log("Declaring contract...");
        const declareResponse = await owner.declareIfNot({
            contract: sierraContract,
            casm: compiledContract,
        });

        console.log(`Contract declared with class hash: ${declareResponse.class_hash}`);
        
        // Save class hash to env
        fs.appendFileSync(
            envPath,
            `\n${contractName.toUpperCase()}_CLASS_HASH="${declareResponse.class_hash}"`
        );

        // Deploy contract
        console.log("Deploying contract...");
        const deployResponse = await owner.deploy({
            classHash: declareResponse.class_hash,
            constructorCalldata: constructorArgs,
            salt: "0x" + Math.floor(Math.random() * 1000000).toString(16),
        });

        const contractAddress = deployResponse.contract_address;
        
        // Wait for deployment
        console.log("Waiting for transaction...");
        await provider.waitForTransaction(deployResponse.transaction_hash);

        // Save address to env
        fs.appendFileSync(
            envPath,
            `\n${contractName.toUpperCase()}_ADDRESS="${contractAddress}"`
        );

        console.log(`✅ Contract deployed successfully`);
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Class Hash: ${declareResponse.class_hash}`);
        
        return {
            address: contractAddress,
            classHash: declareResponse.class_hash,
            abi: sierraContract.abi
        };
    } catch (error) {
        console.error(`Error deploying ${contractName}:`, error);
        throw error;
    }
}

async function main() {
    try {
        console.log("Deploying StrategyManager...");
        // const strategyManager = await deployContract("StrategyManager", [
        //     owner.address, // owner
        //     owner.address, // elizia
        //     owner.address  // router address
        // ]);
        // console.log("StrategyManager deployment complete.");


        console.log("Deploying PoolManager...");
        const poolManagerFactory = await deployContract("PoolManager", [
            owner.address, // owner
            owner.address // 
        ]);
        console.log("PoolManager deployment complete.");

        console.log("✅ All deployments completed successfully!");
        
        return {
            poolManagerFactory
        };
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

// Run deployment
if (import.meta.url.endsWith(process.argv[1])) {
    console.log("Starting deployment process...");
    main().catch(console.error);
}