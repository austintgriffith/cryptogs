
/* Pull in Cryptogs Contract */
const Cryptogs = artifacts.require("./Cryptogs.sol");
const randomIntIn = require("../utils/randomIntIn.js");
const toBytes32 = require("../utils/toBytes32.js");

contract('Cryptogs', function(accounts){
  let contract; //Instance of contract deployed
  //Addresses to save
  let owner =  accounts[0]; //Owner of contracts
  let attacker = accounts[1]; //Malicious attacker
  let newowner = accounts[2]; //Checking ownership
  let tokenowner = accounts[3]; //Checking minting & token ownership
  let randomBytesForMinting = toBytes32(Math.floor(Math.random() * 1000000000) + 1); 
  let randomBytesForMinting2 = toBytes32(Math.floor(Math.random() * 1000000000) + 1); 
  let randomBytesForMinting3 = toBytes32(Math.floor(Math.random() * 1000000000) + 1); 
  let randomBytesForMinting4 = toBytes32(Math.floor(Math.random() * 1000000000) + 1); 
  let randomBytesForMinting5 = toBytes32(Math.floor(Math.random() * 1000000000) + 1); 
  

  /* Steps to take before each test run, deploy contract each time to start
  at same base case. */

  beforeEach(async function(){
    contract = await Cryptogs.new(); 
  });

//Contract should be owned by owner (coinbase account)
  describe("Ownership", async function() {
    it("Should be owned by Owner.", async function(){
      let cryptogsowner = await contract.owner({from:owner})
      assert.strictEqual(cryptogsowner, owner, "Contract not owned by Owner.")
    });

    it("Should be able to change owner", async function(){
        await contract.transferOwnership(newowner, {from:owner});
        let newcryptogsowner = await contract.owner({from:owner});
        assert.strictEqual(newcryptogsowner, newowner, "Contract transfer of ownership didn't occur.");
    })
  })

  describe("Minting", async function(){
      it("Should let owner mint and transfer token to new owner", async function(){
        let receipt = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
        let logCreated = receipt.logs[1];
        let newId = logCreated.args.newId; 
        let newtokenowner = await contract.ownerOf(newId, {from:owner});
        let tokens = await contract.tokensOfImage(randomBytesForMinting);
        //New token should be sent to tokenowner
        assert.strictEqual(newtokenowner, tokenowner, "Coin was not minted.");
        //First token should have id of 1
        assert.equal(newId.toNumber(), 1, "Coin does not have correct id.");
        assert.equal(tokens.toNumber(), 1, "Coin did not record correct amount.");
      })

      it("TokenIds should increment correctly", async function(){
        let receipt = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
        let receipt2 = await contract.mint(randomBytesForMinting2, tokenowner, {from:owner});
        let logCreated = receipt2.logs[1];
        let newId = logCreated.args.newId; 
        let newtokenowner = await contract.ownerOf(newId, {from:owner});
        //First token should have id of 1
        assert.equal(newId.toNumber(), 2, "TokenId did not increment correctly.")
      })

      it("Should keep track of multiple tokens of same image", async function() {
        let receipt = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
        let receipt2 = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
        let receipt3 = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
        let receipt4 = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
        let receipt5 = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
        let tokens = await contract.tokensOfImage(randomBytesForMinting);
        assert.equal(tokens.toNumber(), 5, "Coin did not record correct amount.");
      })
  })

  describe("Check getToken function", async function(){
    it("Should allow you to get the owner and image of a token", async function(){
      let receipt = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
      let results = await contract.getToken(1);
      let receipt2 = await contract.mint(randomBytesForMinting2, newowner, {from:owner});
      let results2 = await contract.getToken(2);
      assert.strictEqual(results[0], tokenowner, "Coin was not registered to the right owner.");
      assert.strictEqual(results[1], randomBytesForMinting, "Coin did not save correct metadata.");
      assert.strictEqual(results2[0], newowner, "Coin was not registered to the right owner.");
      assert.strictEqual(results2[1], randomBytesForMinting2, "Coin did not save correct metadata.");
    })  
  })

  describe("Testing the rarity function", async function(){
    it("Should allow you to check the rarity of a token", async function(){
      let raritymult = 1000000000000000; 
      let receipt1 = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
      let receipt2 = await contract.mint(randomBytesForMinting2, tokenowner, {from:owner});
      let receipt3 = await contract.mint(randomBytesForMinting3, tokenowner, {from:owner});
      let receipt4 = await contract.mint(randomBytesForMinting3, tokenowner, {from:owner});
      let receipt5 = await contract.mint(randomBytesForMinting4, tokenowner, {from:owner});
      let receipt6 = await contract.mint(randomBytesForMinting4, tokenowner, {from:owner});
      let receipt7 = await contract.mint(randomBytesForMinting4, tokenowner, {from:owner});
      let receipt8 = await contract.mint(randomBytesForMinting5, tokenowner, {from:owner});
      let receipt9 = await contract.mint(randomBytesForMinting5, tokenowner, {from:owner});
      let receipt10 = await contract.mint(randomBytesForMinting, tokenowner, {from:owner});
      let totalsupply = await contract.totalSupply();
      let tokens1 = await contract.tokensOfImage(randomBytesForMinting);
      let tokens2 = await contract.tokensOfImage(randomBytesForMinting2);
      let tokens3 = await contract.tokensOfImage(randomBytesForMinting3);
      let tokens4 = await contract.tokensOfImage(randomBytesForMinting4);
      let tokens5 = await contract.tokensOfImage(randomBytesForMinting5);
      let rarity1 = raritymult - ((raritymult * tokens1.toNumber())/(totalsupply.toNumber()));
      let rarity2 = raritymult - ((raritymult * tokens2.toNumber())/(totalsupply.toNumber()));
      let rarity3 = raritymult - ((raritymult * tokens3.toNumber())/(totalsupply.toNumber()));
      let rarity4 = raritymult - (raritymult * tokens4/totalsupply);
      let rarity5 = raritymult - ((raritymult * tokens5.toNumber())/(totalsupply.toNumber()));
      let contractrarity1 = await contract.rarity(1);
      let contractrarity2 = await contract.rarity(2);
      let contractrarity3 = await contract.rarity(3);
      let contractrarity4 = await contract.rarity(5); //Done by id 5th token, but 4th image 
      let contractrarity5 = await contract.rarity(8); //Done by id 8th token, but 5th image
      assert.strictEqual(rarity1, contractrarity1.toNumber(), "Contract rarity does not match calculated rarity 1.");
      assert.strictEqual(rarity2, contractrarity2.toNumber(), "Contract rarity does not match calculated rarity 2.");
      assert.strictEqual(rarity3, contractrarity3.toNumber(), "Contract rarity does not match calculated rarity 3.");
      assert.strictEqual(rarity4, contractrarity4.toNumber(), "Contract rarity does not match calculated rarity 4.");
      assert.strictEqual(rarity5, contractrarity5.toNumber(), "Contract rarity does not match calculated rarity 5.");
    })
  })

});