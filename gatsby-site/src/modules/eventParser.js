const EVENTLOADCHUNK = 5120;
let LASTBLOCK;
let ENDBLOCK;
module.exports = (contract,eventName,endingBlock,startingBlock,updateFn)=>{
  LASTBLOCK=parseInt(startingBlock)
  ENDBLOCK=parseInt(endingBlock)
  loadDownTheChain(contract,eventName,updateFn)
}
let loadDownTheChain = async (contract,eventName,updateFn)=>{
  while(LASTBLOCK>=ENDBLOCK){
    let nextLast = LASTBLOCK-EVENTLOADCHUNK
    if(nextLast<ENDBLOCK) nextLast=ENDBLOCK
    await doSync(contract,eventName,updateFn,nextLast,LASTBLOCK);
    LASTBLOCK=nextLast-1
  }
}
let doSync = async (contract,eventName,updateFn,from,to)=>{
  console.log("EVENT:",eventName,"FROM",from,"to",to,contract)
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
