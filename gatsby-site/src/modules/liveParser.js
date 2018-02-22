const LOOKBACK = 16;
module.exports = async(contract,eventName,currentBlock,updateFn)=>{
  let from = parseInt(currentBlock)-LOOKBACK
  let to = 'latest'
  //console.log("EVENT:",eventName,"FROM",from,"to",to,contract)
  let events = await contract.getPastEvents(eventName, {
      fromBlock: from,
      toBlock: to
  });
  for(let e in events){
    let thisEvent = events[e].returnValues;
    updateFn(thisEvent);
  }
  return true;
}
