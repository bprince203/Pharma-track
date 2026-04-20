import { ethers } from "hardhat";
import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const PharmaTrack = await ethers.getContractFactory("PharmaTrack");
  const contract = await PharmaTrack.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n✅ PharmaTrack deployed at: ${address}`);

  // Get role hashes
  const MANUFACTURER_ROLE = await contract.MANUFACTURER_ROLE();
  const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
  const PHARMACY_ROLE = await contract.PHARMACY_ROLE();

  // Assign roles if env vars are present
  const mfg = process.env.MANUFACTURER_WALLET;
  const dist = process.env.DISTRIBUTOR_WALLET;
  const pharm = process.env.PHARMACY_WALLET;

  if (mfg && mfg !== "") {
    console.log(`Granting MANUFACTURER_ROLE to ${mfg}...`);
    const tx = await contract.grantRole(MANUFACTURER_ROLE, mfg);
    await tx.wait();
  }
  
  if (dist && dist !== "") {
    console.log(`Granting DISTRIBUTOR_ROLE to ${dist}...`);
    const tx = await contract.grantRole(DISTRIBUTOR_ROLE, dist);
    await tx.wait();
  }

  if (pharm && pharm !== "") {
    console.log(`Granting PHARMACY_ROLE to ${pharm}...`);
    const tx = await contract.grantRole(PHARMACY_ROLE, pharm);
    await tx.wait();
  }

  console.log("\nDeployment and role assignment complete!");

  // Copy ABI to frontend and backend public dirs
  try {
    const abiSource = join(__dirname, "../artifacts/contracts/PharmaTrack.sol/PharmaTrack.json");
    
    const backendDest = join(__dirname, "../../backend/public/abis/PharmaTrack.json");
    const frontendDest = join(__dirname, "../../frontend/public/abis/PharmaTrack.json");
    
    mkdirSync(join(__dirname, "../../backend/public/abis"), { recursive: true });
    mkdirSync(join(__dirname, "../../frontend/public/abis"), { recursive: true });
    
    copyFileSync(abiSource, backendDest);
    copyFileSync(abiSource, frontendDest);
    console.log("✅ Successfully copied ABI to frontend and backend folders");
  } catch (err) {
    console.warn("⚠️ Could not copy ABI files automatically:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
