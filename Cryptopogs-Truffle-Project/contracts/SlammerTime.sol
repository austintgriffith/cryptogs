pragma solidity ^0.4.15;

contract SlammerTime {

  address public cryptogs;

  function SlammerTime(address _cryptogs) public {
    //deploy slammertime with cryptogs address coded in so
    // only the cryptogs address can mess with it
    cryptogs=_cryptogs;
  }

  function startSlammerTime(address _player1,uint256[5] _id1,address _player2,uint256[5] _id2) public returns (bool) {
    //only the cryptogs contract should be able to hit it
    require(msg.sender==cryptogs);

    Cryptogs cryptogsContract = Cryptogs(cryptogs);

    for(uint8 i=0;i<5;i++){
      //make sure player1 owns _id1
      require(cryptogsContract.tokenIndexToOwner(_id1[i])==_player1);
      //transfer id1 in
      cryptogsContract.transferFrom(_player1,address(this),_id1[i]);
      //make this contract is the owner
      require(cryptogsContract.tokenIndexToOwner(_id1[i])==address(this));
    }


    for(uint8 j=0;j<5;j++){
      //make sure player1 owns _id1
      require(cryptogsContract.tokenIndexToOwner(_id2[j])==_player2);
      //transfer id1 in
      cryptogsContract.transferFrom(_player2,address(this),_id2[j]);
      //make this contract is the owner
      require(cryptogsContract.tokenIndexToOwner(_id2[j])==address(this));
    }


    return true;
  }

  function transferBack(address _toWhom, uint256 _id) public returns (bool) {
    //only the cryptogs contract should be able to hit it
    require(msg.sender==cryptogs);

    Cryptogs cryptogsContract = Cryptogs(cryptogs);

    require(cryptogsContract.tokenIndexToOwner(_id)==address(this));
    cryptogsContract.transfer(_toWhom,_id);
    require(cryptogsContract.tokenIndexToOwner(_id)==_toWhom);
    return true;
  }

}



contract Cryptogs {
  mapping (uint256 => address) public tokenIndexToOwner;
  function transfer(address _to,uint256 _tokenId) external { }
  function transferFrom(address _from,address _to,uint256 _tokenId) external { }
}
