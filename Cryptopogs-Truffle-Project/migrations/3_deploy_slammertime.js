var Cryptogs = artifacts.require("./Cryptogs.sol");
var SlammerTime = artifacts.require("./SlammerTime.sol");

//Get deployed Cryptogs address 
var cryptogs = Cryptogs.deployed().then(cryptogs => Cryptogs.address);

module.exports = function(deployer) {
  deployer.deploy(SlammerTime, cryptogs);
};