
module.exports = function(contractList,web3,network){
  let contracts = []
  console.log("Network:",network)
  for(let c in contractList){
    try{
      let abi = require("../contracts/"+contractList[c]+"."+network+".abi.js")
      let address = require("../contracts/"+contractList[c]+"."+network+".address.js")
      console.log(contractList[c],address)
      var TheContract = web3.eth.contract(abi);
      contracts[contractList[c]] = TheContract.at(address); // new web3.eth.Contract(abi,address)
      contracts[contractList[c]].blockNumber = require("../contracts/"+contractList[c]+"."+network+".blockNumber.js")
      console.log("@ Block",contracts[contractList[c]].blockNumber)
    }catch(e){
    //  console.log(e)
    }
  }
  return contracts
}
