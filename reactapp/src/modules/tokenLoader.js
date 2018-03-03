export default async function(account,cryptogsContract,web3,updateFn){
  try{
    let myTokens = []
    if(account&&cryptogsContract){
      let mine = await cryptogsContract.methods.tokensOfOwner(account).call()
      for(let m in mine){
        let token = await cryptogsContract.methods.getToken(mine[m]).call()
        myTokens.push({id:mine[m],image:web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")})
      }
      updateFn(myTokens)
    }
  }catch(e){console.log("ERROR",e)}
}
