import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('ClickRegenPortal', () => {
  it('submits intent under caps and finalizes receipt', async () => {
    const [deployer, user] = await ethers.getSigners();
    const Portal = await ethers.getContractFactory('ClickRegenPortal', deployer);
    const portal = await Portal.deploy(deployer.address, 2, 10);
    await portal.waitForDeployment();

    const action = 1;
    const payload = '0x';
    const expiry = 0;
    const nonce = 1n;

    const intentId = await portal.computeIntentId(user.address, nonce, action, payload, expiry);
    await expect(portal.connect(user).submitIntent(intentId, action, payload, expiry, nonce))
      .to.emit(portal, 'IntentSubmitted');

    const execRefHash = ethers.keccak256('0x01');
    await expect(portal.finalizeReceipt(intentId, true, 0, ethers.ZeroHash, execRefHash, '0x'))
      .to.emit(portal, 'ReceiptFinalized');
  });
});
