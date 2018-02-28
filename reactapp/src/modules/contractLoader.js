

export default function(contractList,web3,network){
  let contracts = []
  console.log("Network:",network)
  for(let c in contractList){
    let abi = require("../contracts/"+contractList[c]+"."+network+".abi.js")
    let address = require("../contracts/"+contractList[c]+"."+network+".address.js")
    console.log(contractList[c],address)
    //console.log(contractList[c],abi)
    contracts[contractList[c]] = new web3.eth.Contract(abi,address)
    try{
      contracts[contractList[c]].blockNumber = require("../contracts/"+contractList[c]+"."+network+".blockNumber.js")
      console.log("@ Block",contracts[contractList[c]].blockNumber)
    }catch(e){}
  }
  return contracts
}
