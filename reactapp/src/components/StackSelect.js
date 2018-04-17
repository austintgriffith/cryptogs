import React, { Component } from 'react';
import Cryptog from '../components/Cryptog.js'
import StackGrid from 'react-stack-grid'
import MMButton from '../components/MMButton.js'
import PogAnimation from '../components/PogAnimation.js'
import SimpleStack from '../components/SimpleStack.js'

class StackSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTokens:{}
    }
  }
  tokenClick(id){
		if(this.state.selectedTokens[id]){
			this.state.selectedTokens[id]=false;
		}else{
			let count = 0;
			for(let id in this.state.selectedTokens){
				if(this.state.selectedTokens[id]){count++}
			}
			if(count<5) this.state.selectedTokens[id]=true;
      if(count>=4){
        window.scrollTo(0,0);
      }
		}
		this.setState({selectedTokens:this.state.selectedTokens})
	}
  render(){
    const { myTokens } = this.props
    if(!myTokens) return (<div style={{opacity:0.3}}><PogAnimation loader={true} image={"unicorn.png"}/></div>)

    let tokenCount = 0

    let images = []
    let tokenDisplay = myTokens.map((token)=>{
      let style={cursor:"pointer"}
      if(this.state.selectedTokens[token.id]){
        style.opacity=0.3
      }
      images[token.id]=token.image
      tokenCount++
      return (
        <div style={style} onClick={this.tokenClick.bind(this,token.id)} key={"cryptog"+token.id} id={token.id} >
          <Cryptog scale={0.7} image={token.image}/>
        </div>
      )
    })
    let selectedTokens = []
    for(let id in this.state.selectedTokens){
      if(this.state.selectedTokens[id]){
        selectedTokens.push(
          <div style={{cursor:"pointer"}} onClick={this.tokenClick.bind(this,id,true)} key={"selectedcryptog"+id} id={"selected"+id} >
            <Cryptog scale={0.7} image={images[id]}/>
          </div>
        )
      }
    }
    let gobutton = ""


    if(selectedTokens.length<=0){
      selectedTokens.push(<div key={"holder"} style={{height:113}}></div>)
    }else if(selectedTokens.length==5){
      //take out the margin right but figure out how to get zinex right
      //normally I'm unable to click it!!! POS
      gobutton = (
        <div style={{marginTop:20,marginLeft:40}}>
          <MMButton color={"#6ac360"} onClick={this.props.goFn.bind(this,this.state.selectedTokens)}>submit</MMButton>
        </div>
      )
    }

    let extraTokenDisplay = ""
    if(tokenDisplay.length<=0){
      extraTokenDisplay = (
        <div className={"centercontainer"} style={{width:"100%"}}>
          <div style={{padding:40}}>
            <MMButton color={"#6ac360"} onClick={()=>{window.location="/buy"}}>Buy Togs</MMButton>
          </div>
        </div>
      )
    }

    return (
      <div>
        <SimpleStack scale={0.9} spacing={80} height={150} tokens={this.state.selectedTokens} images={images} click={this.tokenClick.bind(this)}/>
        <div style={{width:"100%"}}>
          <div style={{position:"relative",display:"table",margin:"0 auto"}}>
            {gobutton}
          </div>
        </div>
        <div className={"actionable"}>
          {this.props.message}
        </div>
        <div style={{float:'right',opacity:0.3}}>({tokenDisplay.length})</div>
        <StackGrid columnWidth={70}>
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
