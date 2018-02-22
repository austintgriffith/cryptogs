import React from 'react'
import createClass from 'create-react-class'
import Link from 'gatsby-link'
import { withPrefix} from 'gatsby-link'
import PropTypes from 'prop-types'
import Cryptog from '../components/Cryptog.js'
import StackGrid from 'react-stack-grid'

const GWEI = 50

let syncInterval
export default createClass({
	displayName: 'CreatePage',
	contextTypes: {
		web3: PropTypes.object,
		contracts: PropTypes.array,
		account: PropTypes.string,
		myTokens: PropTypes.array,
	},
	getInitialState(){
		return {
			selectedTokens:[]
		}
	},
	tokenClick(id){
		console.log("CLICK",id)
		if(this.state.selectedTokens[id]){
			this.state.selectedTokens[id]=false;
		}else{
			let count = 0;
			for(let id in this.state.selectedTokens){
				if(this.state.selectedTokens[id]){count++}
			}
			if(count<5) this.state.selectedTokens[id]=true;
		}
		this.setState({selectedTokens:this.state.selectedTokens})
	},
	go(){
		const { account,contracts } = this.context
		let finalArray = []
		for(let id in this.state.selectedTokens){
			if(this.state.selectedTokens[id]){
				finalArray.push(id)
			}
		}

		console.log("GO",this.state.selectedTokens)
		//submitStack(address _slammerTime, uint256 _id,uint256 _id2,uint256 _id3,uint256 _id4,uint256 _id5, bool _public)
		contracts["Cryptogs"].methods.submitStack(contracts["SlammerTime"]._address,finalArray[0],finalArray[1],finalArray[2],finalArray[3],finalArray[4],true).send({
        from: account,
        gas:350000,
        gasPrice:GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
      }).on('error',(a,b)=>{console.log("ERROR",a,b)}).then((receipt)=>{
        console.log("RESULT:",receipt)
      })
	},
	render(){
		const { myTokens } = this.context
		if(!myTokens) return (<div style={{opacity:0.3}}>loading...</div>)
		let images = []
		let tokenDisplay = myTokens.map((token)=>{
			let style={}
			if(this.state.selectedTokens[token.id]){
				style.opacity=0.3
			}
			images[token.id]=token.image
			return <div style={style} onClick={this.tokenClick.bind(this,token.id)} key={"cryptog"+token.id} id={token.id} ><Cryptog image={token.image}/></div>
		})
		let selectedTokens = []
		for(let id in this.state.selectedTokens){
			if(this.state.selectedTokens[id]){
				selectedTokens.push( <div onClick={this.tokenClick.bind(this,id,true)} key={"selectedcryptog"+id} id={"selected"+id} ><Cryptog image={images[id]}/></div> )
			}
		}
		let gobutton = ""
		if(selectedTokens.length<=0){
			selectedTokens.push(<div key={"holder"} style={{height:113}}></div>)
		}else if(selectedTokens.length==5){
			//take out the margin right but figure out how to get zinex right
			//normally I'm unable to click it!!! POS
			gobutton = (
				<button style={{cursor:'pointer',marginRight:-50}} onClick={this.go}>GO</button>
			)
		}

		return (
      <div>
				<div style={{float:'right'}}>
					{gobutton}
				</div>
				<StackGrid
					style={{marginTop:50}}
					columnWidth={110}
				>
					{selectedTokens}
				</StackGrid>
				Select 5 tokens to create a challenge:
				<div style={{float:'right'}}>count ({tokenDisplay.length})</div>
				this needs to be in grid format:
				<StackGrid
					style={{marginTop:50}}
	        columnWidth={110}
	      >
	        {tokenDisplay}
	      </StackGrid>

      </div>
    )
	}
});
//
