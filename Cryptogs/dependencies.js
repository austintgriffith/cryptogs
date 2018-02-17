const fs = require('fs');
module.exports = {
  'NFT.sol': fs.readFileSync('NFT/NFT.sol', 'utf8'),
  'zeppelin-solidity/contracts/ownership/Ownable.sol': fs.readFileSync('zeppelin-solidity/contracts/ownership/Ownable.sol', 'utf8')
};
