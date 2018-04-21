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
import Blockies from 'react-blockies'

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
		return {artists:{},artwork:{}}
	},
	componentDidMount(){
		setInterval(this.listArtwork,15000)
		setTimeout(this.listArtwork,500)
		setTimeout(this.listArtwork,1500)
		setTimeout(this.listArtwork,3000)
		setTimeout(this.listArtwork,9000)
	},
	listArtwork(){
		const { api, account } = this.context
		try{
			let url = api.host+'/artwork'
			console.log("Looking for artwork @ "+url)
			axios.get(url)
			.then((response)=>{
				console.log("Artists:",response.data.files)
				this.setState({artists:response.data.files})
				for(let a in response.data.files){
					console.log("GET ART FOR ARTIST ",response.data.files[a])
					this.getArtwork(response.data.files[a])
				}
			})
		} catch(e) {
			console.log(e)
		}
	},
	getArtwork(artist){
		const { api, account } = this.context
		try{
			let url = api.host+'/artwork/'+artist
			console.log("Looking for artwork @ "+url)
			axios.get(url)
			.then((response)=>{
				console.log("Files",response.data.files.sort().reverse())
				let update = {}
				update[artist]=response.data.files
				this.setState(update)
			})
		} catch(e) {
			console.log(e)
		}
	},

	render(){
		let {web3,network,account,api} = this.context


		let art = []
		for(let a in this.state.artists) {
			let artist = this.state.artists[a]
			let artwork = this.state[artist]
			if(artwork&&artwork.length>0){

				let artworkDisplay = []
				for(let a in artwork){
					artworkDisplay.push(
						<div className="container">
							<div className="row align-items-center">
								<div className="col-md-1">
									<Blockies
										seed={artist.toLowerCase()}
										scale={6}
									/>
								</div>
								<div className="col-md-6">
									<Cryptog key={"cryptog"+artwork[a]} scale={1} id={artwork[a]} absoluteImage={api.host+"/"+artist+"/"+artwork[a]} zIndex={1}/>
								</div>
								<div className="col-md-5">

								</div>
							</div>
						</div>
					)
				}

				art.push(
					<div>
						{artworkDisplay}
					</div>
				)
			}
		}


		return (
			<div>
				<section className="section background-primary pt-5 pb-5">
					<div className="container">
						<div className="jumbotron jumbotron--white p-5">
						<hr className="my-5" />
						<div className="row align-items-center">
							<div className="col-md-12">
								Art
							</div>
						</div>
						<hr className="my-5" />
						 {art}
						</div>
					</div>
				</section>
			</div>
		)
	}
});
