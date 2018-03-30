import cookie from 'react-cookies'
const sigUtil = require('eth-sig-util')

export default function(account,web3){
  return new Promise(function(resolve, reject) {
    try{
      let sigCookie = false//cookie.load('sig')
      if(sigCookie) resolve(sigCookie)
      else{
        const msgParams = [
          {
            type: 'string',      // Any valid solidity type
            name: 'Proof',     // Any string label you want
            value: 'I am '+account.substr(0,10)+" on Cryptogs.io"  // The value to sign
         }
        ]
        web3.currentProvider.sendAsync({
          method: 'eth_signTypedData',
          params: [msgParams, account],
          from: account,
        }, function (err, result) {

          if (err) return console.error(err)
          if (result.error) {
            return console.error(result.error.message)
          }

          const recovered = sigUtil.recoverTypedSignature({
            data: msgParams,
            sig: result.result
          })

          console.log(recovered,result)

          if (recovered.toLowerCase() === account.toLowerCase() ) {
            cookie.save('sig', result.result, { path: '/', maxAge:99999 })
            resolve(result.result)
          }else{
            reject(result)
          }
        })
      }

    }catch(e){console.log("ERROR",e);reject(e)}
  });


}
