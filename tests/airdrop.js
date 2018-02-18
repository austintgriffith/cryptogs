const cryptogs = require("./cryptogs.js")

const testFolder = './app/public/cryptogs';
const fs = require('fs');

let possible = []

fs.readdirSync(testFolder).forEach(file => {
  if(file.indexOf(".")>0){
    possible.push(file)
  }

})

console.log(possible)

let randomImage = function(){
  return possible[Math.floor(Math.random()*possible.length)];
}

let accounts = [
  "0x2a906694d15df38f59e76ed3a5735f8aabcce9cb",
  "0x0FA23C532B040f8E93aF72D91fb03aD78Eb367eD",
  "0x31211e5B6Ed931c0e8e53734a8F53929F08a8f37",
  "0x0c96d995018253C6DDb384E5eEbc7DC4e405371f"

]

let randomAccount = function(){
  return accounts[Math.floor(Math.random()*accounts.length)];
}

console.log("randomAccount:",)

for(i=0;i<10;i++){
  let account = randomAccount()
  let image = randomImage()
  console.log("--------------------------------- dropping a "+image+" to "+account)
  cryptogs.airdrop(0,image,account)
}
