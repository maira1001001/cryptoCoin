const RDVCoin = artifacts.require('RDVCoin'); 

module.exports = function (deployer) {
    deployer.deploy(RDVCoin);
}