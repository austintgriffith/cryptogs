/*

  run from parent directory:

  mocha tests/account.js

*/
const clevis = require("clevis")
const colors = require('colors')
const chai = require("chai")
const assert = chai.assert
const expect = chai.expect;
const should = chai.should();


//--------------------------------------------------------//

testVersion()


//--------------------------------------------------------//

function testVersion(){
  describe('#testVersion()', function() {
    it('should report version ', async function() {
      const version = await clevis("version")
      console.log("CURRENT VERSION",version)
    });
  });
}
