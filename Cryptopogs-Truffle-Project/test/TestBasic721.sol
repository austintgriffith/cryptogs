
/* Testing with solidity tests. */

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Cryptogs.sol";

contract TestBasic721 {

//account 1, needs to change with each run of testrpc
address public newowner = 0x461bf853a9d77aa6b4d6261d1d395d0990b1789a;

//Testing that only the owner can change the ownership of the contract
function testTheOwner() {

    Cryptogs cryptogs = new Cryptogs(); 
    ThrowProxy throwproxy = new ThrowProxy(address(cryptogs));
    //Change ownership to new owner
    cryptogs.transferOwnership(newowner);
    //Try to reset ownership again
    Cryptogs(address(throwproxy)).transferOwnership(this);
    bool r = throwproxy.execute.gas(200000)();
    Assert.isFalse(r, "Should be false because is should throw on not the owner!"); 
}

function testNoNonOwnerMinters() {

    Cryptogs cryptogs = new Cryptogs(); 
    ThrowProxy throwproxy = new ThrowProxy(address(cryptogs));
    //Change ownership to new owner
    cryptogs.transferOwnership(newowner);
    //Try to reset ownership again
    Cryptogs(address(throwproxy)).mint(0x0, this);
    bool r = throwproxy.execute.gas(200000)();
    Assert.isFalse(r, "Should be false because is should throw if non owner tries to mint!"); 
   
}

}



// Proxy contract for testing throws

contract ThrowProxy {
  address public target;
  bytes data;
  function ThrowProxy(address _target) {
    target = _target;
}
//prime the data using the fallback function.

  function() {
    data = msg.data;
  }

  function execute() returns (bool) {
    return target.call(data);
  }
}