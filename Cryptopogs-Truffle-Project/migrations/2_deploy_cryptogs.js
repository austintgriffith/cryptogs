var Cryptogs = artifacts.require("./Cryptogs.sol");

//Deploy Cryptogs & use that to deploy Slammertime

module.exports = function(deployer) {
  deployer.deploy(Cryptogs);
};
