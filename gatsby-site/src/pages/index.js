import React from 'react'
import createClass from 'create-react-class';
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types';
import Pack from '../components/Pack.js'

let loadInterval
let initialIntervalLoaded

const GWEI=1

export default createClass({
	displayName: 'IndexPage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
		metaMaskHintFn: PropTypes.func
	},
	getInitialState(){
		return {mintedPacks:[],shouldHaveLoaded:false}
	},
	componentDidMount(){
		this.loadPackData()
		loadInterval = setInterval(this.loadPackData,1003)
	},
	componentWillUnmount(){
		clearInterval(loadInterval)
	},
	async loadPackData(){
		let foundNew = false
		let {contracts,web3} = this.context
		if(contracts && contracts['Cryptogs']) {
			let update = {}

			let mintPackEvents = await contracts['Cryptogs'].getPastEvents("MintPack", {
				fromBlock: contracts['Cryptogs'].blockNumber,
				toBlock: 'latest'
			});

			for(let e in mintPackEvents){
				let id = mintPackEvents[e].returnValues.packId;
				if(!this.state.mintedPacks[id]){
					foundNew=true;
					this.state.mintedPacks[id]={price:web3.utils.fromWei(mintPackEvents[e].returnValues.price,"ether"),tokens:[]};
					this.state.mintedPacks[id].tokens = []
					this.state.mintedPacks[id].images = []
					for(let i=1;i<=10;i++){
						let tokenid = mintPackEvents[e].returnValues["token"+i];
						let token = await contracts['Cryptogs'].methods.getToken(tokenid).call()
						this.state.mintedPacks[id].tokens[i-1] = tokenid
						this.state.mintedPacks[id].images[i-1] = web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
					}
				}
			}

			let buyPackEvents = await contracts['Cryptogs'].getPastEvents("BuyPack", {
				fromBlock: contracts['Cryptogs'].blockNumber,
				toBlock: 'latest'
			});

			for(let e in buyPackEvents){
				let id = buyPackEvents[e].returnValues.packId;
				if(this.state.mintedPacks[id]&&!this.state.mintedPacks[id].bought){
					foundNew=true;
					this.state.mintedPacks[id].bought = buyPackEvents[e].returnValues.sender
				}
			}

			if(foundNew) {
				console.log("UPDATING MINTED PACKS",this.state.mintedPacks)
				this.setState({mintedPacks:this.state.mintedPacks})
			}
			this.setState({shouldHaveLoaded:true})
		}
	},
	render(){
		const { account,contracts,web3,metaMaskHintFn } = this.context
		if(!contracts || !contracts['Cryptogs'] ) return (<div style={{opacity:0.3}}>loading...</div>)

		const { mintedPacks,shouldHaveLoaded } = this.state
		if(!mintedPacks) return (<div style={{opacity:0.3}}>connecting...</div>)

		let mintedPackRender = []
		for(let p in mintedPacks){
			if(!mintedPacks[p].bought){
				mintedPackRender.push(
					<Pack id={p} key={"pack"+p} {...mintedPacks[p]} PackClick={
						(p)=>{
							if(!account){
								metaMaskHintFn()
							}else{
								contracts["Cryptogs"].methods.buyPack(p).send({
						        from: account,
										value: web3.utils.toWei(mintedPacks[p].price,"ether"),
						        gas:1000000,
						        gasPrice:GWEI * 1000000000
						      },(error,hash)=>{
						        console.log("CALLBACK!",error,hash)
						      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
						        console.log("RESULT:",receipt)
										window.location = "/address/"+account
						      })
							}

						}
					}/>
				)
			}
		}

		if(mintedPackRender.length<=0){
			if(shouldHaveLoaded){
				mintedPackRender = (
					<div style={{padding:80}}>
						<div>All packs have sold out.</div>
						<div style={{marginTop:40}}>Please wait for more to be minted or look to secondary ERC721 markets.</div>
						<div style={{marginTop:40}}>Thanks!</div>
					</div>
				)
			}else{
				mintedPackRender = (
					<div style={{padding:80}}>
						<div style={{opacity:0.3}}>Loading...</div>
					</div>
				)
			}

		}

		return (
			<div>
				{mintedPackRender}
			</div>
		)
	}
});
