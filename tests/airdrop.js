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
  "0x5f19cefc9c9d1bc63f9e4d4780493ff5577d238b",
  "0x31211e5B6Ed931c0e8e53734a8F53929F08a8f37",
  "0x0FA23C532B040f8E93aF72D91fb03aD78Eb367eD",
  "0x20fE9E160B68C468Ab9da181b628fd00B6a5AF35"

]

let randomAccount = function(){
  return accounts[Math.floor(Math.random()*accounts.length)];
}

console.log("randomAccount:",)

for(i=0;i<100;i++){
  let account = randomAccount()
  let image = randomImage()
  console.log("--------------------------------- dropping a "+image+" to "+account)
  cryptogs.airdrop(0,image,account)
}
