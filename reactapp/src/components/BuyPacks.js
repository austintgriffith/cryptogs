import React from 'react'
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import MMButton from '../components/MMButton.js'
import Pack from '../components/Pack.js'
import EventParser from '../modules/eventParser.js';
import LiveParser from '../modules/liveParser.js';
import PogAnimation from '../components/PogAnimation.js'

let loadInterval
let initialIntervalLoaded

const MINTEDPACKDISPLAYLIMIT = 3
const DEBUG = false

const GASTOBUYPACKS = 550000

let txhash

export default createClass({
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		metaMaskHintFn: PropTypes.func,
		showLoadingScreen: PropTypes.func,
		throwAlert: PropTypes.func,
		blockNumber: PropTypes.number,
		etherscan: PropTypes.string,
		GWEI: PropTypes.number,
	},
	getInitialState(){
		return {mintedPacks:[],shouldHaveLoaded:false,debounce:true,showAll:false}
	},
	componentDidMount(){
		this.loadPackData()
		loadInterval = setInterval(this.loadPackData,107)
		setTimeout(()=>{
			this.setState({debounce:false})
		},2000)
	},
	componentWillUnmount(){
		clearInterval(loadInterval)
	},
	async loadPackData(){
		let foundNew = false
		let {contracts,web3,blockNumber} = this.context
		if(contracts && contracts['Cryptogs']&&blockNumber) {
			clearInterval(loadInterval)
			if(DEBUG) console.log("FIRING UP PARSERS...")
			let updateMintPack = async (update)=>{
				let id = update.packId;
				if(!this.state.mintedPacks[id]) this.state.mintedPacks[id]={}
				if(!this.state.mintedPacks[id].price){
					Object.assign(this.state.mintedPacks[id],{price:web3.utils.fromWei(update.price,"ether"),tokens:[]});
					this.state.mintedPacks[id].tokens = []
					this.state.mintedPacks[id].images = []
					for(let i=1;i<=10;i++){
						let tokenid = update["token"+i];
						let token = await contracts['Cryptogs'].methods.getToken(tokenid).call()
						this.state.mintedPacks[id].tokens[i-1] = tokenid
						this.state.mintedPacks[id].images[i-1] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
					}
					if(DEBUG) console.log("UPDATING MINTED PACKS",this.state.mintedPacks)
					this.setState({mintedPacks:this.state.mintedPacks})
				}
			}
			EventParser(contracts["Cryptogs"],"MintPack",contracts["Cryptogs"].blockNumber,blockNumber,updateMintPack);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"MintPack",blockNumber,updateMintPack)
			},737)


			let updateBuyPack = async (update)=>{
				let id = update.packId;
				if(!this.state.mintedPacks[id]) this.state.mintedPacks[id]={}
				if(this.state.mintedPacks[id]&&!this.state.mintedPacks[id].bought){
					this.state.mintedPacks[id].bought = update.sender
					if(DEBUG) console.log(update)
					if(DEBUG) console.log("UPDATING MINTED PACK WITH BUY",this.state.mintedPacks)
					this.setState({mintedPacks:this.state.mintedPacks})
				}
			}
			EventParser(contracts["Cryptogs"],"BuyPack",contracts["Cryptogs"].blockNumber,blockNumber,updateBuyPack);
			setInterval(()=>{
				LiveParser(contracts["Cryptogs"],"BuyPack",blockNumber,updateBuyPack)
			},1011)


		}
	},
	render(){

    const { compact } = this.props
		const { account,contracts,web3,metaMaskHintFn,showLoadingScreen } = this.context



		const { mintedPacks,shouldHaveLoaded,debounce } = this.state
		if(!mintedPacks || debounce) return (<div style={{opacity:0.3}}><div className={"centercontainer"}>
			<div style={{padding:40}}>
				<div style={{opacity:0.3}}><PogAnimation loader={true} image={"unicorn.png"}/></div>
			</div>
		</div></div>)
    let mintedPackRender

		if(!contracts || !contracts['Cryptogs'] ) {
			return (
				<div className={"centercontainer"}>
					<div style={{padding:40}}>
						<MMButton color={"#6ac360"} onClick={()=>{metaMaskHintFn()}}>{"Play Togs"}</MMButton>
					</div>
				</div>
			)

		}

		//console.log("mintedPacks",mintedPacks)

		let sortedPacks = []
		for(let p in mintedPacks){
			if(mintedPacks[p] && !mintedPacks[p].bought && mintedPacks[p].price){
				mintedPacks[p].id = p
				sortedPacks.push(mintedPacks[p])
			}
		}
		sortedPacks.sort(function(a, b) {
		    return a.price - b.price;
		});

		//console.log("sortedPacks",sortedPacks)

			let foundOfPrice = {}

			let viewButton = ""



    if(compact){
			let buypacks = []

			let displycount = 0
			for(let p in sortedPacks){
  			if(sortedPacks[p].price){
					if(!foundOfPrice[sortedPacks[p].price]){
						foundOfPrice[sortedPacks[p].price]=true;
						if(displycount++<4){
	  					buypacks.push(
	  						<Pack compact={true} id={p} key={"pack"+p} {...sortedPacks[p]} PackClick={
	  							(p)=>{
	  								if(!account){
	  									metaMaskHintFn()
	  								}else{

												contracts["Cryptogs"].methods.buyPack(sortedPacks[p].id).send({
													from: account,
													value: web3.utils.toWei(sortedPacks[p].price,"ether"),
													gas:GASTOBUYPACKS,
													gasPrice:this.context.GWEI * 1000000000
												},(error,hash)=>{
													console.log("CALLBACK!",error,hash)
													showLoadingScreen(hash,"/address/"+account)
													txhash=hash
												}).on('error',(a,b)=>{
													console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
												}).then((receipt)=>{
													console.log("RESULT:",receipt)
													showLoadingScreen(false)
													window.location = "/address/"+account
												}).catch(e=> {
														console.error('caught error', e);
												})

	  								}
	  							}
	  						}/>
	  					)
	  				}
					}
  			}
  		}

      	mintedPackRender = (
			<div>
		        <div className={"row"}>
			        <div className={"col-md-6"}>
						{buypacks[0]}
			        </div>
			        <div className={"col-md-6"}>
						{buypacks[1]}
			        </div>
		        </div>
				<div style={{padding:40}}>
					<MMButton color={"#6081c3"} onClick={()=>{window.location="/buy"}}>View All Packs</MMButton>
				</div>
			</div>
      	)

    }else{

			if(!this.state.showAll){
				viewButton = (
				 <div style={{padding:40}}>
					 <MMButton color={"#6081c3"} onClick={()=>{this.setState({showAll:true})}}>{"View More Packs"}</MMButton>
				 </div>
			 )
			}

      mintedPackRender = []
  		let displycount = 0
  		for(let p in sortedPacks){
  			if(sortedPacks[p].price){
					if(!foundOfPrice[sortedPacks[p].price]){
						foundOfPrice[sortedPacks[p].price]=true;
	  				if(displycount++<MINTEDPACKDISPLAYLIMIT || this.state.showAll){
	  					mintedPackRender.push(
	  						<Pack id={p} key={"pack"+p} {...sortedPacks[p]} PackClick={
	  							()=>{
	  								if(!account){
	  									metaMaskHintFn()
	  								}else{

	  										contracts["Cryptogs"].methods.buyPack(sortedPacks[p].id).send({
	  							        from: account,
	  											value: web3.utils.toWei(sortedPacks[p].price,"ether"),
	  							        gas:GASTOBUYPACKS,
	  							        gasPrice:this.context.GWEI * 1000000000
	  							      },(error,hash)=>{
	  							        console.log("CALLBACK!",error,hash)
													showLoadingScreen(hash,"/address/"+account)
													txhash=hash
	  							      }).on('error',(a,b)=>{
													console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
												}).then((receipt)=>{
	  							        console.log("RESULT:",receipt)
	  											window.location = "/address/"+account
													showLoadingScreen(false)
	  							      }).catch(e=> {
									          console.error('caught error', e);
									      })

	  								}
	  							}
	  						}/>
	  					)
	  				}
					}
  			}
  		}
    }

		if(mintedPackRender.length<=0){
			if(shouldHaveLoaded){
				mintedPackRender = (
					<div style={{padding:80}}>
						<div>All packs have sold out.</div>
						<div style={{marginTop:40}}>Please wait for more to be minted or look to secondary ERC-721 markets.</div>
						<div style={{marginTop:40}}>Thanks!</div>
					</div>
				)
			}else{
				mintedPackRender = (
					<div style={{padding:80}}>
						<div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
					</div>
				)
			}
		}


		return (
			<div>
				<div style={{padding:40}}>
					<MMButton color={"#41d9d7"} onClick={()=>{window.location="https://opensea.io/assets/cryptogs"}}>{"Trade on OpenSea"}</MMButton>
				</div>
				{mintedPackRender}
				{viewButton}
			</div>
		)
	}
});
