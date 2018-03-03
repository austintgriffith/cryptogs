pragma solidity ^0.4.15;

/*
  https://cryptogs.io
  --Austin Thomas Griffith for ETHDenver
  ( PS this gas guzzling beast is still unaudited )
*/

import 'NFT.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Cryptogs is NFT, Ownable {

    string public constant name = "Cryptogs";
    string public constant symbol = "POGS";

    string public constant purpose = "ETHDenver";
    string public constant contact = "https://cryptogs.io";
    string public constant author = "Austin Thomas Griffith";

    uint256 public constant RARITYMULTIPLIER = 1000000000000000;

    uint8 public constant FLIPPINESS = 64;
    uint8 public constant FLIPPINESSROUNDBONUS = 16;
    uint8 public constant TIMEOUTBLOCKS = 60;

    string public ipfs;
    function setIpfs(string _ipfs) public onlyOwner returns (bool){
      ipfs=_ipfs;
      IPFS(ipfs);
      return true;
    }
    event IPFS(string ipfs);

    function Cryptogs() public {
      //0 index should be a blank item owned by no one
      Item memory _item = Item({
        image: ""
      });
      items.push(_item);
    }

    /*
    as an afterthought I'm going to hardcode this address into the contract...
    it was prevsiouly built so two stacks could agree on their slammertime contract
    I think we want to be more rigid and define the exact slammertime and check
    that everyone agrees on it
     */
    address public slammerTime;
    function setSlammerTime(address _slammerTime) public onlyOwner returns (bool){
      slammerTime=_slammerTime;
      return true;
    }

    struct Item{
      bytes32 image;
      //perhaps some are harder to flip over?
      //perhaps some have magical metadata?
      //I don't know, it's late and I'm weird
    }

    Item[] private items;

    function mint(bytes32 _image,address _owner) public onlyOwner returns (uint){
      uint256 newId = _mint(_image);
      _transfer(0, _owner, newId);
      Mint(items[newId].image,tokenIndexToOwner[newId]);
      return newId;
    }
    event Mint(bytes32 _image,address _owner);

    function _mint(bytes32 _image) internal returns (uint){
      Item memory _item = Item({
        image: _image
      });
      uint256 newId = items.push(_item) - 1;
      tokensOfImage[items[newId].image]++;
      return newId;
    }

    Pack[] private packs;
    struct Pack{
      uint256[10] tokens;
      uint256 price;
    }
    function mintPack(uint256 _price,bytes32 _image1,bytes32 _image2,bytes32 _image3,bytes32 _image4,bytes32 _image5,bytes32 _image6,bytes32 _image7,bytes32 _image8,bytes32 _image9,bytes32 _image10) public onlyOwner returns (bool){
      uint256[10] memory tokens;
      tokens[0] = _mint(_image1);
      tokens[1] = _mint(_image2);
      tokens[2] = _mint(_image3);
      tokens[3] = _mint(_image4);
      tokens[4] = _mint(_image5);
      tokens[5] = _mint(_image6);
      tokens[6] = _mint(_image7);
      tokens[7] = _mint(_image8);
      tokens[8] = _mint(_image9);
      tokens[9] = _mint(_image10);
      Pack memory _pack = Pack({
        tokens: tokens,
        price: _price
      });
      MintPack(packs.push(_pack) - 1, _price,tokens[0],tokens[1],tokens[2],tokens[3],tokens[4],tokens[5],tokens[6],tokens[7],tokens[8],tokens[9]);
      return true;
    }
    event MintPack(uint256 packId,uint256 price,uint256 token1,uint256 token2,uint256 token3,uint256 token4,uint256 token5,uint256 token6,uint256 token7,uint256 token8,uint256 token9,uint256 token10);

    function buyPack(uint256 packId) public payable returns (bool) {
      //make sure pack is for sale
      require( packs[packId].price > 0 );
      //make sure they sent in enough value
      require( msg.value >= packs[packId].price );
      //right away set price to 0 to avoid some sort of reentrance
      packs[packId].price=0;
      //give tokens to owner
      for(uint8 i=0;i<10;i++){
        tokenIndexToOwner[packs[packId].tokens[i]]=msg.sender;
        _transfer(0, msg.sender, packs[packId].tokens[i]);
      }
      //clear the price so it is no longer for sale
      delete packs[packId];
      BuyPack(msg.sender,packId,msg.value);
    }
    event BuyPack(address sender, uint256 packId, uint256 price);

    //lets keep a count of how many of a specific image is created too
    //that will allow us to calculate rarity on-chain if we want
    mapping (bytes32 => uint256) public tokensOfImage;

    function getToken(uint256 _id) public view returns (address owner,bytes32 image,uint256 rarity) {
      return (
        tokenIndexToOwner[_id],
        items[_id].image,
        getRarity(_id)
      );
    }

    //we can get the rarity percentage bar off chain by multiplying the div width by
    // rarity(<tokenid>) / RARITYMULTIPLIER
    function getRarity(uint256 _id) public constant returns (uint256) {
      return uint256(RARITYMULTIPLIER-(RARITYMULTIPLIER * tokensOfImage[items[_id].image])/(items.length - 1));
    }

    uint256 nonce = 0;

    struct Stack{
      address slammerTime;
      //this will be an array of ids but for now just doing one for simplicity
      uint256[5] ids;
      address owner;
      uint32 block;

    }

    mapping (bytes32 => Stack) public stacks;
    mapping (bytes32 => bytes32) public stackCounter;

    function stackOwner(bytes32 _stack) public constant returns (address owner) {
      return stacks[_stack].owner;
    }

    function getStack(bytes32 _stack) public constant returns (address owner,uint32 block,uint256 token1,uint256 token2,uint256 token3,uint256 token4,uint256 token5) {
      return (stacks[_stack].owner,stacks[_stack].block,stacks[_stack].ids[0],stacks[_stack].ids[1],stacks[_stack].ids[2],stacks[_stack].ids[3],stacks[_stack].ids[4]);
    }

    //tx 1: of a game, player one approves the SlammerTime contract to take their tokens
    //this triggers an event to broadcast to other players that there is an open challenge
    function submitStack(address _slammerTime, uint256 _id,uint256 _id2,uint256 _id3,uint256 _id4,uint256 _id5, bool _public) public returns (bool) {
      //make sure they have the right slammertime address
      //(this is an afterthought, originally this could be dynamic)
      require( _slammerTime == slammerTime);
      //the sender must own the token
      require(tokenIndexToOwner[_id]==msg.sender);
      require(tokenIndexToOwner[_id2]==msg.sender);
      require(tokenIndexToOwner[_id3]==msg.sender);
      require(tokenIndexToOwner[_id4]==msg.sender);
      require(tokenIndexToOwner[_id5]==msg.sender);
      //they approve the slammertime contract to take the token away from them
      require(approve(_slammerTime,_id));
      require(approve(_slammerTime,_id2));
      require(approve(_slammerTime,_id3));
      require(approve(_slammerTime,_id4));
      require(approve(_slammerTime,_id5));

      bytes32 stack = keccak256(nonce++,msg.sender);
      uint256[5] memory ids = [_id,_id2,_id3,_id4,_id5];
      stacks[stack] = Stack(_slammerTime,ids,msg.sender,uint32(block.number));

      //the event is triggered to the frontend to display the stack
      //the frontend will check if they want it public or not
      SubmitStack(msg.sender,now,stack,_id,_id2,_id3,_id4,_id5,_public);
    }
    event SubmitStack(address indexed _sender,uint256 indexed timestamp,bytes32 indexed _stack,uint256 _token1,uint256 _token2,uint256 _token3,uint256 _token4,uint256 _token5,bool _public);

    //tx 2: of a game, player two approves the SlammerTime contract to take their tokens
    //this triggers an event to broadcast to player one that this player wants to rumble
    function submitCounterStack(address _slammerTime, bytes32 _stack, uint256 _id, uint256 _id2, uint256 _id3, uint256 _id4, uint256 _id5) public returns (bool) {
      //make sure they have the right slammertime address
      //(this is an afterthought, originally this could be dynamic)
      require( _slammerTime == slammerTime);
      //the sender must own the token
      require(tokenIndexToOwner[_id]==msg.sender);
      require(tokenIndexToOwner[_id2]==msg.sender);
      require(tokenIndexToOwner[_id3]==msg.sender);
      require(tokenIndexToOwner[_id4]==msg.sender);
      require(tokenIndexToOwner[_id5]==msg.sender);
      //they approve the slammertime contract to take the token away from them
      require(approve(_slammerTime,_id));
      require(approve(_slammerTime,_id2));
      require(approve(_slammerTime,_id3));
      require(approve(_slammerTime,_id4));
      require(approve(_slammerTime,_id5));
      //the SlammerTimeAddresses need to line up
      require(_slammerTime==stacks[_stack].slammerTime);
      //stop playing with yourself
      require(msg.sender!=stacks[_stack].owner);

      bytes32 counterstack = keccak256(nonce++,msg.sender,_id);
      uint256[5] memory ids = [_id,_id2,_id3,_id4,_id5];
      stacks[counterstack] = Stack(_slammerTime,ids,msg.sender,uint32(block.number));
      stackCounter[counterstack] = _stack;

      //the event is triggered to the frontend to display the stack
      //the frontend will check if they want it public or not
      CounterStack(msg.sender,now,_stack,counterstack,_id,_id2,_id3,_id4,_id5);
    }
    event CounterStack(address indexed _sender,uint256 indexed timestamp,bytes32 indexed _stack, bytes32 _counterStack, uint256 _token1, uint256 _token2, uint256 _token3, uint256 _token4, uint256 _token5);

    // if someone creates a stack they should be able to clean it up
    // it's not really that big of a deal because we will have a timeout
    // in the frontent, but still...
    function cancelStack(bytes32 _stack) public returns (bool) {
      //it must be your stack
      require(msg.sender==stacks[_stack].owner);
      //make sure there is no mode set yet
      require(mode[_stack]==0);
      //make sure they aren't trying to cancel a counterstack using this function
      require(stackCounter[_stack]==0x00000000000000000000000000000000);

      delete stacks[_stack];

      CancelStack(msg.sender,now,_stack);
    }
    event CancelStack(address indexed _sender,uint256 indexed timestamp,bytes32 indexed _stack);


    //this cancel is more important. if a counter stack is submitted but not accepted until
    //after the counterstack owner leaves, the original stack own will have an easy window
    // to drain the stack because he can catch the counterstack owner afk
    function cancelCounterStack(bytes32 _stack,bytes32 _counterstack) public returns (bool) {
      //it must be your stack
      require(msg.sender==stacks[_counterstack].owner);
      //the counter must be a counter of stack 1
      require(stackCounter[_counterstack]==_stack);
      //make sure there is no mode set yet
      require(mode[_stack]==0);

      delete stacks[_counterstack];
      delete stackCounter[_counterstack];

      CancelCounterStack(msg.sender,now,_stack,_counterstack);
    }
    event CancelCounterStack(address indexed _sender,uint256 indexed timestamp,bytes32 indexed _stack,bytes32 _counterstack);

    mapping (bytes32 => bytes32) public counterOfStack;
    mapping (bytes32 => uint8) public mode;
    mapping (bytes32 => uint8) public round;
    mapping (bytes32 => uint32) public lastBlock;
    mapping (bytes32 => uint32) public commitBlock;
    mapping (bytes32 => address) public lastActor;
    mapping (bytes32 => uint256[10]) public mixedStack;

    //tx 3: of a game, player one approves counter stack and transfers everything in
    function acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack) public returns (bool) {
      //make sure they have the right slammertime address
      //(this is an afterthought, originally this could be dynamic)
      require( _slammerTime == slammerTime);
      //sender must be owner of stack 1
      require(msg.sender==stacks[_stack].owner);
      //the counter must be a counter of stack 1
      require(stackCounter[_counterStack]==_stack);
      //the SlammerTimeAddresses need to line up
      require(_slammerTime==stacks[_stack].slammerTime);
      //make sure there is no mode set yet
      require(mode[_stack]==0);

      //do the transfer
      SlammerTime slammerTimeContract = SlammerTime(_slammerTime);
      require( slammerTimeContract.startSlammerTime(msg.sender,stacks[_stack].ids,stacks[_counterStack].owner,stacks[_counterStack].ids) );

      //add in a little extra safe stuff just because it's late and my head is fuzzy
      //require(tokenIndexToOwner[stacks[_stack].id]==_slammerTime);
      //require(tokenIndexToOwner[stacks[_counterStack].id]==_slammerTime);

      //save the block for a timeout
      lastBlock[_stack]=uint32(block.number);
      lastActor[_stack]=stacks[_counterStack].owner;
      mode[_stack]=1;
      counterOfStack[_stack]=_counterStack;

      //// LOL @
      mixedStack[_stack][0] = stacks[_stack].ids[0];
      mixedStack[_stack][1] = stacks[_counterStack].ids[0];
      mixedStack[_stack][2] = stacks[_stack].ids[1];
      mixedStack[_stack][3] = stacks[_counterStack].ids[1];
      mixedStack[_stack][4] = stacks[_stack].ids[2];
      mixedStack[_stack][5] = stacks[_counterStack].ids[2];
      mixedStack[_stack][6] = stacks[_stack].ids[3];
      mixedStack[_stack][7] = stacks[_counterStack].ids[3];
      mixedStack[_stack][8] = stacks[_stack].ids[4];
      mixedStack[_stack][9] = stacks[_counterStack].ids[4];

      //let the front end know that the transfer is good and we are ready for the coin flip
      AcceptCounterStack(msg.sender,_stack,_counterStack);
    }
    event AcceptCounterStack(address indexed _sender,bytes32 indexed _stack, bytes32 indexed _counterStack);

    mapping (bytes32 => bytes32) public commit;

    function getMixedStack(bytes32 _stack) external view returns(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256){
      uint256[10] thisStack = mixedStack[_stack];
      return (thisStack[0],thisStack[1],thisStack[2],thisStack[3],thisStack[4],thisStack[5],thisStack[6],thisStack[7],thisStack[8],thisStack[9]);
    }

    //tx 4: player one commits and flips coin up
    //at this point, the timeout goes into effect and if any transaction including
    //the coin flip don't come back in time, we need to allow the other party
    //to withdraw all tokens... this keeps either player from refusing to
    //reveal their commit. (every tx from here on out needs to update the lastBlock and lastActor)
    //and in the withdraw function you check currentblock-lastBlock > timeout = refund to lastActor
    //and by refund I mean let them withdraw if they want
    //we could even have a little timer on the front end that tells you how long your opponnet has
    //before they will forfet
    function startCoinFlip(bytes32 _stack, bytes32 _counterStack, bytes32 _commit) public returns (bool) {
      //make sure it's the owner of the first stack (player one) doing the flip
      require(stacks[_stack].owner==msg.sender);
      //the counter must be a counter of stack 1
      require(stackCounter[_counterStack]==_stack);
      require(counterOfStack[_stack]==_counterStack);
      //make sure that we are in mode 1
      require(mode[_stack]==1);
      //store the commit for the next tx
      commit[_stack]=_commit;
      commitBlock[_stack]=uint32(block.number);
      //inc the mode to 2
      mode[_stack]=2;
      StartCoinFlip(_stack,_commit);
    }
    event StartCoinFlip(bytes32 stack, bytes32 commit);

    //tx5: player one ends coin flip with reveal
    function endCoinFlip(bytes32 _stack, bytes32 _counterStack, bytes32 _reveal) public returns (bool) {
      //make sure it's the owner of the first stack (player one) doing the flip
      require(stacks[_stack].owner==msg.sender);
      //the counter must be a counter of stack 1
      require(stackCounter[_counterStack]==_stack);
      require(counterOfStack[_stack]==_counterStack);
      //make sure that we are in mode 2
      require(mode[_stack]==2);

      //make sure hash of reveal == commit
      if(keccak256(_reveal)!=commit[_stack]){
        //commit/reveal failed.. this can happen if they
        //reload, so don't punish, just go back to the
        //start of the coin flip stage
        mode[_stack]=1;
        CoinFlipFail(_stack);
        return false;
      }else{
        //successful coin flip, ready to get random
        mode[_stack]=3;
        round[_stack]=1;
        bytes32 pseudoRandomHash = keccak256(_reveal,block.blockhash(commitBlock[_stack]));
        if(uint256(pseudoRandomHash)%2==0){
          //player1 goes first
          lastBlock[_stack]=uint32(block.number);
          lastActor[_stack]=stacks[_counterStack].owner;
          CoinFlipSuccess(_stack,stacks[_stack].owner,true);
        }else{
          //player2 goes first
          lastBlock[_stack]=uint32(block.number);
          lastActor[_stack]=stacks[_stack].owner;
          CoinFlipSuccess(_stack,stacks[_counterStack].owner,false);
        }
        return true;
      }

    }
    event CoinFlipSuccess(bytes32 indexed stack,address whosTurn,bool heads);
    event CoinFlipFail(bytes32 stack);


    //tx6 next player raises slammer
    function raiseSlammer(bytes32 _stack, bytes32 _counterStack, bytes32 _commit) public returns (bool) {
      if(lastActor[_stack]==stacks[_stack].owner){
        //it is player2's turn
        require(stacks[_counterStack].owner==msg.sender);
      }else{
        //it is player1's turn
        require(stacks[_stack].owner==msg.sender);
      }
      //the counter must be a counter of stack 1
      require(stackCounter[_counterStack]==_stack);
      require(counterOfStack[_stack]==_counterStack);
      //make sure that we are in mode 3
      require(mode[_stack]==3);
      //store the commit for the next tx
      commit[_stack]=_commit;
      commitBlock[_stack]=uint32(block.number);
      //inc the mode to 2
      mode[_stack]=4;
      RaiseSlammer(_stack,_commit);
    }
    event RaiseSlammer(bytes32 stack, bytes32 commit);


    //tx7 player throws slammer
    function throwSlammer(bytes32 _stack, bytes32 _counterStack, bytes32 _reveal) public returns (bool) {
      if(lastActor[_stack]==stacks[_stack].owner){
        //it is player2's turn
        require(stacks[_counterStack].owner==msg.sender);
      }else{
        //it is player1's turn
        require(stacks[_stack].owner==msg.sender);
      }
      //the counter must be a counter of stack 1
      require(stackCounter[_counterStack]==_stack);
      require(counterOfStack[_stack]==_counterStack);
      //make sure that we are in mode 4
      require(mode[_stack]==4);

      uint256[10] memory flipped;
      if(keccak256(_reveal)!=commit[_stack]){
        //commit/reveal failed.. this can happen if they
        //reload, so don't punish, just go back to the
        //start of the slammer raise
        mode[_stack]=3;
        throwSlammerEvent(_stack,msg.sender,address(0),flipped);
        return false;
      }else{
        //successful slam!!!!!!!!!!!! At this point I have officially been awake for 24 hours !!!!!!!!!!
        mode[_stack]=3;

        address previousLastActor = lastActor[_stack];

        bytes32 pseudoRandomHash = keccak256(_reveal,block.blockhash(commitBlock[_stack]));
        //Debug(_reveal,block.blockhash(block.number-1),pseudoRandomHash);
        if(lastActor[_stack]==stacks[_stack].owner){
          //player1 goes next
          lastBlock[_stack]=uint32(block.number);
          lastActor[_stack]=stacks[_counterStack].owner;
        }else{
          //player2 goes next
          lastBlock[_stack]=uint32(block.number);
          lastActor[_stack]=stacks[_stack].owner;
        }

        //look through the stack of remaining pogs and compare to byte to see if less than FLIPPINESS and transfer back to correct owner
        // oh man, that smells like reentrance --  I think the mode would actually break that right?
        bool done=true;
        uint8 randIndex = 0;
        for(uint8 i=0;i<10;i++){
          if(mixedStack[_stack][i]>0){
            //there is still a pog here, check for flip
            uint8 thisFlipper = uint8(pseudoRandomHash[randIndex++]);
            //DebugFlip(pseudoRandomHash,i,randIndex,thisFlipper,FLIPPINESS);
            if(thisFlipper<(FLIPPINESS+round[_stack]*FLIPPINESSROUNDBONUS)){
              //ITS A FLIP!
               uint256 tempId = mixedStack[_stack][i];
               flipped[i]=tempId;
               mixedStack[_stack][i]=0;
               SlammerTime slammerTimeContract = SlammerTime(stacks[_stack].slammerTime);
               //require( slammerTimeContract.transferBack(msg.sender,tempId) );
               slammerTimeContract.transferBack(msg.sender,tempId);
            }else{
              done=false;
            }
          }
        }

        throwSlammerEvent(_stack,msg.sender,previousLastActor,flipped);

        if(done){
          FinishGame(_stack);
          mode[_stack]=9;
          delete mixedStack[_stack];
          delete stacks[_stack];
          delete stackCounter[_counterStack];
          delete stacks[_counterStack];
          delete lastBlock[_stack];
          delete lastActor[_stack];
          delete counterOfStack[_stack];
          delete round[_stack];
          delete commitBlock[_stack];
          delete commit[_stack];
        }else{
          round[_stack]++;
        }

        return true;
      }
    }
    event ThrowSlammer(bytes32 indexed stack, address indexed whoDoneIt, address indexed otherPlayer, uint256 token1Flipped, uint256 token2Flipped, uint256 token3Flipped, uint256 token4Flipped, uint256 token5Flipped, uint256 token6Flipped, uint256 token7Flipped, uint256 token8Flipped, uint256 token9Flipped, uint256 token10Flipped);
    event FinishGame(bytes32 stack);

    function throwSlammerEvent(bytes32 stack,address whoDoneIt,address otherAccount, uint256[10] flipArray) internal {
      ThrowSlammer(stack,whoDoneIt,otherAccount,flipArray[0],flipArray[1],flipArray[2],flipArray[3],flipArray[4],flipArray[5],flipArray[6],flipArray[7],flipArray[8],flipArray[9]);
    }


    function drainStack(bytes32 _stack, bytes32 _counterStack) public returns (bool) {
      //this function is for the case of a timeout in the commit / reveal
      // if a player realizes they are going to lose, they can refuse to reveal
      // therefore we must have a timeout of TIMEOUTBLOCKS and if that time is reached
      // the other player can get in and drain the remaining tokens from the game
      require( stacks[_stack].owner==msg.sender || stacks[_counterStack].owner==msg.sender );
      //the counter must be a counter of stack 1
      require( stackCounter[_counterStack]==_stack );
      require( counterOfStack[_stack]==_counterStack );
      //the bad guy shouldn't be able to drain
      require( lastActor[_stack]==msg.sender );
      //must be after timeout period
      require( block.number - lastBlock[_stack] >= TIMEOUTBLOCKS);
      //game must still be going
      require( mode[_stack]<9 );

      for(uint8 i=0;i<10;i++){
        if(mixedStack[_stack][i]>0){
          uint256 tempId = mixedStack[_stack][i];
          mixedStack[_stack][i]=0;
          SlammerTime slammerTimeContract = SlammerTime(stacks[_stack].slammerTime);
          slammerTimeContract.transferBack(msg.sender,tempId);
        }
      }

      FinishGame(_stack);
      mode[_stack]=9;

      delete mixedStack[_stack];
      delete stacks[_stack];
      delete stackCounter[_counterStack];
      delete stacks[_counterStack];
      delete lastBlock[_stack];
      delete lastActor[_stack];
      delete counterOfStack[_stack];
      delete round[_stack];
      delete commitBlock[_stack];
      delete commit[_stack];

      DrainStack(_stack,_counterStack,msg.sender);
    }
    event DrainStack(bytes32 stack,bytes32 counterStack,address sender);

    function totalSupply() public view returns (uint) {
        return items.length - 1;
    }

    function tokensOfOwner(address _owner) external view returns(uint256[]) {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 total = totalSupply();
            uint256 resultIndex = 0;
            uint256 id;
            for (id = 1; id <= total; id++) {
                if (tokenIndexToOwner[id] == _owner) {
                    result[resultIndex] = id;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function withdraw(uint256 _amount) public onlyOwner returns (bool) {
      require(this.balance >= _amount);
      assert(owner.send(_amount));
      return true;
    }

    function withdrawToken(address _token,uint256 _amount) public onlyOwner returns (bool) {
      StandardToken token = StandardToken(_token);
      token.transfer(msg.sender,_amount);
      return true;
    }
}

contract StandardToken {
  function transfer(address _to, uint256 _value) public returns (bool) { }
}

contract SlammerTime {
  function startSlammerTime(address _player1,uint256[5] _id1,address _player2,uint256[5] _id2) public returns (bool) { }
  function transferBack(address _toWhom, uint256 _id) public returns (bool) { }
}
