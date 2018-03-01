import React, { Component } from 'react';
import Cryptog from '../components/Cryptog.js'
import StackGrid from 'react-stack-grid'
import MMButton from '../components/MMButton.js'

class StackSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTokens:{}
    }
  }
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
	}
  render(){
    const { myTokens } = this.props
    if(!myTokens) return (<div style={{opacity:0.3}}>loading...</div>)

    let tokenCount = 0

    let images = []
    let tokenDisplay = myTokens.map((token)=>{
      let style={cursor:"pointer"}
      if(this.state.selectedTokens[token.id]){
        style.opacity=0.3
      }
      images[token.id]=token.image
      tokenCount++
      return <div style={style} onClick={this.tokenClick.bind(this,token.id)} key={"cryptog"+token.id} id={token.id} ><Cryptog scale={0.75} image={token.image}/></div>
    })
    let selectedTokens = []
    for(let id in this.state.selectedTokens){
      if(this.state.selectedTokens[id]){
        selectedTokens.push( <div style={{cursor:"pointer"}} onClick={this.tokenClick.bind(this,id,true)} key={"selectedcryptog"+id} id={"selected"+id} ><Cryptog scale={0.75} image={images[id]}/></div> )
      }
    }
    let gobutton = ""


    if(selectedTokens.length<=0){
      selectedTokens.push(<div key={"holder"} style={{height:113}}></div>)
    }else if(selectedTokens.length==5){
      //take out the margin right but figure out how to get zinex right
      //normally I'm unable to click it!!! POS
      gobutton = (
        <div style={{marginTop:60,marginLeft:40}}>
          <MMButton color={"#6ac360"} onClick={this.props.goFn.bind(this,this.state.selectedTokens)}>submit</MMButton>
        </div>
      )
    }

    let extraTokenDisplay = ""
    if(tokenDisplay.length<=0){
      extraTokenDisplay = (
        <div className={"centercontainer"} style={{width:"100%"}}>
          <div style={{padding:40}}>
            <MMButton color={"#6ac360"} onClick={()=>{window.location="/buy"}}>Buy Pogs</MMButton>
          </div>
        </div>
      )
    }

    return (
      <div>
        <StackGrid style={{marginTop:50}} columnWidth={105}>
          {selectedTokens}
          <div key="gobutton">
            {gobutton}
          </div>
        </StackGrid>
        <div className={"actionable"}>
          {this.props.message}
        </div>
        <div style={{float:'right',opacity:0.3}}>({tokenDisplay.length})</div>
        <StackGrid style={{marginTop:50}} columnWidth={105}>
          {tokenDisplay}
        </StackGrid>
        {extraTokenDisplay}
      </div>
    )
  }
}
export default StackSelect;

/*

const JoinStack = ({ match: { params } }) => (
  <div>
    {params.stack}
  </div>
)*/
