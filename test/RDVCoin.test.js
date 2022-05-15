const RDVCoin = artifacts.require('RDVCoin');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("RDVCoin", (accounts)=>{
    before(async () => {
        RDVCoinInstance = await RDVCoin.deployed();
    });

    it('ensures that the starting balance of  RDVCoin is no coins', async() => {
        const balance = await RDVCoinInstance.getTotalBalance();
        // console.log(balance);
        expect(balance.words[0]).to.be.equal(0);
    });

    it('ensures the owner can mint coins to the onwer', async () => {
        const minterAccount = accounts[0];
        await RDVCoinInstance.mint(minterAccount, 300);
        const balance = await RDVCoinInstance.getTotalBalance();
        expect(balance.words[0]).to.be.equal(300);
    });

    it('ensures an account can send RDV coins to another account', async () => {
        await RDVCoinInstance.send(accounts[1], 100);
        const balance = await RDVCoinInstance.getBalanceFor(accounts[1]);
        expect(balance.words[0]).to.be.equal(100);
    });

    // TODO: It should revert the tx, with the idea of "You are not the minter, you can not create coins"
    it.skip('ensures that an account which is NOT the minter CAN NOT mint coins', async () => {
    });

    it('ensures an account can send RDV coins to another account', async () => {
        await RDVCoinInstance.send(accounts[2], 100);
        const balanceAccount2 = await RDVCoinInstance.getBalanceFor(accounts[2]);
        expect(balanceAccount2.words[0]).to.be.equal(100);
        const balanceMinter = await RDVCoinInstance.getBalanceFor(accounts[0]);
        expect(balanceAccount2.words[0]).to.be.equal(100);
    });

    it('should revert tx when insuficiente amount of coins', async () => {
        await expectRevert.unspecified(RDVCoinInstance.send(accounts[3], 500));
    });
    
});