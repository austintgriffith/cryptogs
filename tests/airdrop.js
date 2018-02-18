const cryptogs = require("./cryptogs.js")

const testFolder = './app/public/cryptogs';
const fs = require('fs');

let possible = []

fs.readdirSync(testFolder).forEach(file => {
  if(file.indexOf(".")>0){
    possible.push(file)
  }

})

let randomImage = function(){
  return possible[Math.floor(Math.random()*possible.length)];
}

let accounts = ["0x32ecfbac5aa0d28d57d2dc96e30cf3441701d281"]

let randomAccount = function(){
  return accounts[Math.floor(Math.random()*accounts.length)];
}

console.log("randomAccount:",)

for(i=0;i<10;i++){
  cryptogs.airdrop(0,randomImage(),randomAccount())
}
