import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const Portal = await ethers.getContractFactory('ClickRegenPortal');
  const portal = await Portal.deploy(deployer.address, 100, 100000);
  await portal.waitForDeployment();
  console.log('portal:', await portal.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
