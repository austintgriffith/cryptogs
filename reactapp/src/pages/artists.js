import React from 'react'
import createClass from 'create-react-class';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types'
import Spinner from '../components/Spinner.js'
import Cryptog from '../components/Cryptog.js'
import Dropzone from 'react-dropzone'
import EventParser from '../modules/eventParser.js';
import LiveParser from '../modules/liveParser.js';
import FormData from 'form-data'
import MMButton from '../components/MMButton.js'
import axios from 'axios'

export default createClass({
	displayName: 'ArtistsPage',
	contextTypes: {
		web3: PropTypes.object,
		network: PropTypes.number,
		api: PropTypes.object,
		account: PropTypes.string,
		contracts: PropTypes.array,
		GWEI: PropTypes.number,
		showLoadingScreen: PropTypes.func,
		blockNumber: PropTypes.number,
	},
	getInitialState(){
		return {uploadMessage:"",artistName:"",artistEmail:"",files:[],priceToMintStack:40000000000000000,priceToMint:10000000000000000,loadedEvents:false,mints:{}}
	},
	componentDidMount(){
		setInterval(this.getArtwork,5000)
		setTimeout(this.getArtwork,500)
		setTimeout(this.getArtwork,1500)
		setInterval(this.getPrices,30000)
		setTimeout(this.getPrices,500)
		setTimeout(this.getPrices,1500)
		setTimeout(this.getPrices,300)
		setTimeout(this.getPrices,6000)
		setTimeout(this.getPrices,12000)
		setTimeout(this.getPrices,19000)
	},
	async getPrices(){
		const { web3,contracts,blockNumber,account,api } = this.context
		console.log("GETPRICES",contracts)
		if(contracts && contracts['Artists'] && contracts['Artists']._address && account && blockNumber && web3){
			let priceToMint = await contracts["Artists"].methods.priceToMint().call()
			let priceToMintStack = await contracts["Artists"].methods.priceToMintStack().call()
			this.setState({priceToMint:priceToMint,priceToMintStack:priceToMintStack})

			if(!this.state.loadedEvents){
				this.setState({loadedEvents:true},()=>{

					try{
						let url = api.host+'/artist/'+account
						console.log("Looking for artist as "+account)
						axios.get(url)
						.then((response)=>{
							if(response.data){
								console.log("ARTIST:", response.data)

								this.setState({artistName: response.data.artist,artistEmail: response.data.email})
							}

						})
					} catch(e) {
						console.log(e)
					}

					let filter = {
						sender:account
					}

					let updateMint = async (update)=>{
						update.image = web3.utils.toAscii(update.image).replace(/[^a-zA-Z\d\s.]+/g,"")
						update.mint = true
						update.mintStack = false
						if(!this.state.mints || !this.state.mints[update.time]){
							let updateState = this.state.mints
							if(!updateState) updateState = {}
							updateState[update.time] = update
							this.setState({mints:updateState})
							console.log("UPDATE MINT",update)
						}
					}
					EventParser(contracts["Artists"],"Mint",contracts["Cryptogs"].blockNumber,blockNumber,updateMint,filter);
					setInterval(()=>{
						LiveParser(contracts["Artists"],"Mint",blockNumber,updateMint,filter)
					},737)


					let updateMintStack = async (update)=>{
						update.image = web3.utils.toAscii(update.image).replace(/[^a-zA-Z\d\s.]+/g,"")
						update.mintStack = true
						update.mint = false
						if(!this.state.mints || !this.state.mints[update.time]){
							let updateState = this.state.mints
							if(!updateState) updateState = {}
							updateState[update.time] = update
							this.setState({mints:updateState})
							console.log("UPDATE MINT STACK",update)
						}
					}
					EventParser(contracts["Artists"],"MintStack",contracts["Cryptogs"].blockNumber,blockNumber,updateMintStack,filter);
					setInterval(()=>{
						LiveParser(contracts["Artists"],"MintStack",blockNumber,updateMintStack,filter)
					},739)

				})
			}
		}
	},
	getArtwork(){
		const { api, account } = this.context
		try{
			let url = api.host+'/artwork/'+account
			console.log("Looking for artwork @ "+url)
			axios.get(url)
			.then((response)=>{
				console.log("Files",response.data.files.sort().reverse())
				this.setState({files:response.data.files})
			})
		} catch(e) {
			console.log(e)
		}
	},
	onDrop(acceptedFiles){
		const { api, account } = this.context
		var form = new FormData();
		acceptedFiles.forEach(file => {
			console.log("uploading",file)
				form.append("File", file);
		});
		form.append('account',account);
		let url = api.host+'/upload'
		console.log(url,form)
		console.log("POSTING UPLOAD...")
		axios.post(url, form).then((response)=>{
			console.log("BACK FROM UPLOAD",response);
			if(!response.data.upload){
				this.setState({uploadMessage:response.data.message})
				setTimeout(()=>{
					this.setState({uploadMessage:""})
				},5000)
			}
		})
		setTimeout(this.getArtwork,1000)
		setTimeout(this.getArtwork,2500)
	},
	delete(file){
		const { api, account } = this.context
		let url = api.host+'/delete'
		console.log("DELETE",file,url,account)
		console.log(url)
		axios.post(url, {
			account:account,
			file:file
		})
		.then((response)=>{
			console.log(response)
			console.log("DELETE",response.data);
			setTimeout(this.getArtwork,200)
			setTimeout(this.getArtwork,1500)
		})
		.catch(function (error) {
			console.log(error);
		});
	},
	mintStack(file){
		const { api, account, contracts, web3, showLoadingScreen } = this.context
		console.log("MINT",file,account,contracts)
		contracts["Artists"].methods.mintStack(web3.utils.fromAscii(file)).send({
			from: account,
			value: this.state.priceToMintStack,
			gas:30000,
			gasPrice:this.context.GWEI * 1000000000
		},(error,hash)=>{
			console.log("CALLBACK!",error,hash)
			showLoadingScreen(hash)
			if(api&&api.host){
				let url = api.host+'/mint'
				console.log("MINT",file,url,account)
				console.log(url)
				axios.post(url, {
					account:account,
					file:file,
					hash:hash,
					stack:true
				})
				.then((response)=>{
					console.log(response)
					console.log("MINT",response.data);
				})
				.catch(function (error) {
					console.log(error);
				});
			}

		}).on('error',(a,b)=>{
			console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
		}).then((receipt)=>{
			console.log("RESULT:",receipt)
			showLoadingScreen(false)
		}).catch(e=> {
				console.error('caught error', e);
		})
	},
	mint(file){
		const { api, account, contracts, web3, showLoadingScreen } = this.context
		console.log("MINT",file,account,contracts)
		contracts["Artists"].methods.mint(web3.utils.fromAscii(file)).send({
			from: account,
			value: this.state.priceToMint,
			gas:30000,
			gasPrice:this.context.GWEI * 1000000000
		},(error,hash)=>{
			console.log("CALLBACK!",error,hash)
			showLoadingScreen(hash)
			if(api&&api.host){
				let url = api.host+'/mint'
				console.log("MINT",file,url,account)
				console.log(url)
				axios.post(url, {
					account:account,
					file:file,
					hash:hash,
					stack:false
				})
				.then((response)=>{
					console.log(response)
					console.log("MINT",response.data);
				})
				.catch(function (error) {
					console.log(error);
				});
			}
		}).on('error',(a,b)=>{
			console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")
		}).then((receipt)=>{
			console.log("RESULT:",receipt)
			showLoadingScreen(false)
		}).catch(e=> {
				console.error('caught error', e);
		})
	},
	artistNameChangeKeyPress(e){
		if (e.key === 'Enter') {
      console.log('do validate');
			this.saveArtist()
    }
	},
	artistNameChange(e){
		this.setState({artistName:e.target.value.replace(/[^a-zA-Z0-9 ]+/g,"")})
	},
	artistEmailChange(e){
		this.setState({artistEmail:e.target.value.replace(/[^a-zA-Z0-9@_ .-]+/g,"")})
	},
	saveArtist(){
		console.log("SAVE ARTIST")
		const { api,account } = this.context
		let url = api.host+'/artist'
		axios.post(url, {
			account:account,
			email:this.state.artistEmail,
			name:this.state.artistName
		})
		.then((response)=>{
			console.log(response)
			console.log("ARTIST",response.data);
		})
		.catch(function (error) {
			console.log(error);
		});
	},
	render(){
		let {web3,network,account,api} = this.context

		if(!account){
			return (
				<div style={{padding:100,width:"100%",textAlign:"center"}}>
					Hello, Artist, please unlock metamask. :)
				</div>
			)
		}

		let files = this.state.files.map((file)=>{

			let theseUpdates = []
			for(let m in this.state.mints){
				if(this.state.mints[m].image==file){
					theseUpdates.push(this.state.mints[m])
				}
			}
			let updateText = theseUpdates.map((update)=>{
				let timeAgo = Date.now()/1000-update.time
				let timeAgoText = "s"

				//only show minting from within the last few days
				if(timeAgo<86400*3){
					if(timeAgo>86400){
						timeAgo/=86400
						timeAgoText = " days"
					}else if(timeAgo>3600){
						timeAgo/=3600
						timeAgoText = " hr"
					}else if(timeAgo>60){
						timeAgo/=60
						timeAgoText = " m"
					}
					timeAgo= Math.round(timeAgo*10)/10
					let type = "unknown";
					if(update.mintStack===true){
						type = "minted stack"
					}else if(update.mint===true){
						type = "minted"
					}

					return (
						<div key={"update"+update.time} style={{opacity:0.7,marginLeft:"30%"}}>
							{type+": "+timeAgo+timeAgoText+" ago"}
						</div>
					)
				}


			})

			let updateExtra = ""
			if(updateText.length>0){
				updateExtra = (
					<div style={{opacity:0.5,marginLeft:"35%",fontSize:12}}>
					 {"* minting can take up to 24hrs before your custom togs will show up in "}
					 <a href={'/address/'+account}>your inventory</a>
					</div>
				)
			}



			return (
				<div key={"cryptogs"+file}>
					<div className="row align-items-center">
						<div className="col-md-3">
						<Spinner  guts={
							(spinning)=>{
								return (
									<Cryptog key={"cryptog"+file} scale={1} id={file} slowrolling={spinning} absoluteImage={api.host+"/"+account+"/"+file} zIndex={1}/>
								)
							}
						}/>
						</div>
						<div className="col-md-3">
							<div className="row align-items-center">
								<div className="col-md-5">
									<MMButton color={"#6ac360"} onClick={this.mintStack.bind(this,file)}>{"Mint Stack"}</MMButton>
								</div>
								<div className="col-md-7" style={{textAlign:"left",opacity:0.5}}>
									{"Ξ"+this.state.priceToMintStack/1000000000000000000}
								</div>
							</div>

						</div>
						<div className="col-md-3">

							<div className="row align-items-center">
								<div className="col-md-5">
									<MMButton color={"#6081c3"} onClick={this.mint.bind(this,file)}>{"Mint"}</MMButton>
								</div>
								<div className="col-md-7" style={{textAlign:"left",opacity:0.5}}>
									{"Ξ"+this.state.priceToMint/1000000000000000000}
								</div>
							</div>

						</div>
						<div className="col-md-3">
						<div style={{padding:40}}>
							<MMButton color={"#fe2311"} onClick={this.delete.bind(this,file)}>{"Delete"}</MMButton>
						</div>
						</div>
					</div>
					{updateText}
					{updateExtra}
					<hr className="my-5" />
				</div>
			)
		})

		let uploadMessageBox = ""
		if(this.state.uploadMessage){
			uploadMessageBox = (
				<div style={{backgroundColor:"#FFEEEE",padding:20,textAlign:"center",margin:10}}>
					{this.state.uploadMessage}
				</div>
			)
		}

		return (
			<div>
				<section className="section background-primary pt-5 pb-5">
					<div className="container">
						<div className="jumbotron jumbotron--white p-5">


						<div className="row align-items-center">
							<div className="col-md-12">
								<div className="dropzone" style={{width:"100%"}}>
									<Dropzone onDrop={this.onDrop}  style={{"cursor":"pointer","width" : "100%", "height" : "120", textAlign:"center",padding:40, opacity:0.7,"border" : "3px dashed #dddddd"}}>
										<p>Drag and Drop or Click to Select</p>
									</Dropzone>
									{uploadMessageBox}
								</div>

							</div>

						</div>
						<div style={{textAlign:"center",width:"100%",opacity:0.3}}>
							{"original artwork only - 300x300 - shoot for less than 30kB"}
						</div>

						<hr className="my-5" />

						<div className="row align-items-center">
							<div className="col-md-6">
								<div style={{marginLeft:"10%"}}>
									Artist Name: <input style={{}} value={this.state.artistName} onChange={this.artistNameChange} onBlur={this.saveArtist} onKeyPress={this.artistNameChangeKeyPress}/>
								</div>
							</div>
							<div className="col-md-6">
								<div style={{marginLeft:"10%"}}>
									Artist Email: <input style={{width:250}} value={this.state.artistEmail} onChange={this.artistEmailChange} onBlur={this.saveArtist} onKeyPress={this.artistNameChangeKeyPress}/>
								</div>
							</div>
						</div>

						<hr className="my-5" />


						 {files}
						</div>
					</div>
				</section>
			</div>
		)
	}
});
