

module.exports = (contractList,web3)=>{
  let contracts = []
  for(let c in contractList){
    let abi = require("../contracts/"+contractList[c]+".abi.js")
    let address = require("../contracts/"+contractList[c]+".address.js")
    console.log(contractList[c],address)
    contracts[contractList[c]] = new web3.eth.Contract(abi,address)
    try{contracts[contractList[c]].blockNumber = require("../contracts/"+contractList[c]+".blockNumber.js")}catch(e){}
  }
  return contracts
}
