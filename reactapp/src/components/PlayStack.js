import React, { Component } from 'react';
import EventParser from '../modules/eventParser.js';
import LiveParser from '../modules/liveParser.js';
import Stack from '../components/Stack.js'
import SimpleStack from '../components/SimpleStack.js'
import Cryptog from '../components/Cryptog.js'
import Slammer from '../components/Slammer.js'
import Spinner from '../components/Spinner.js'
import StackSelect from '../components/StackSelect.js'
import {Motion, spring, presets} from 'react-motion';
import MMButton from '../components/MMButton.js'
import PogAnimation from '../components/PogAnimation'
import LoaderAnimation from '../components/LoaderAnimation.js'
import Blockies from 'react-blockies'
import cookie from 'react-cookies'
import axios from 'axios'
import Phone from 'react-phone-number-input'
import 'react-phone-number-input/rrui.css'
import 'react-phone-number-input/style.css'
import Online from '../components/Online'
import Notification from 'react-web-notification'
var QRCode = require('qrcode-react');

const USEPHONE = false;

let loadInterval
let waitInterval
let slammerTimeout
const DEBUG = false
const SHOWDEMOSCREEN=false
const BLOCKTIMEOUT = 40
let txhash

const THROWROUNDTIME = 8000

let timeoutArray = []
let timeoutArrayTwo = []

const preStyle={
 margin:10
}


class PlayStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stackMode:0,
      stack:props.match.params.stack,
      counterStacks:[],
      stackedUpCryptogs:[],
      coinFlipResult:false,
      slammerSpinning:false,
      slammerAngle:15,
      slammerTop:-200,
      slammerLeft:-200,
      blockNumber:0,
      debugString:"con",
      notif:false,
      notifTitle:false,
      notifOptions:{},
    }

    this.waitForStuff()
    waitInterval = setInterval(this.waitForStuff.bind(this),1337)

  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  componentDidMount(){
    this.setState({debugString:"mount"})
    setTimeout(()=>{
      if(this.props&&this.props.api&&this.props.api.host){
        this.setState({debugString:"api"})
        this.loadAPIStackData()
        loadInterval = setInterval(this.loadAPIStackData.bind(this),1507)
        loadInterval = setInterval(this.touchStack.bind(this),15000)


        setInterval(()=>{
          axios.get(this.props.api.host+"/joining/"+this.state.stack)
          .then((response)=>{
            //console.log("JOINING",response)
            if(response.data) this.setState(response.data)
         })
        },2000)

      }else{
        this.setState({debugString:"decent"})
        this.loadStackData()
        loadInterval = setInterval(this.loadStackData.bind(this),707)
      }
    },1000)

  }
  waitForStuff(){
    if(DEBUG) console.log("waiting of stuff....")
    let {account,contracts,web3,showLoadingScreen,blockNumber} = this.props.context
    if(account&&contracts&&blockNumber&&contracts['Cryptogs']){
      this.startEventParsers()
      clearInterval(waitInterval)
    }
  }
  getActiveReceipts(){
    if(!this.state||!this.state.receipts) return {};
    let receipts = {}
    for(let user in this.state.receipts){
      if(this.state.revokes&&this.state.revokes[user]){
        for(let r in this.state.receipts[user]){
          //console.log("DECIDE ON GET REVEAL checking to see if receipt",r,this.state.receipts[user][r],"is in revokes",this.state.revokes[user][r])
          if(this.state.receipts[user][r].length > this.state.revokes[user][r].length){
            receipts[user] = r
          }
        }
      }else{
        for(let r in this.state.receipts[user]){
          receipts[user] = r
        }
      }
    }
    return receipts;
  }
  decideOnReveal(){
    let activeReceipts = this.getActiveReceipts()
    let users = []
    let receipts = []
    for(let user in activeReceipts){
      if(activeReceipts[user]){
        users.push(user)
        receipts.push(activeReceipts[user])
      }
    }
    if(receipts.length>=2){
        let get = this.props.api.host+"/reveal/"+this.state.stack+"/"+receipts[0]+"/"+users[0]+"/"+receipts[1]+"/"+users[1]
        console.log("DECIDE ON GET REVEAL get",get)
         axios.get(get)
         .then((response)=>{
           console.log("DECIDE ON GET REVEAL response",response)
           console.log("THEREVEAL",response.data)
           this.setState({reveal:response.data});
        })
    }
  }
  async startEventParsers(){
    if(DEBUG) console.log("STARTING PARSERS")
    let {account,contracts,web3,showLoadingScreen,blockNumber} = this.props.context

    if(this.props&&this.props.api&&this.props.api.version){
      console.log("FIRING UP 'centralized' EVENT PARSERS")
      let updateTransferStack = async (update)=>{

        if(!this.state.receipts) this.state.receipts={};
        let s = update._sender.toLowerCase()
        if(!this.state.receipts[s]) this.state.receipts[s] = {}
        if(!this.state.receipts[s][update._receipt]) this.state.receipts[s][update._receipt] = []
        if(this.state.receipts[s][update._receipt].indexOf(update._timestamp)<0){
          console.log("updateTransferStack",update)
          this.state.receipts[s][update._receipt].push(update._timestamp)
          if(update.blockNumber>this.state.blockNumber){
            this.setState({blockNumber:update.blockNumber})
          }
          this.setState({receipts:this.state.receipts},this.decideOnReveal);
        }
      }
      let filter = {_commit: this.state.stack}
      console.log("filter:",filter)
      EventParser(contracts["PizzaParlor"],"TransferStack",contracts["Cryptogs"].blockNumber,blockNumber,updateTransferStack,filter);
      setInterval(()=>{
        LiveParser(contracts["PizzaParlor"],"TransferStack",blockNumber,updateTransferStack,filter)
      },737)

      let updateRevokeStack = async (update)=>{
        if(!this.state.revokes) this.state.revokes={};
        let s = update._sender.toLowerCase()
        if(!this.state.revokes[s]) this.state.revokes[s] = {}
        if(!this.state.revokes[s][update._receipt]) this.state.revokes[s][update._receipt] = []
        if(this.state.revokes[s][update._receipt].indexOf(update._timestamp)<0){
          console.log("updateRevokeStack",update)
          this.state.revokes[s][update._receipt].push(update._timestamp)
          this.setState({revokes:this.state.revokes},this.decideOnReveal);
        }
      }
      filter = {_commit: this.state.stack}
      console.log("filter:",filter)
      EventParser(contracts["PizzaParlor"],"RevokeStack",contracts["Cryptogs"].blockNumber,blockNumber,updateRevokeStack,filter);
      setInterval(()=>{
        LiveParser(contracts["PizzaParlor"],"RevokeStack",blockNumber,updateRevokeStack,filter)
      },737)



      let updateFlip = async (update)=>{
        //console.log("updateFlip",update)
        if(!this.state.flips) this.state.flips={};
        if(!this.state.flips[update._token]) {
          this.state.flips[update._token] = update
          //console.log("FLIP",update._token,this.state.flips[update._token])
        }
      }
      filter = {_commit: this.state.stack}
      //console.log("filter:",filter)
      EventParser(contracts["PizzaParlor"],"Flip",contracts["Cryptogs"].blockNumber,blockNumber,updateFlip,filter);
      setInterval(()=>{
        LiveParser(contracts["PizzaParlor"],"Flip",blockNumber,updateFlip,filter)
      },737)

      let updateCoinFlip = async (update)=>{
        console.log("updateCoinFlip",update)
        if(this.state && !this.state.coinFlipResult && update._winner) {
          window.scrollTo(0, 0);
          this.state.coinFlipResult = {winner:update._winner.toLowerCase()}
        }
      }
      filter = {_commit: this.state.stack}
      //console.log("filter:",filter)
      EventParser(contracts["PizzaParlor"],"CoinFlip",contracts["Cryptogs"].blockNumber,blockNumber,updateCoinFlip,filter);
      setInterval(()=>{
        LiveParser(contracts["PizzaParlor"],"CoinFlip",blockNumber,updateCoinFlip,filter)
      },737)




    }else{
      console.log("FIRING UP DECENTRALIZED EVENT PARSERS")
      let thisStack = await contracts['Cryptogs'].methods.getStack(this.state.stack).call()
      let updateThrowSlammer = async (update)=>{
        console.log("updateThrowSlammer-------------------------------------------------------")
        let id = web3.utils.sha3(update.stack+update.blockNumber+update.whoDoneIt);
        if(!this.state.throwSlammerEvents) this.state.throwSlammerEvents={};
        if(!this.state.throwSlammerEvents[id]) {
          this.state.throwSlammerEvents[id]=update;
          console.log("UPDATE this.state.throwSlammerEvents",this.state.throwSlammerEvents)
          for(let t=1;t<=10;t++){
            let thisTokenId = update["token"+t+"Flipped"]
            //console.log("thisTokenId",thisTokenId)
            if(thisTokenId>0){
              let token = await contracts['Cryptogs'].methods.getToken(thisTokenId).call()//this.state.allStacks[id]
              //console.log("THIS TOKEN",token)
              this.state.throwSlammerEvents[id]["token"+t+"Flipped"] = {
                id:thisTokenId,
                image:web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
              }
            }
          }
          //console.log("UPDATEETETE",  this.state.throwSlammerEvents)
          this.setState({throwSlammerEvents:this.state.throwSlammerEvents});
        }
      }
      let filter = {stack: this.state.stack}
      EventParser(contracts["Cryptogs"],"ThrowSlammer",thisStack.block,blockNumber,updateThrowSlammer,filter);
      setInterval(()=>{
        LiveParser(contracts["Cryptogs"],"ThrowSlammer",blockNumber,updateThrowSlammer,filter)
      },737)
    }



  }
  loadImageForTokenId(id){
    if(this.state&&this.state.stackData){
      for(let i=1;i<=5;i++){
       if(this.state.stackData["token"+i]==id){
         return this.state.stackData["token"+i+"Image"]
       }
      }
    }

    if(this.state&&this.state._counterStack&&this.state.counterStacks){
      let counterstack = false
      if(!this.state._counterStack) return false
      for(let s in this.state.counterStacks){
        if(this.state._counterStack == this.state.counterStacks[s]._counterStack){
          counterstack = this.state.counterStacks[s]
        }
      }

      if(!counterstack) return false
      for(let i=1;i<=5;i++){
       if(counterstack["token"+i]==id){
         return counterstack["token"+i+"Image"]
       }
      }
    }
  }
  async touchStack(){
    try{
      if(this.state.stack&&!this.state._counterStack){
        axios.post(this.props.api.host+"/touch", {
          commit: this.state.stack,
        })
        .then(function (response) {
        //  console.log(response)
          //console.log("TOUCHED",response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
      }

    } catch(e) {
      console.log(e)
    }
  }
  async loadAPIStackData(){
    let {web3,account} = this.props.context
    try{
      let possibleFlightPaths = [-150,-200,-250,-300,-350,350,300,250,200,150];
      axios.get(this.props.api.host+"/commit/"+this.state.stack)
      .then((response)=>{

        if(response.data==""){
          window.location = "/stacks"
        }

        if(response.data&&response.data.counterStacks&&response.data.counterStacks.length>0){
          if(!this.state.sentNotif){
            this.sendNotif()
          }
        }

        if(!this.state.stackData){
          this.doUpdate(response.data)
        }
        //check to see if we are ready to run and not running yet
        let count =0
        for(let t in this.state.flips){
          count++
        }
        if(count>=10){
          if(this.state.flipping){
            //already flipping
          }else{
            let update = {flipping:true}

            update.stackMode = 4;

            update.flippingPogsSlideOut=false;
            update.flippingPogsAngle=false;

            update.mixedStack = []
            for(let t in this.state.flips){
              let someFlipTemp = this.state.flips[t]
              let token = someFlipTemp._token
              let image = this.loadImageForTokenId(someFlipTemp._token)
              update.mixedStack.push({id:token,image:image})
            }

            if(this.state && this.state.stackData && this.state.stackData.owner){
              update.lastActor = this.state.stackData.owner
            }

            this.doUpdate(update)

            //console.log("updateFlip","FLIPS ARE ALL IN, DISPLAY GAME!!!",this.state.flips)

            for(let round=1;round<=12;round++){
              timeoutArray[round] = setTimeout(()=>{


                update.stackMode = 3;

                update.flippedThisRound = []
                update.flippingPogs=false;
                let someFlipTemp
                let i = 0

                update.mixedStack = []

                let anyLeft = false

                let id = web3.utils.sha3(""+round);
                if(!this.state.throwSlammerEvents) this.state.throwSlammerEvents={};
                if(!this.state.throwSlammerEvents[id]) this.state.throwSlammerEvents[id]={};


                for(let t in this.state.flips){
                  if(parseInt(this.state.flips[t]._round)==round){

                    someFlipTemp = this.state.flips[t]
                    //console.log("updateFlip","t",t,"i",i,possibleFlightPaths[i])
                    let thisId = someFlipTemp._token
                    let thisImage = this.loadImageForTokenId(someFlipTemp._token)
                    let flippedTokenThisRound = {id:thisId,image:thisImage,thisFlightPath:possibleFlightPaths[i]}
                    update.flippedThisRound.push(flippedTokenThisRound)
                    update.flippingPogs=true;
                    this.state.throwSlammerEvents[id]["token"+i+"Flipped"] = {
                      id:thisId,
                      image:thisImage,
                    }
                    this.state.throwSlammerEvents[id].whoDoneIt = this.state.flips[t]._flipper
                    this.state.throwSlammerEvents[id].blockNumber = i
                    update.rowing = this.state.flips[t]._flipper.toLowerCase()
                    //console.log("SETFLIPPER",id,this.state.flips[t]._flipper)
                  }else  if(parseInt(this.state.flips[t]._round)>round){
                      anyLeft=true
                      someFlipTemp = this.state.flips[t]
                      let token = someFlipTemp._token
                      let image = this.loadImageForTokenId(someFlipTemp._token)
                      update.mixedStack.push({id:token,image:image})
                  }
                  i++
                }

                update.round = round
                update.throwSlammerEvents = this.state.throwSlammerEvents;

                //console.log("updateFlip","update.flippedThisRound",update.flippedThisRound,this.state)
                this.doUpdate(update)

                if(!anyLeft){
                  setTimeout(()=>{
                    while(round<=12){
                      clearTimeout(timeoutArray[round])
                      clearTimeout(timeoutArrayTwo[round])
                      round++
                    }
                    this.doUpdate({stackMode:9})


                  },3000)

                  setTimeout(()=>{
                    window.location = "/address/"+account
                  },9000)
                }

              },THROWROUNDTIME*round)
              timeoutArrayTwo[round] = setTimeout(()=>{
                let update = {}
                update.stackMode = 4;
                this.doUpdate(update)
              },(THROWROUNDTIME*round)+THROWROUNDTIME/2)
            }

          }

        }else{
          this.doUpdate(response.data)
        }

      }).catch((e)=>{
        console.log(e)
      })

    } catch(e) {
      console.log(e)
    }

    if(this.state&&this.state.stack&&this.state.stackData&&this.state.stackData.owner&&this.state._counterStack){

      if(this.state.stackMode<=1){
        let owner1 = this.state.stackData.owner
        //console.log("Check on transfer 1 ",this.state.stack,owner1)
        try{
          axios.get(this.props.api.host+"/transfer/"+this.state.stack+"/"+owner1)
          .then((response)=>{
            //console.log("XFER1--- ",response.data.txhash)
            if(response.data.txhash){
              this.setState({transfer1:response.data.txhash})
            }
          })
        } catch(e) {
          console.log(e)
        }
      }


      if(this.state.stackMode<=1){
        let owner2
        for(let c in this.state.counterStacks){
          if(this.state.counterStacks[c]._counterStack==this.state._counterStack){
            owner2 = this.state.counterStacks[c].owner
          }
        }
        if(owner2){
          //console.log("Check on transfer 2 ",this.state.stack,owner2)
          try{
            axios.get(this.props.api.host+"/transfer/"+this.state.stack+"/"+owner2)
            .then((response)=>{
              //console.log("XFER2--- ",response.data.txhash)
              if(response.data.txhash){
                this.setState({transfer2:response.data.txhash})
              }
            })
          } catch(e) {
            console.log(e)
          }
        }
      }

      if(this.state.stackMode<=1){
        //console.log("Check on generate ",this.state.stack)
        try{
          axios.get(this.props.api.host+"/generate/"+this.state.stack)
          .then((response)=>{
            //console.log("GENERATE--- ",response.data.txhash)
            if(response.data.txhash){
              this.setState({generate:response.data.txhash})
            }
          })
        } catch(e) {
          console.log(e)
        }

      }

      /*
      try{
        let possibleFlightPaths = [-150,-200,-250,-300,-350,350,300,250,200,150];
        axios.get(this.props.api.host+"/commit/"+this.state.stack)
        .then((response)=>{

        })
      } catch(e) {
        console.log(e)
      }*/
    }


    //event TransferStack(bytes32 indexed _commit,address indexed _sender,bytes32 indexed _receipt,uint256 _token1,uint256 _token2,uint256 _token3,uint256 _token4,uint256 _token5);
    //
  }
  async loadStackData(){
    let stack
    let {account,contracts,web3,showLoadingScreen} = this.props.context
    //console.log("contracts",contracts)
    let update = {}

    update.stackData = await contracts['Cryptogs'].methods.getStack(this.state.stack).call()
    update.player1 = update.stackData.owner
    console.log("PLAYER1",update.player1)

    for(let t=1;t<=5;t++){
      let token = await contracts['Cryptogs'].methods.getToken(update.stackData["token"+t]).call()//this.state.allStacks[id]
      update.stackData["token"+t+"Image"] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
    }
    update.stackMode = await contracts['Cryptogs'].methods.mode(this.state.stack).call()

    if(update.stackMode==9&&this.state.stackMode!=9){
      update.stackMode=8;
      setTimeout(()=>{
        this.setState({stackMode:9})
      },4000)
    }

    if(update.stackMode>0 && !this.state.coinFlipResult){
      let coinFlipSuccessEvents = await contracts['Cryptogs'].getPastEvents("CoinFlipSuccess", {
        filter: {stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      if(DEBUG) console.log("COIN FLIP RESULT",coinFlipSuccessEvents)
      if(coinFlipSuccessEvents&&coinFlipSuccessEvents[0]&&coinFlipSuccessEvents[0].returnValues){
        window.scrollTo(0, 0);
        this.state.coinFlipResult = coinFlipSuccessEvents[0].returnValues
        if(DEBUG) console.log("this.state.coinFlipResult",this.state.coinFlipResult)
      }
    }




    if(update.stackMode==0){
      let counterStackEvents = await contracts['Cryptogs'].getPastEvents("CounterStack", {
        filter: {_stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      let counterStacks = []
      for(let e in counterStackEvents){
        let thisStackData = await contracts['Cryptogs'].methods.getStack(counterStackEvents[e].returnValues._counterStack).call()
        for(let t=1;t<=5;t++){
          let token = await contracts['Cryptogs'].methods.getToken(thisStackData["token"+t]).call()//this.state.allStacks[id]
          thisStackData["token"+t+"Image"] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
        }
        thisStackData._counterStack = counterStackEvents[e].returnValues._counterStack
        counterStacks.push(thisStackData)
      }

      // event CancelCounterStack(address indexed _sender,uint256 indexed timestamp,bytes32 indexed _stack,bytes32 _counterstack);
      let cancelCounterStackEvents = await contracts['Cryptogs'].getPastEvents("CancelCounterStack", {
        filter: {_stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });

      for(let e in cancelCounterStackEvents){
        if(!update.stackData.canceledCounterStacks) update.stackData.canceledCounterStacks = []
        update.stackData.canceledCounterStacks.push(cancelCounterStackEvents[e].returnValues._counterstack)
      }

      update.counterStacks = counterStacks
    }else{

      update.lastBlock = await contracts['Cryptogs'].methods.lastBlock(this.state.stack).call()
      update.lastActor = await contracts['Cryptogs'].methods.lastActor(this.state.stack).call()
      update.TIMEOUTBLOCKS = await contracts['Cryptogs'].methods.TIMEOUTBLOCKS().call()
      let acceptCounterStackEvents = await contracts['Cryptogs'].getPastEvents("AcceptCounterStack", {
        filter: {_stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      for(let e in acceptCounterStackEvents){
        update.counterStack = acceptCounterStackEvents[e].returnValues._counterStack
        update.counterStackData = await contracts['Cryptogs'].methods.getStack(update.counterStack).call()
        update.player2 = update.counterStackData.owner
      }
    }

    update.spectator = (account && this.state.player1 && account.toLowerCase()!= this.state.player1.toLowerCase() && this.state.player2 && account.toLowerCase()!= this.state.player2.toLowerCase())

    if(update.stackMode==2&&!this.state.coinFlipping){
      update.coinFlipping=true
    }else if(update.stackMode==1&&this.state.coinFlipping){
      update.coinFlipping=false
    }


    if(update.stackMode!=this.state.stackMode){
      let mixedStackIds = await contracts['Cryptogs'].methods.getMixedStack(this.state.stack).call()

      if(DEBUG) console.log("mixedStackIds:",JSON.stringify(mixedStackIds),"lastMixedStackIds",JSON.stringify(this.state.mixedStackIds))

      update.mixedStackIds = mixedStackIds;

      update.mixedStack = []
      update.flippedThisRound = []

      let possibleFlightPaths = [-150,-200,-250,-300,-350,350,300,250,200,150];

      for(let i=0;i<10;i++){
        if(DEBUG) console.log("mixedStackDebug",i,mixedStackIds[i])
        if(mixedStackIds[i]>0){
          let token = await contracts['Cryptogs'].methods.getToken(mixedStackIds[i]).call()//this.state.allStacks[id]
          let image = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
          update.mixedStack.push({id:mixedStackIds[i],image:image})
        }else if(update.stackMode==3||update.stackMode==8){

          if(this.state.mixedStackIds){

            if(DEBUG) console.log("its a flip if ",this.state.mixedStackIds[i],"!=",update.mixedStackIds[i])
            if(this.state.mixedStackIds[i]!=update.mixedStackIds[i]){

              if(DEBUG) console.log("item",i,"is out")

              let tokenId = this.state.mixedStackIds[i]
              let token = await contracts['Cryptogs'].methods.getToken(tokenId).call()//this.state.allStacks[id]
              let image = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")


              let flippedTokenThisRound = {id:tokenId,image:image,thisFlightPath:possibleFlightPaths[i]}
              if(DEBUG) console.log("FLIPPED TOKEN THIS ROUND",flippedTokenThisRound)
              //let arrayofonerandompath = possibleFlightPaths.splice(Math.floor(Math.random()*possibleFlightPaths.length),1);
              //this.state.mixedStack[i].thisFlightPath = arrayofonerandompath[0]
              /*let alreadyFound = false
              for(let f in update.flippedThisRound){
                console.log("making sure ",update.flippedThisRound[f].id,"isnt alreaady == ",this.state.mixedStack[i].id)
                if(update.flippedThisRound[f].id == this.state.mixedStack[i].id){
                  alreadyFound=true
                }
              }
              if(alreadyFound){
                console.log("Skipping, already in...")
              }else{*/
                update.flippedThisRound.push(flippedTokenThisRound)
                update.flippingPogs=true;
                update.flippingPogsSlideOut=false;
                update.flippingPogsAngle=false;
              //}

            }

          }


        }
      }
      if(DEBUG) console.log("TRANSITION TO",update.mixedStack,JSON.stringify(update.flippedThisRound),JSON.stringify(this.state.flippedThisRound))

    }


    //if(update.stackMode>2){
      //  event ThrowSlammer(bytes32 indexed stack, bool success, address whoDoneIt, uint32 blockNumber, bool token1Flipped, bool token2Flipped, bool token3Flipped, bool token4Flipped, bool token5Flipped, bool token6Flipped, bool token7Flipped, bool token8Flipped, bool token9Flipped, bool token10Flipped);

      /*console.log("loading ALL slammer events (messy)")
      let start = Date.now()
      let throwSlammerEvents = await contracts['Cryptogs'].getPastEvents("ThrowSlammer", {
        filter: {stack: this.state.stack},
        fromBlock: contracts['Cryptogs'].blockNumber,
        toBlock: 'latest'
      });
      //console.log("throwSlammerEvents",throwSlammerEvents)
      update.throwSlammerEvents = []
      for(let e in throwSlammerEvents){
        throwSlammerEvents[e].returnValues.blockNumber = throwSlammerEvents[e].blockNumber
        update.throwSlammerEvents.push(throwSlammerEvents[e].returnValues)
      }
      let duration = Date.now()-start
      console.log("done loading ALL slammer events (YOU NEED TO PORT TO EVENT LOADER!)",duration)
      */
    //}

    this.doUpdate(update)
  }
  doUpdate(update){
    if(!update) update={}
    if(update.stackMode==3){
      update.slammerTop = -160
      update.slammerLeft = 0
      update.slammerAngle = 65
      update.slammerSpinning = false
    }else if(update.stackMode==4){
      update.slammerTop = -350
      update.slammerLeft = 0
      update.slammerAngle = 100
      update.slammerSpinning = false
    }else if(update.stackMode<1){
      update.slammerTop = -2000
      update.slammerLeft = 0
      update.slammerAngle = 25
      update.slammerSpinning = false
    }else if(update.stackMode<3){
      update.slammerTop = -270
      update.slammerLeft = 0
      update.slammerAngle = 15
      if(update.stackMode==2){
        update.slammerSpinning = true
      }else {
        update.slammerSpinning = false
      }
    }else{
      update.slammerTop = 0
      update.slammerLeft = -1000
      update.slammerAngle = 90
      update.slammerSpinning = false
    }


    //console.log("STACK SAVE ",update)
    this.setState(update,()=>{
      if(update.flippingPogs){
        this.setState({slammerTop:-80,slammerAngle:45})
        setTimeout(()=>{
          this.setState({flippingPogs:false,flippingPogsAngle:65})
          setTimeout(()=>{
            this.setState({flippingPogsSlideOut:true})
          },5000)
          this.setState({slammerTop:-120,slammerAngle:60})
        },1000)

      }
    })
  }
  acceptStack(counterStack){
    console.log("ACCEPT",this.state.stack,counterStack)
    let {contracts,account,showLoadingScreen} = this.props.context
    //acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack)
    //
    if(this.props&&this.props.api&&this.props.api.version){
      try{
        axios.post(this.props.api.host+'/accept', {
  				account: account,
          commit: this.state.stack,
          counterStack: counterStack,
  		  })
  		  .then(function (response) {
  				console.log(response)
  		    console.log("APIDATA",response.data);

  		  })
  		  .catch(function (error) {
  		    console.log(error);
  		  });
      } catch(e) {
        console.log(e)
      }

    }else{
      contracts["Cryptogs"].methods.acceptCounterStack(this.state.stack,counterStack).send({
        from: account,
        gas:1000000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
        txhash=hash
      }).on('error',(a,b)=>{
        if(txhash){
          console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
        }
      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
      this.setState({counterStack:counterStack})
    }

  }
  cancelStack(stack){
    console.log("CANCEL STACK")
    let {contracts,account,showLoadingScreen} = this.props.context
    if(this.props&&this.props.api&&this.props.api.version){
      try{
        axios.post(this.props.api.host+'/cancel', {
          commit: this.state.stack,
  		  })
  		  .then(function (response) {
  				window.location = "/stacks/"
  		  })
  		  .catch(function (error) {
  		    console.log(error);
  		  });
      } catch(e) {
        console.log(e)
      }

    }else{
      //acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack)
      contracts["Cryptogs"].methods.cancelStack(stack).send({
        from: account,
        gas:250000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash,"/stacks")
        txhash=hash
      }).on('error',(a,b)=>{

        if(txhash){
          //howLoadingScreen(false)
          console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
        }

      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        window.location = "/stacks"
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
    }

  }
  cancelCounterStack(stack,counterstack){
    console.log("CANCEL STACK",stack,counterstack)
    let {contracts,account,showLoadingScreen} = this.props.context
    if(this.props&&this.props.api&&this.props.api.version){
      try{
        axios.post(this.props.api.host+'/cancelcounter', {
          commit: this.state.stack,
          counter: counterstack
        })
        .then(function (response) {
          window.location = "/stacks/"
        })
        .catch(function (error) {
          console.log(error);
        });
      } catch(e) {
        console.log(e)
      }

    }else{
      //acceptCounterStack(address _slammerTime, bytes32 _stack, bytes32 _counterStack)
      contracts["Cryptogs"].methods.cancelCounterStack(stack,counterstack).send({
        from: account,
        gas:350000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash,"/stacks")
        txhash=hash
      }).on('error',(a,b)=>{
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        window.location = "/stacks"
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
    }

  }
  startCoinFlip(){



    console.log("START COIN FLIP",this.state.stack,this.state.counterStack)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let commit = web3.utils.sha3(Math.random()+this.state.account+"COINFLIP!")
    console.log("commit:",commit)
    let commitHash = web3.utils.sha3(commit)
    console.log("commitHash:",commitHash)

    cookie.save('commit', commit, { path: '/', maxAge:600 })
    this.setState({commit:commit})

    //startCoinFlip(bytes32 _stack, bytes32 _counterStack, bytes32 _commit)
    contracts["Cryptogs"].methods.startCoinFlip(this.state.stack,this.state.counterStack,commitHash).send({
        from: account,
        gas:150000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
        txhash=hash
      }).on('error',(a,b)=>{
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
  }

  endCoinFlip(){
    console.log("END COIN FLIP",this.state.stack,this.state.counterStack,this.state.commit)
    let {contracts,account,web3,showLoadingScreen} = this.props.context

    let reveal = this.state.commit
    //if reveal isn't saved in the state, send 0's to start over with the coin flip
    if(!reveal) reveal = cookie.load('commit')
    if(!reveal) reveal = "0x0000000000000000000000000000000000000000000000000000000000000000"

    //endCoinFlip(bytes32 _stack, bytes32 _counterStack, bytes32 _reveal)
    contracts["Cryptogs"].methods.endCoinFlip(this.state.stack,this.state.counterStack,reveal).send({
        from: account,
        gas:150000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash)
        txhash=hash
      }).on('error',(a,b)=>{
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
  }
  raiseSlammer(){
    if(this.props&&this.props.api&&this.props.api.host){

      //raise slammer centralized ?

    }else{
      console.log("raiseSlammer",this.state.stack,this.state.counterStack)
      let {contracts,account,web3,showLoadingScreen} = this.props.context

      let commit = web3.utils.sha3(Math.random()+this.state.account+"SLAMMERTIMEJABRONIES!")
      console.log("commit:",commit)
      let commitHash = web3.utils.sha3(commit)
      console.log("commitHash:",commitHash)
      cookie.save('commit', commit, { path: '/', maxAge:600 })
      this.setState({commit:commit})

      //raiseSlammer(bytes32 _stack, bytes32 _counterStack, bytes32 _commit)
      contracts["Cryptogs"].methods.raiseSlammer(this.state.stack,this.state.counterStack,commitHash).send({
          from: account,
          gas:150000,
          gasPrice:this.props.GWEI * 1000000000
        },(error,hash)=>{
          console.log("CALLBACK!",error,hash)
          showLoadingScreen(hash)
          txhash=hash
        }).on('error',(a,b)=>{
          console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
        }).then((receipt)=>{
          console.log("RESULT:",receipt)
          showLoadingScreen(false)
        }).catch(e=> {
            console.error('caught error', e);
        })
    }

  }
  throwSlammer(){
    if(this.props&&this.props.api&&this.props.api.host){

      //throw slammer centralized ?

    }else{
      console.log("throwSlammer",this.state.stack,this.state.counterStack,this.state.commit)
      let {contracts,account,web3,showLoadingScreen} = this.props.context

      let reveal = this.state.commit
      //if reveal isn't saved in the state, send 0's to start over with the coin flip
      if(!reveal) reveal = cookie.load('commit')
      if(!reveal) reveal = "0x0000000000000000000000000000000000000000000000000000000000000000"
      contracts["Cryptogs"].methods.throwSlammer(this.state.stack,this.state.counterStack,reveal).send({
          from: account,
          gas:500000,
          gasPrice:this.props.GWEI * 1000000000
        },(error,hash)=>{
          console.log("CALLBACK!",error,hash)
          showLoadingScreen(hash)
          txhash=hash
        }).on('error',(a,b)=>{
          console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
        }).on('transactionHash', function(transactionHash){
           console.log("XEVENT transactionHash",transactionHash)
        })
        .on('receipt', function(receipt){
           console.log("TXEVENT receipt",receipt) // contains the new contract address
        }).on('confirmation', function(confirmationNumber, receipt){
          console.log("TXEVENT confirmation",confirmationNumber)
        }).then((receipt)=>{
          console.log("RESULT:",receipt)
          showLoadingScreen(false)
        }).catch(e=> {
            console.error('caught error', e);
        })
    }

  }
  drainStack(){
    let {contracts,account,showLoadingScreen} = this.props.context
    console.log("drainStack",this.state.stack,this.state.counterStack)
    contracts["Cryptogs"].methods.drainStack(this.state.stack,this.state.counterStack).send({
      from: account,
      gas:1000000,
      gasPrice:this.props.GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
      txhash=hash
    }).on('error',(a,b)=>{
      console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
    }).then((receipt)=>{
      console.log("RESULT:",receipt)
      showLoadingScreen(false)
    }).catch(e=> {
        console.error('caught error', e);
    })
  }
  slammerClick(){
    let {account} = this.props.context
    let {lastActor,spectator} = this.state;
    if(spectator) return 0;
    if(account.toLowerCase()!=lastActor.toLowerCase()){
      console.log("SLAMMER CLICK")
      if(this.state.stackMode==3){
        this.raiseSlammer()
      }else if(this.state.stackMode==4){
        this.throwSlammer()
      }else if(this.state.stackMode==1){
        this.startCoinFlip()
      }else if(this.state.stackMode==2){
        this.endCoinFlip()
      }
    }else{
      if(!slammerTimeout){
        let ogSlammerTop = this.state.slammerTop
        this.setState({slammerTop:this.state.slammerTop+25})
        slammerTimeout = setTimeout(()=>{
          this.setState({slammerTop:ogSlammerTop})
          clearTimeout(slammerTimeout)
          slammerTimeout=false;
        })
      }

    }
  }
  revokeStack(stackData){
    let {account,blockNumber,contracts,etherscan,showLoadingScreen} = this.props.context
    console.log("REVOKE STACK",stackData)
    //function revokeStack(bytes32 _commit,uint _token1, uint _token2, uint _token3, uint _token4, uint _token5){
    contracts["PizzaParlor"].methods.revokeStack(stackData.commit,stackData.token1,stackData.token2,stackData.token3,stackData.token4,stackData.token5).send({
      from: account,
      gas:400000,
      gasPrice:this.props.GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
      txhash=hash
      try{
        axios.post(this.props.api.host+'/revoke', {
          account: account,
          stack: this.state.stackData,
          txhash: hash
        })
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error);
        });
      } catch(e) {
        console.log(e)
      }
    }).on('error',(a,b)=>{
      if(txhash){
        //howLoadingScreen(false)
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }
    }).then((receipt)=>{
      console.log("RESULT:",receipt)
      showLoadingScreen(false)
    }).catch(e=> {
        console.error('caught error', e);
    })


  }
  transferStack(stackData){
    let {account,blockNumber,contracts,etherscan,showLoadingScreen} = this.props.context
    let pizzaParlorAddress = contracts["PizzaParlor"]._address;
    console.log("TRANSFER STACK",stackData,"pizzaParlorAddress",pizzaParlorAddress)
    //cryptogs contract call but you need to know pizza parlor address :
    //function transferStackAndCall(address _to, uint _token1, uint _token2, uint _token3, uint _token4, uint _token5, bytes32 _data) public returns (bool) {
    console.log(pizzaParlorAddress,stackData.token1,stackData.token2,stackData.token3,stackData.token4,stackData.token5,stackData.commit)
    contracts["Cryptogs"].methods.transferStackAndCall(pizzaParlorAddress,stackData.token1,stackData.token2,stackData.token3,stackData.token4,stackData.token5,stackData.commit).send({
      from: account,
      gas:400000,
      gasPrice:this.props.GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
      txhash=hash
      try{
        axios.post(this.props.api.host+'/transfer', {
  				account: account,
          stack: stackData,
          txhash: hash
  		  })
  		  .then(function (response) {
  				console.log(response)
  		  })
  		  .catch(function (error) {
  		    console.log(error);
  		  });
      } catch(e) {
        console.log(e)
      }
    }).on('error',(a,b)=>{
      if(txhash){
        //howLoadingScreen(false)
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }
    }).then((receipt)=>{
      console.log("RESULT:",receipt)
      showLoadingScreen(false)
    }).catch(e=> {
        console.error('caught error', e);
    })


  }
  drainGame(playerToGenerate,playerStack,otherStack){

    let activeReceipts = this.getActiveReceipts()
    let users = []
    let receipts = []
    for(let user in activeReceipts){
      if(activeReceipts[user]){
        users.push(user)
        receipts.push(activeReceipts[user])
      }
    }

    let get = this.props.api.host+"/secret/"+this.state.stack+"/"+receipts[0]+"/"+users[0]+"/"+receipts[1]+"/"+users[1]
    console.log("DECIDE ON GET SECRET get",get)
     axios.get(get)
     .then((response)=>{
       console.log("DECIDE ON GET SECRET response",response)
       console.log("THE SECRET:::::",response.data.secret)

       let {account,blockNumber,contracts,etherscan,showLoadingScreen} = this.props.context

       console.log("DRAIN GAME",playerToGenerate,playerStack,otherStack,this.state.reveal)

       //generateGame(bytes32 _commit,bytes32 _reveal,address _opponent,uint _token1, uint _token2, uint _token3, uint _token4, uint _token5,uint _token6, uint _token7, uint _token8, uint _token9, uint _token10){

       console.log(this.state.stack,
       response.data.secret,
       otherStack.owner,
       playerStack.token1,
       playerStack.token2,
       playerStack.token3,
       playerStack.token4,
       playerStack.token5,
       otherStack.token1,
       otherStack.token2,
       otherStack.token3,
       otherStack.token4,
       otherStack.token5)

       //function drainGame(bytes32 _commit,bytes32 _secret,address _opponent,uint _token1, uint _token2, uint _token3, uint _token4, uint _token5,uint _token6, uint _token7, uint _token8, uint _token9, uint _token10){

       contracts["PizzaParlor"].methods.drainGame(
         this.state.stack,
         response.data.secret,
         otherStack.owner,
         playerStack.token1,
         playerStack.token2,
         playerStack.token3,
         playerStack.token4,
         playerStack.token5,
         otherStack.token1,
         otherStack.token2,
         otherStack.token3,
         otherStack.token4,
         otherStack.token5,
       ).send({
         from: account,
         gas:400000,
         gasPrice:this.props.GWEI * 1000000000
       },(error,hash)=>{
         console.log("CALLBACK!",error,hash)
         showLoadingScreen(hash)
         txhash=hash
       }).on('error',(a,b)=>{
         if(txhash){
           //howLoadingScreen(false)
           console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
         }
       }).then((receipt)=>{
         console.log("RESULT:",receipt)
         showLoadingScreen(false)
       }).catch(e=> {
           console.error('caught error', e);
       })

    })



  }
  generateGame(playerToGenerate,playerStack,otherStack){
    let {account,blockNumber,contracts,etherscan,showLoadingScreen} = this.props.context

    console.log("GENERATE GAME",playerToGenerate,playerStack,otherStack,this.state.reveal)

    //generateGame(bytes32 _commit,bytes32 _reveal,address _opponent,uint _token1, uint _token2, uint _token3, uint _token4, uint _token5,uint _token6, uint _token7, uint _token8, uint _token9, uint _token10){

    console.log(this.state.reveal.commit,
    this.state.reveal.reveal,
    otherStack.owner,
    playerStack.token1,
    playerStack.token2,
    playerStack.token3,
    playerStack.token4,
    playerStack.token5,
    otherStack.token1,
    otherStack.token2,
    otherStack.token3,
    otherStack.token4,
    otherStack.token5)

    contracts["PizzaParlor"].methods.generateGame(
      this.state.reveal.commit,
      this.state.reveal.reveal,
      otherStack.owner,
      playerStack.token1,
      playerStack.token2,
      playerStack.token3,
      playerStack.token4,
      playerStack.token5,
      otherStack.token1,
      otherStack.token2,
      otherStack.token3,
      otherStack.token4,
      otherStack.token5,
    ).send({
      from: account,
      gas:400000,
      gasPrice:this.props.GWEI * 1000000000
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      showLoadingScreen(hash)
      txhash=hash


      try{
        axios.post(this.props.api.host+'/generate', {
          account: account,
          stack: this.state.stackData,
          txhash: hash
        })
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error);
        });
      } catch(e) {
        console.log(e)
      }

    }).on('error',(a,b)=>{
      if(txhash){
        //howLoadingScreen(false)
        console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
      }
    }).then((receipt)=>{
      console.log("RESULT:",receipt)
      showLoadingScreen(false)
    }).catch(e=> {
        console.error('caught error', e);
    })


  }
  smsChange(value){
    let {account,blockNumber,contracts,etherscan,showLoadingScreen} = this.props.context
    this.setState({sms:value},()=>{
      //var phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
      //if(phoneNumberPattern.test(this.state.sms)){
      if(value.length>=12){
        console.log("this.state.sms",this.state.sms,"VALID")
        try{
          axios.post(this.props.api.host+'/phone', {
    				account: account,
            phone: value
    		  })
    		  .then(function (response) {
    				console.log(response)
    		    console.log("PHONESAVED",response.data);

    		  })
    		  .catch(function (error) {
    		    console.log(error);
    		  });
        } catch(e) {
          console.log(e)
        }
      }else{console.log("this.state.sms",this.state.sms,"INVALID")}
    })
  }
  sendNotif(){
    const options = {
     body: "A challenger has arrived!",
     icon: "https://raw.githubusercontent.com/austintgriffith/cryptogs/master/reactapp/public/cryptogs/ad8ball.png",
     lang: 'en',
     dir: 'ltr',
   }
   this.setState({
     notifTitle: "Cryptogs!",
     notifOptions: options,
     sentNotif: true
   });
  }
  render(){
    let qrcode
    let width = 700
    let mainStyle = {backgroundColor:"#FFFFFF",width:width,height:800,marginLeft:20}
    let scale = ((document.documentElement.clientWidth-100)/(width))
    let leftOffset = 0
    let topOffset = 0
    let left=0
    let top=0
    if(this.state.stackMode>0 && document.documentElement.clientWidth < width){
      mainStyle.transform =  "scale("+scale+")"
      mainStyle.marginLeft=-240*(1-(scale-.39))+120
      mainStyle.marginTop=-270*(1-(scale-.39))+30
      left = 0
      top = 350
    }else{
      mainStyle.width = document.documentElement.clientWidth-40
      left=(document.documentElement.clientWidth/4)
      top=550
    }


    //console.log(" DISPLAY")
    let {account,blockNumber,contracts,etherscan} = this.props.context

    let {coinFlipResult,stackMode,stackData,counterStacks,lastBlock,lastActor,TIMEOUTBLOCKS,flipEvents,throwSlammerEvents,player1,player2,spectator} = this.state;
    if(!stackData){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
      )
    }

    if(SHOWDEMOSCREEN){
      let stackx = 0
      let stackspread = 9
      return (
        <div style={{position:'relative',width:1000,height:900,background:'url("/static/media/halftone.d3864fe4.png")'}}>
          <div style={{position:'absolute',left:400,top:250}}>
          <div style={{position:'absolute',left:-300,top:-200,zIndex:1}}>
           <Cryptog angle={-45} scale={0.9} id={1} image={"awsmile1.jpg"}/>
          </div>
          <div style={{position:'absolute',left:320,top:-120,zIndex:1}}>
           <Cryptog angle={-65} scale={0.9} id={1} image={"awrainbowyinyang.jpg"}/>
          </div>
          <div style={{position:'absolute',left:0,top:stackx+stackspread*3,zIndex:1}}>
           <Cryptog angle={65} scale={0.9} id={1} image={"elephant.png"}/>
          </div>
            <div style={{position:'absolute',left:0,top:stackx+stackspread*2,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"awstussy.jpg"}/>
            </div>
            <div style={{position:'absolute',left:0,top:stackx+stackspread*1,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"awrainbowyinyang.jpg"}/>
            </div>
            <div style={{position:'absolute',left:0,top:stackx,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"awripsaw.jpg"}/>
            </div>
            <div style={{position:'absolute',left:189,top:130,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"bufficorn.jpg"}/>
            </div>
            <div style={{position:'absolute',left:129,top:-250,zIndex:1}}>
             <Cryptog angle={120} scale={0.9} id={1} image={"bufficorn.jpg"}/>
            </div>
            <div style={{position:'absolute',left:-180,top:110,zIndex:1}}>
             <Cryptog angle={-119} scale={0.9} id={1} image={"bufficorn.jpg"}/>
            </div>
            <div style={{position:'absolute',left:-240,top:-20,zIndex:1}}>
             <Cryptog angle={95} scale={0.9} id={1} image={"awstussy.jpg"}/>
            </div>
            <div style={{position:'absolute',left:-340,top:20,zIndex:1}}>
             <Cryptog angle={80} scale={0.9} id={1} image={"awstussy.jpg"}/>
            </div>
            <div style={{position:'absolute',left:-320,top:-90,zIndex:1,
                        fontWeight:'bold',fontSize:140,letterSpacing:-2}}>
              <img src="/logo.png" />
            </div>
            <div style={{position:'absolute',left:360,top:20,zIndex:1}}>
             <Cryptog angle={100} scale={0.9} id={1} image={"awblackwidow.jpg"}/>
            </div>
            <div style={{position:'absolute',left:-90,top:-300,zIndex:1}}>
             <Cryptog angle={130} scale={0.9} id={1} image={"awblackwidow.jpg"}/>
            </div>
            <div style={{position:'absolute',left:40,top:180,zIndex:1}}>
             <Cryptog angle={65} scale={0.9} id={1} image={"awblackwidow.jpg"}/>
            </div>

            <div style={{position:'absolute',left:0,top:-150,zIndex:10}}>
            <Slammer spinning={false} angle={35} image={"ethslammer.png"}/>
            </div>
            <div style={{position:'absolute',left:-150,top:122,zIndex:0,width:900,height:100,
                fontWeight:'bold',fontSize:28,letterSpacing:-0.5}}>
              Collect and play pogs on the Blockchain
            </div>
          </div>
        </div>
      )
    }

    if(!player1){
      player1 = this.state.stackData.owner
    }
    if(!player2){
      for(let c in this.state.counterStacks){
        if(this.state.counterStacks[c]._counterStack==this.state._counterStack){
          player2 = this.state.counterStacks[c].owner
        }
      }
    }

    let currentlyThrowing = this.state.currentlyThrowing


    //console.log("coinFlipResult",coinFlipResult)
    if(typeof coinFlipResult != "undefined"){
      if(coinFlipResult.winner){
        if(coinFlipResult.winner.toLowerCase()==player1.toLowerCase()){
          coinFlipResult.result=true
        }else{
          coinFlipResult.result=false
        }
      }

      if(coinFlipResult.result){
        coinFlipResult={whosTurn:player1}
        if(!currentlyThrowing&&player2) currentlyThrowing=player2.toLowerCase()
      //  console.log("set to player 1",coinFlipResult)
      }else{
        coinFlipResult={whosTurn:player2}
        if(!currentlyThrowing&&player1) currentlyThrowing=player1.toLowerCase()
      //  console.log("set to player 2",coinFlipResult)
      }


    }

    //console.log("checking for round...",this.state.coinFlipResult,this.state.round)
    if(this.state&&this.state.coinFlipResult&&this.state.coinFlipResult.winner&&this.state.round&&this.state.round>=1){
      //console.log("Double checking who is throwing based on round ",this.state.round)
      if(this.state.round%2==0){
        if(this.state.coinFlipResult.winner.toLowerCase()==player1.toLowerCase()){
          currentlyThrowing=player2
        }else{
          currentlyThrowing=player1
        }
      }else{
        if(this.state.coinFlipResult.winner.toLowerCase()==player1.toLowerCase()){
          currentlyThrowing=player1
        }else{
          currentlyThrowing=player2
        }
      }
    }

    let coinFlipResultDisplay = ""

    if(this.state.flipping && coinFlipResult&&player1!="0x0000000000000000000000000000000000000000"&&coinFlipResult.whosTurn){

        if(coinFlipResult.whosTurn.toLowerCase()==player1.toLowerCase()){
          coinFlipResultDisplay=(
            <div key={"logdivcoinflip"} style={{position:"relative",width:"100%",height:70,zIndex:99}}>
              <div style={{position:'absolute',left:0,top:0,zIndex:1}}>
                  <a target="_blank" href={"/address/"+player1}>
                   <Blockies
                     seed={player1.toLowerCase()}
                     scale={6}
                   />
                  </a>
              </div>
              <div style={{position:'absolute',left:20,top:-55,zIndex:1,transform: "scale(0.4)"}}>
               <Slammer spinning={false} angle={25} image={"ethslammer.png"}/>
              </div>
            </div>
          )
        }else{
          coinFlipResultDisplay=(
             <div key={"logdivcoinflip"} style={{position:"relative",width:"100%",height:70,zIndex:99}}>
               <div style={{position:'absolute',left:0,top:0,zIndex:1}}>
                  <a target="_blank" href={"/address/"+player2}>
                  <Blockies
                    seed={player2.toLowerCase()}
                    scale={6}
                  />
                  </a>
               </div>
               <div style={{position:'absolute',left:20,top:-55,zIndex:1,transform: "scale(0.4)"}}>
                <Slammer spinning={false} angle={25} image={"ethslammer.png"}/>
               </div>
             </div>
          )
        }

    }


    let flipDisplay = ""
    let throwSlammerEventArray = []
    for(let id in throwSlammerEvents){
      throwSlammerEventArray.push(throwSlammerEvents[id])
    }

    if(throwSlammerEventArray && throwSlammerEventArray.length>0){
      flipDisplay = throwSlammerEventArray.map((throwSlammerEvent)=>{
        if(throwSlammerEvent.otherPlayer!="0x0000000000000000000000000000000000000000"&&throwSlammerEvent.whoDoneIt){
          let flipped = []
          let count = 0
          for(let i=0;i<=9;i++){

              if(parseInt(throwSlammerEvent['token'+i+'Flipped'])!=0&&throwSlammerEvent['token'+i+'Flipped']){
                let key = "flipped"+i+throwSlammerEvent['token'+i+'Flipped'].id
                flipped.push(
                  <div key={key} style={{position:'absolute',left:20+((count++)*20),top:-40,zIndex:1}}>
                    <Cryptog angle={25} scale={0.4} id={throwSlammerEvent['token'+i+'Flipped'].id} image={throwSlammerEvent['token'+i+'Flipped'].image}/>
                  </div>
                )
              }

          }


          let who = ""

          //console.log("throwSlammerEvent",throwSlammerEvent);

         return (
           <div key={"logdiv"+throwSlammerEvent.blockNumber} style={{position:"relative",width:"100%",height:70,zIndex:99}}>
              {flipped}
              <div style={{position:"absolute",left:0,top:16,zIndex:3}}>
                <a target="_blank" href={"/address/"+throwSlammerEvent.whoDoneIt} style={{zIndex:4}}>
                  <Blockies
                    seed={throwSlammerEvent.whoDoneIt.toLowerCase()}
                    scale={6}
                  />
                </a>
              </div>

           </div>
         )
       }
     })
   }

   let mixedStack = []
   if(stackMode>0&&stackMode<9){
     for(let m in this.state.mixedStack){
       mixedStack.push(
         <div key={"mixedStack"+m} style={{position:'absolute',left:0,top:(-10*m),zIndex:1}}>
          <Cryptog angle={65} scale={0.9} id={this.state.mixedStack[m].id} image={this.state.mixedStack[m].image}/>
         </div>
       )
     }
   }

   let possibleFlightPaths = [-150,-200,-250,-300,-350,350,300,250,200,150];


   let flightStack = []
   if(stackMode==3||stackMode==8){
     for(let m in this.state.flippedThisRound){
       let thisFlightPath = this.state.flippedThisRound[m].thisFlightPath
       let possibleFlightPathsText = ""
       if(thisFlightPath<0) {
         possibleFlightPathsText = (thisFlightPath)*-1
       }else{
         possibleFlightPathsText = "N"+(thisFlightPath)
       }
       let animationName = "flightPath"+possibleFlightPathsText
       let top = (Math.abs(thisFlightPath)/2)//(m*15)+
       let left = thisFlightPath
       //console.log("-----flightStack",m,animationName,top,left)

       let className = "spinner"
       //console.log("this.state.flippingPogsSlideOut",this.state.flippingPogsSlideOut)
       if(this.state.flippingPogsSlideOut){
         className = "slideNorth"
       }

       flightStack.push(
         <div key={"flightStack"+m} className={className} style={{zIndex:50,animationName:animationName,position:"absolute",left:left,top:top,zIndex:50}}>
          <Cryptog scale={0.9} angle={this.state.flippingPogsAngle} id={this.state.flippedThisRound[m].id} flying={this.state.flippingPogs} image={this.state.flippedThisRound[m].image}/>
         </div>
       )
     }
   }

    let display = ""
    if(stackMode==0){

      //console.log("checking DISPLAY")
      if(this.props&&this.props.api&&this.props.api.version&&this.state._counterStack){
        //console.log("shouldn't DISPLAY")



        //  console.log("this.state",this.state)

        let transferStackBoxStyle = {
          marginTop:40*scale,
          fontSize:16
        }

        if(scale<0.5){
          transferStackBoxStyle.fontSize=12
        }


        let counterStackData = false
        for(let i in this.state.counterStacks){
          if(this.state.counterStacks[i]._counterStack == this.state._counterStack){
            counterStackData=this.state.counterStacks[i]
          }
        }

        this.state.stackData.commit = this.state.commit


        let activeReceipts = this.getActiveReceipts()


        //console.log("this.state.receipts",this.state.receipts)

        if(this.state && this.state.receipts && activeReceipts[stackData.owner.toLowerCase()] && activeReceipts[counterStackData.owner.toLowerCase()])
        {
          let owner1 = stackData.owner.toLowerCase()
          let hash1 = activeReceipts[owner1].substr(2,12)
          let player1hashSize = parseInt(hash1,16)

          let owner2 = counterStackData.owner.toLowerCase()
          let hash2 = activeReceipts[owner2].substr(2,12)
          let player2hashSize = parseInt(hash2,16);

          //console.log(player1hashSize,player2hashSize)

          let playerToDrain
          let playerToGenerate
          let playerNumber
          let playerStack
          let otherStack
          let fullstack = {}
          for(let i=1;i<=5;i++){
            fullstack["_token"+i] = stackData["token"+i]
            fullstack["_token"+i+"Image"] = stackData["token"+i+"Image"]
            fullstack["_token"+(i+5)] = counterStackData["token"+i]
            fullstack["_token"+(i+5)+"Image"] = counterStackData["token"+i+"Image"]
          }


          if( player1hashSize < player2hashSize ){
            playerNumber = 1
            playerToGenerate = stackData.owner.toLowerCase()
            playerToDrain = counterStackData.owner.toLowerCase()
            playerStack = stackData
            otherStack = counterStackData
          }else{
            playerNumber = 2
            playerToGenerate = counterStackData.owner.toLowerCase()
            playerToDrain = stackData.owner.toLowerCase()
            playerStack = counterStackData
            otherStack = stackData
          }
          //console.log("playerToGenerate",playerToGenerate)

          let buttonColor = "#AAAAAA"
          let clickFunction = ()=>{}

          if(playerToGenerate == account.toLowerCase()){
            buttonColor = "#6ac360"
            clickFunction = this.generateGame
          }

          let blocksToTimeout = (this.state.blockNumber+BLOCKTIMEOUT)-blockNumber

          let drain = ""

          if(!this.state||!this.state.api||!this.state.api.version){
            drain = (
              <div style={{fontSize:10,opacity:0.5,marginTop:5}}>
                {"("+blocksToTimeout+" blocks to timeout)"}
              </div>
            )
          }

          console.log("this.state.blockNumber",this.state.blockNumber,"BLOCKTIMEOUT",BLOCKTIMEOUT,"blockNumber",blockNumber)
          if(blocksToTimeout<=0 && playerToDrain==account.toLowerCase()){
            drain = (
              <div key={"transferStackButton"+this.state._counterStack} style={{marginTop:16,marginLeft:16}}>
                <MMButton color={"#fe2311"} onClick={this.drainGame.bind(this,playerToDrain,otherStack,playerStack)}>Drain</MMButton>
              </div>
            )
          }

          let playerWords = "Player "+playerNumber+" has the lower receipt hash and is chosen to generate the on-chain randomness..."
          if(playerToGenerate.toLowerCase()==account.toLowerCase()){
            playerWords = "You have the lower receipt hash, please press the 'Generate Game' button below:"
          }

          let generateTx = ""
          if(this.state.generate){
            generateTx = (
              <div className={"messageGray"} style={{margin:'0 auto',position:"relative",backgroundColor:"#eeeeee",width:260,height:40,border:"20px solid #dddddd"}}>
                <div style={{position:'absolute',left:0,bottom:20,opacity:0.3}}>
                  <LoaderAnimation/>
                </div>
                <div style={{position:'absolute',left:42,bottom:40,fontSize:24}}>
                  <a target="_blank" href={etherscan+"tx/"+this.state.generate}>{this.state.generate.substr(0,10)}</a>
                </div>
                <div style={{position:'absolute',right:0,bottom:20,opacity:0.3}}>
                  <LoaderAnimation/>
                </div>
              </div>
            )
          }

          display = (
            <div>
              <div className="row align-items-center">

                <div className="container text-center">

                  <p className="text-center" style={{padding:20*scale}}>{playerWords}</p>
                    <SimpleStack count={10} scale={0.7} spacing={40} height={180} {...fullstack}/>
                    <div key={"transferStackButton"+this.state._counterStack} style={{marginTop:36,marginLeft:16}}>
                      <MMButton color={buttonColor} onClick={clickFunction.bind(this,playerToGenerate,playerStack,otherStack)}>Generate Game</MMButton>
                    </div>
                    {generateTx}
                    {drain}
                </div>

              </div>
              <div className="row align-items-center" style={{opacity:0.7,maginTop:40}}>
                <div className="col-md-6" style={transferStackBoxStyle}>
                    <div className="container text-center">
                      <a target="_blank" href={"/address/"+owner1}>
                       <Blockies
                         seed={owner1}
                         scale={4}
                       />
                      </a>
                      <div>{"0x"+hash1}</div>

                    </div>
                </div>
                <div className="col-md-6" style={transferStackBoxStyle}>
                    <div className="container text-center">
                      <a target="_blank" href={"/address/"+owner2}>
                       <Blockies
                         seed={owner2}
                         scale={4}
                       />
                      </a>
                      <div>{"0x"+hash2}</div>
                    </div>
                </div>
              </div>
            </div>
          )
        }else{

          let firstStackColor = "#AAAAAA"
          let secondStackColor = "#AAAAAA"
          let firstClickFunction = ()=>{}
          let secondClickFunction = ()=>{}
          let firstRevokeFunction = ()=>{}
          let secondRevokeFunction = ()=>{}
          let firstPlayerName = "Player 1"
          let secondPlayerName = "Player 2"
          let firstRevokeColor = "#AAAAAA"
          let secondRevokeColor = "#AAAAAA"

          if(account.toLowerCase()==stackData.owner.toLowerCase()){
            firstClickFunction = this.transferStack.bind(this,this.state.stackData)
            firstRevokeFunction = this.revokeStack.bind(this,this.state.stackData)
          //  console.log("FIRST CLICK FUNCTION DATA ",this.state.stackData)
            firstStackColor = "#6ac360"
            firstPlayerName = "you"
            firstRevokeColor = "#f7861c"
          }else if(counterStackData.owner.toLowerCase()==account.toLowerCase()){
            secondClickFunction = this.transferStack.bind(this,counterStackData)
            secondRevokeFunction = this.revokeStack.bind(this,counterStackData)
            secondStackColor = "#6ac360"
            secondPlayerName = "you"
            secondRevokeColor = "#f7861c"
          }

        //  console.log("activeReceipts",activeReceipts)

          let messagePadding = 20*scale
          let transfer1 = ""
          if(this.state.transfer1){
            transfer1 = (
              <div className={"messageGray"} style={{margin:'0 auto',position:"relative",backgroundColor:"#eeeeee",width:260,height:40,border:"20px solid #dddddd"}}>
                <div style={{position:'absolute',left:0,bottom:20,opacity:0.3}}>
                  <LoaderAnimation/>
                </div>
                <div style={{position:'absolute',left:42,bottom:40,fontSize:24}}>
                  <a target="_blank" href={etherscan+"tx/"+this.state.transfer1}>{this.state.transfer1.substr(0,10)}</a>
                </div>
                <div style={{position:'absolute',right:0,bottom:20,opacity:0.3}}>
                  <LoaderAnimation/>
                </div>
              </div>
            )
          }

          let firstCol = ""
          if(activeReceipts && activeReceipts[stackData.owner.toLowerCase()]){
            firstCol = (
              <div className="col-md-6" style={transferStackBoxStyle}>
                  <p className="text-center" style={{padding:messagePadding}}>Stack Transferred!</p>
                  <div className="container text-center">
                      <SimpleStack showBlockie={true} padding={200} scale={0.9} spacing={70} height={180} {...stackData}/>
                      <div key={"transferStackButton"+this.state._counterStack} style={{marginTop:16,marginLeft:16}}>
                        <MMButton color={firstRevokeColor} onClick={firstRevokeFunction}>Revoke Stack</MMButton>
                      </div>
      						</div>
              </div>
            )
          }else{
            firstCol = (
              <div className="col-md-6" style={transferStackBoxStyle}>
                  <p className="text-center" style={{padding:messagePadding}}>Waiting for {firstPlayerName} to transfer stack to smart contract...</p>
                  <div className="container text-center">
                      <SimpleStack showBlockie={true} padding={200} scale={0.9} spacing={70} height={180} {...stackData}/>
                      <div key={"transferStackButton"+this.state._counterStack} style={{marginTop:16,marginLeft:16}}>
                        <MMButton color={firstStackColor} onClick={firstClickFunction}>Transfer to Contract</MMButton>
                      </div>
                      {transfer1}
      						</div>
              </div>
            )
          }

          let secondCol = ""

          let transfer2 = ""
          if(this.state.transfer2){
            transfer2 = (
              <div className={"messageGray"} style={{margin:'0 auto',position:"relative",backgroundColor:"#eeeeee",width:260,height:40,border:"20px solid #dddddd"}}>
                <div style={{position:'absolute',left:0,bottom:20,opacity:0.3}}>
                  <LoaderAnimation/>
                </div>
                <div style={{position:'absolute',left:42,bottom:40,fontSize:24}}>
                  <a target="_blank" href={etherscan+"tx/"+this.state.transfer2}>{this.state.transfer2.substr(0,10)}</a>
                </div>
                <div style={{position:'absolute',right:0,bottom:20,opacity:0.3}}>
                  <LoaderAnimation/>
                </div>
              </div>
            )
          }

          if(activeReceipts && activeReceipts[counterStackData.owner.toLowerCase()]){
            secondCol = (
              <div className="col-md-6" style={transferStackBoxStyle}>
                  <p className="text-center" style={{padding:messagePadding}}>Stack Transferred!</p>
                  <div className="container text-center">
                    <SimpleStack showBlockie={true} padding={200} scale={0.9} spacing={70} height={180}{...counterStackData}/>
                    <div key={"transferStackButton"+this.state._counterStack} style={{marginTop:16,marginLeft:16}}>
                      <MMButton color={secondRevokeColor} onClick={secondRevokeFunction}>Revoke Stack</MMButton>
                    </div>
                  </div>
              </div>
            )
          }else{
            secondCol = (
              <div className="col-md-6" style={transferStackBoxStyle}>
                  <p className="text-center" style={{padding:messagePadding}}>Waiting for {secondPlayerName} to transfer stack to smart contract...</p>
                  <div className="container text-center">
                    <SimpleStack showBlockie={true} padding={200} scale={0.9} spacing={70} height={180} {...counterStackData}/>
                    <div key={"transferStackButton"+this.state._counterStack} style={{marginTop:16,marginLeft:16}}>
                      <MMButton color={secondStackColor} onClick={secondClickFunction}>Transfer to Contract</MMButton>
                    </div>
                    {transfer2}
                  </div>
              </div>
            )
          }

          if(counterStackData.owner.toLowerCase()==account.toLowerCase()){
            display = (
              <div className="row align-items-center">
                {secondCol}
                {firstCol}
              </div>
            )
          }else{
            display = (
              <div className="row align-items-center">
                {firstCol}
                {secondCol}
              </div>
            )
          }

        }




      }else{
        let callToAction
        if(account.toLowerCase()==stackData.owner.toLowerCase()){
          callToAction=(
            <div key={"cancelstackbutton"+this.state.stack} style={{marginTop:20,marginLeft:20}}>
              <MMButton color={"#f7861c"} onClick={this.cancelStack.bind(this,this.state.stack)}>cancel</MMButton>
            </div>

          )
        }


        let stackDisplay = (
          <div style={{position:"relative"}}>
            <SimpleStack key={"mainstack"} showBlockie={true} padding={350} scale={0.95} spacing={130} height={150}  {...stackData} 	/>
            <div style={{position:"absolute",right:(0.6-scale)*-100,top:30,zIndex:99}}>
              {callToAction}
            </div>
          </div>
        )
        //<Stack key={"mainstack"} {...stackData} callToAction={callToAction}/>


        let drawCounterStacks = counterStacks.map((counterstack)=>{
          if(!counterstack.canceled && (!stackData.canceledCounterStacks || stackData.canceledCounterStacks.indexOf(counterstack._counterStack)<0)){
            let callToAction
            if(account.toLowerCase()==stackData.owner.toLowerCase()){
              callToAction=(
                <div key={"counterstackbutton"+counterstack._counterStack} style={{marginTop:20*scale,marginLeft:16}}>
                  <MMButton color={"#6ac360"} onClick={this.acceptStack.bind(this,counterstack._counterStack)}>accept</MMButton>
                </div>
              )
            }else if(counterstack.owner.toLowerCase()==account.toLowerCase()){
              callToAction=(
                <div key={"counterstackcancelbutton"+counterstack._counterStack} style={{marginTop:20,marginLeft:20}}>
                  <MMButton color={"#f7861c"} onClick={this.cancelCounterStack.bind(this,this.state.stack,counterstack._counterStack)}>cancel</MMButton>
                </div>
              )
            }
            return (
              <div style={{position:"relative"}}>
                <SimpleStack key={"counterstack"+counterstack._counterStack} showBlockie={true} padding={350} scale={0.95} spacing={130} height={180}  {...counterstack} 	/>
                <div style={{position:"absolute",right:(0.6-scale)*-100,top:30,zIndex:99}}>
                  {callToAction}
                </div>
              </div>
            )
            //<Stack key={"counterstack"+counterstack._counterStack} {...counterstack} callToAction={callToAction}/>
          }
        })

        let message

        let portInfo = ""
        if(window.location.port && window.location.port!="80"){
          portInfo=":"+window.location.port
        }

        let counterStackCount = 0
        for(let c in drawCounterStacks){
          if(drawCounterStacks[c]) counterStackCount++
        }

        let phoneInput = ""
        if(USEPHONE){
          phoneInput=(

            <div style={{position:"relative"}}>
            Receive a text when challenger arrives:
            <div style={{margin:"auto",width:180,padding:10}}>
              <Phone country="US" style={{width:160}}  placeholder="555-555-5555" value={ this.state.sms } onChange={ this.smsChange.bind(this) } />
            </div>
            </div>

          )
        }

        if(stackData.owner=="0x0000000000000000000000000000000000000000"){
          window.location.reload(true);
        }

        let dub = 170

        let topPadderJoiner = 0


        let joining = ""

        if(counterStackCount>0){
          topPadderJoiner = 0
        }else{
          if(this.state.joining){
            topPadderJoiner=160
            joining = (
              <div style={{transform:"scale("+0.8+")",height:dub,marginLeft:document.documentElement.clientWidth/2-dub/2,width:dub}} className={"messageGray"} >
                <a target="_blank" href={"/address/"+this.state.joining.toLowerCase()}>
                 <Blockies
                   seed={this.state.joining.toLowerCase()}
                   scale={8}
                 />
                </a>
                 joining...
              </div>
            )
          }
        }


        if(account.toLowerCase()==stackData.owner.toLowerCase()){
          if(counterStackCount>0){
            qrcode = window.location.protocol+"//"+window.location.hostname+portInfo+"/join/"+this.state.stack
            message = ""
            message = (
              <div>
                <div style={{padding:10,paddingTop:20,marginTop:topPadderJoiner}}>Share game url:</div>
                <div style={preStyle}>
                  <pre id="url" style={{fontSize:14}} onClick={selectText}>{qrcode}</pre>
                </div>
                <div style={{padding:10,paddingTop:20}} className={"actionable"}>{"Accept an opponent's stack:"}</div>
              </div>
            )
          }else{
            if(this.props.api&&this.props.api.version){



              let notifBody = ""
              if(this.state.notif){
                notifBody = (
                  <div>
                  <Notification
                    /*  ignore={}
                      notSupported={this.handleNotSupported.bind(this)}
                      onPermissionGranted={this.handlePermissionGranted.bind(this)}
                      onPermissionDenied={this.handlePermissionDenied.bind(this)}
                      onShow={this.handleNotificationOnShow.bind(this)}
                      onClick={this.handleNotificationOnClick.bind(this)}
                      onClose={this.handleNotificationOnClose.bind(this)}
                      onError={this.handleNotificationOnError.bind(this)}*/
                      askAgain={true}
                      timeout={8000}
                      title={this.state.notifTitle}
                      options={this.state.notifOptions}
                  />
                  (Allow notifications and you will receive a browser notification when a challenger arrives.)
                  </div>
                )
              }else{
                notifBody = (
                  <MMButton color={"#6081c3"} onClick={()=>{
                    this.setState({notif:true})
                  }}>Notify Me When Challenger Arrives</MMButton>
                )
              }

              qrcode = window.location.protocol+"//"+window.location.hostname+portInfo+"/join/"+this.state.stack
              message = (
                <div>

                  <div className={"centercontainer"}>
                    <div style={{padding:40,marginTop:60}}>
                    <div style={{padding:10,paddingTop:20}}>Waiting for other players</div>

                    <div style={{padding:10,marginTop:topPadderJoiner}}>Share game url:</div>
                    <div style={preStyle}>
                      <pre id="url" style={{fontSize:14}} onClick={selectText}>{qrcode}</pre>
                    </div>

                    <div style={{marginTop:40}}>
                     {notifBody}
                    </div>

                    <div style={{padding:10,paddingTop:20}}>
                        {phoneInput}
                    </div>
                    </div>

                  </div>


                </div>
              )
            }else{
              qrcode=window.location.protocol+"//"+window.location.hostname+portInfo+"/join/"+this.state.stack
              message = (
                <div>
                  <div style={{padding:10,paddingTop:20}}>Waiting for other players, share game url to challenge your friends:</div>
                  <div style={preStyle}>
                  <pre id="url" style={{fontSize:14}} onClick={selectText}>{qrcode}</pre>
                  </div>
                  <div className={"centercontainer"}>
                    <div style={{padding:40,marginTop:60}}>
                      <MMButton color={"#6081c3"} onClick={()=>{
                        window.open(etherscan+"address/"+contracts['Cryptogs']._address);
                      }}>Watch Contract Transactions</MMButton>
                    </div>
                  </div>
                </div>
              )
            }

          }
        }else{

            message = (
              <div style={{padding:20}} className={"actionable"}>
                {"Waiting for the player 1 to accept a stack..."}
              </div>
            )

        }

        //console.log("PLAYSTACK SCALE",scale)

        let messageScale = 1
        let heightScale = 1
        if(scale<1){
          messageScale = scale*1.5
          heightScale = scale*1.7
        }

        let qrcodedisplay = ""
        if(qrcode){
          qrcodedisplay = (
            <div className={"centercontainer"} style={{marginTop:300}}>
              <QRCode value={qrcode} size={320}/>
            </div>
          )
        }



        //console.log("shrkinkgngk",scale)
        display = (
          <div>
            {stackDisplay}
            <div className="text-center" style={{transform:"scale("+messageScale+")",height:160*heightScale}}>
              <p>
                {message}
              </p>
            </div>
            {drawCounterStacks}
            <div>
              {joining}
              {qrcodedisplay}
            </div>
          </div>
        )
      }


    }
    else if(stackMode==1){
      if(!this.props.api||!this.props.api.version){
        if(account.toLowerCase()==stackData.owner.toLowerCase()){
          display = (
            <div className={"actionable"}>
              Click the slammer to determine who goes first...
            </div>
          )
        }else{
          display = (
            <div>
              Waiting for player 1 to start slammer flip to determine who goes first...
            </div>
          )
        }
      }
    }else if(stackMode==2){
      if(!this.props.api||!this.props.api.version){
        if(account.toLowerCase()==stackData.owner.toLowerCase()){
          display = (
            <div className={"actionable"}>
              Click the slammer to stop it to determine who goes first...
            </div>
          )
        }else{
          display = (
            <div style={{marginTop:20}}>
              Waiting for player 1 to stop slammer flip...
            </div>
          )
        }
      }
    }else if(stackMode==3){
      if(!this.props.api||!this.props.api.version){
        if(!spectator){
          if(account.toLowerCase()==lastActor.toLowerCase()){
            display = (
              <div>
                Waiting for other player to raise slammer...
              </div>
            )
          }else{
            display = (
              <div className={"actionable"}>
                Click the slammer to prepare to throw...
              </div>
            )
          }
        }
      }
    }else if(stackMode==4){
      if(!this.props.api||!this.props.api.version){
        if(!spectator){
          if(account.toLowerCase()==lastActor.toLowerCase()){
            display = (
              <div>
                Waiting for other player to throw slammer...
              </div>
            )
          }else{
            display = (
              <div className={"actionable"}>
                Click the slammer to throw...
              </div>
            )

          }
        }
      }else if(currentlyThrowing){
          let currentPlayer

          if(currentlyThrowing.toLowerCase()==player1.toLowerCase()){
            currentPlayer=player2.toLowerCase()
          }else if(currentlyThrowing.toLowerCase()==player2.toLowerCase()){
            currentPlayer=player1.toLowerCase()
          }
          console.log("currentlyThrowing",currentlyThrowing,"currentPlayer",currentPlayer)
          //if(player1.toLowerCase()==){
          //  currentPlayer = player2.toLowerCase()
          //}
          if(currentPlayer){
            display = (
              <div style={{position:'absolute',left:10,top:"20%"}}>
                <a target="_blank" href={"/address/"+currentPlayer.toLowerCase()}>
                 <Blockies
                   seed={currentPlayer.toLowerCase()}
                   scale={10}
                 />
                </a>
              </div>
            )
          }

      }

    }else if(stackMode==9){
      coinFlipResultDisplay=""
      //flipDisplay=""
        display = (
          <div>
            <div style={{opacity:0.3,marginTop:0,fontWeight:'bold',padding:50,fontSize:99,letterSpacing:-2}}>
              Game Over
            </div>
            <div className={"centercontainer"}>
              <div style={{padding:40,marginTop:80}}>
                <MMButton color={"#6ac360"} onClick={()=>{window.location="/stacks"}}>{"Play 'Togs!"}</MMButton>
              </div>
            </div>
          </div>
        )

    }else{
      display = (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
      )
    }

    let slammerOpacity = 0.7

    if(this.props&&this.props.api&&this.props.api.version) slammerOpacity=1


    let timerDisplay = ""
    if(lastBlock&&lastActor || (this.props&&this.props.api&&this.props.api.version&&this.state.stackMode>0)){

      let turn
      if(spectator){
        if(player1 &&lastActor&& player1.toLowerCase()==lastActor.toLowerCase()){
          turn = "Player 2's Turn"
        }else{
          turn = "Player 1's Turn"
          slammerOpacity=1
        }
      }else{
        if(account && lastActor && account.toLowerCase()==lastActor.toLowerCase()){
          turn = "Their Turn"
        }else{
          turn = "Your Turn"
          slammerOpacity=1
        }
      }



      let drainDisplay = ""
      if(blockNumber-lastBlock >= TIMEOUTBLOCKS && !spectator){
        drainDisplay = (
          <MMButton color={"#fe2311"} onClick={this.drainStack.bind(this)}>drain</MMButton>
        )
      }


      let turnHeight = 80
      if(drainDisplay) turnHeight+=50

      if(stackMode<9){
        timerDisplay = ""
        if(lastBlock>0){
          timerDisplay = (
            <div style={{height:turnHeight}}>
              <div style={{fontSize:30}}>{turn}</div>
              <div style={{fontSize:12,opacity:0.2}}>{blockNumber-lastBlock}/{TIMEOUTBLOCKS} blocks to timeout</div>
              <div>{drainDisplay}</div>
            </div>
          )
        }
      }

    }

    let m=1

    let flipDisplyContent = ""
    if(coinFlipResultDisplay || flipDisplay){
      flipDisplyContent = (
        <div className={"messageGray"} style={{clear:'both',marginTop:50,width:200,float:'right',padding:20}}>
          {timerDisplay}
          {coinFlipResultDisplay}
          {flipDisplay}
        </div>
      )
    }

    let slammerCursor = 'not-allowed'
    if(account&&lastActor&&account.toLowerCase()!=lastActor.toLowerCase()){
      slammerCursor = 'pointer'
    }


    let online = ""
    if(this.state.stackMode<=1){
      online = (
        <div style={{marginTop:150,zIndex:-1,opacity:0}}>
         <Online {...this.props.context}/>
       </div>
      )
    }

    return (
      <div style={mainStyle}>
      {flipDisplyContent}
      {display}
      <div style={{position:'absolute',left:left,top:top}}>
        {mixedStack}
        {flightStack}
        <Motion
        defaultStyle={{
          left:0,
          top:0,
        }}
        style={{
          top:spring(this.state.slammerTop,{ stiffness: 100, damping: 6 }),
          left:spring(this.state.slammerLeft,{ stiffness: 100, damping: 6 })
        }}
        >
          {currentStyles => {
            return (
              <div onClick={this.slammerClick.bind(this)} style={{opacity:slammerOpacity,cursor:slammerCursor,position:"absolute",left:currentStyles.left,top:currentStyles.top,zIndex:90}}>
                <Slammer spinning={this.state.slammerSpinning} angle={this.state.slammerAngle} image={"ethslammer.png"}/>
              </div>
            )
          }}
        </Motion>
      </div>

        {online}
      </div>
    )

  }
}
export default PlayStack;

/*
<div className={"spinner"} style={{
  animationName:"flightPathN350",
  position:"absolute",left:350,top:175
}} >
 <Cryptog angle={30} id={0} flying={this.state.flippingPogs} image={"unicorn.png"}/>
</div>
 */

function selectText() {
    let containerid = "url"
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}
