import React, { Component } from 'react';
import SimpleStack from '../components/SimpleStack.js'
import StackSelect from '../components/StackSelect.js'
import MMButton from '../components/MMButton.js'
import PogAnimation from '../components/PogAnimation'
import axios from 'axios'

let waitInterval
let txhash

class JoinStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stack:this.props.match.params.stack
    }
  }
  componentDidMount(){
    setTimeout(()=>{
      this.loadStackData()
    },1500)
  }
  async loadStackData(){
    const { account } = this.props.context
    let stack
    if(this.props.api&&this.props.api.host){

      setInterval(()=>{
        try{
          axios.post(this.props.api.host+'/joining', {
            account: account,
            commit: this.state.stack,
          })
          .then(function (response) {
            console.log(response)
            console.log("JOINING",response.data);
          })
          .catch(function (error) {
            console.log(error);
          });
        } catch(e) {
          console.log(e)
        }
      },3000)


      try{
        console.log("Loading commit data from api...")
        axios.get(this.props.api.host+"/commit/"+this.state.stack)
        .then((response)=>{
          console.log("COMMIT BACK FROM API",response);

          console.log("Checking for counter stack:",response.data._counterStack)
          if(response.data._counterStack){
            setTimeout(()=>{
              window.location = "/play/"+this.state.stack
            },5000)
          }

          if(!response.data){
            setTimeout(()=>{
              window.location = "/stacks"
            },1000)
          }else{
            console.log("SETSTATE",response.data)
            this.setState(response.data)
          }


        })
      } catch(e) {
        console.log(e)
      }
    }else{
      let stackData = await this.props.context.contracts['Cryptogs'].methods.getStack(this.state.stack).call()
      for(let t=1;t<=5;t++){

        let token = await this.props.context.contracts['Cryptogs'].methods.getToken(stackData["token"+t]).call()
        stackData["token"+t+"Image"] = this.props.context.web3.utils.toAscii(token.image).replace(/[^a-zA-Z\d\s.]+/g,"")
      }
      console.log("stackData",stackData)
      this.setState({stackData:stackData})
    }


  }
  joinStack(tokens){
		const { account,contracts,showLoadingScreen } = this.props.context
    const { stack } = this.state

		let finalArray = []
		for(let id in tokens){
			if(tokens[id]){
				finalArray.push(id)
			}
		}


		console.log("submitCounterStack as "+account,finalArray)

    if(this.props.api && this.props.api.version){
      try{
        axios.post(this.props.api.host+'/counter', {
  				account: account,
          commit: this.state.stack,
  		    finalArray: finalArray
  		  })
  		  .then(function (response) {
  				console.log(response)
  		    console.log("APIDATA",response.data);
  				if(response && response.data && response.data.commit) window.location = "/play/"+response.data.commit
  		  })
  		  .catch(function (error) {
  		    console.log(error);
  		  });
      } catch(e) {
        console.log(e)
      }
    }else{
  		//submitCounterStack(address _slammerTime, bytes32 _stack, uint256 _id, uint256 _id2, uint256 _id3, uint256 _id4, uint256 _id5)
  		contracts["Cryptogs"].methods.submitCounterStack(stack,finalArray[0],finalArray[1],finalArray[2],finalArray[3],finalArray[4]).send({
        from: account,
        gas:350000,
        gasPrice:this.props.GWEI * 1000000000
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        showLoadingScreen(hash,"/play/"+stack)
        txhash=hash
      }).on('error',(a,b)=>{

				console.log("ERROR"," Your transation is not yet mined into the blockchain. Wait or try again with a higher gas price. It could still get mined!")

      }).then((receipt)=>{
        console.log("RESULT:",receipt)
        window.location = "/play/"+stack
        showLoadingScreen(false)
      }).catch(e=> {
          console.error('caught error', e);
      })
    }
	}

  render(){
    if(!this.state.stackData){
      return (
        <div style={{opacity:0.3}}><PogAnimation loader={true} image={'unicorn.png'} /></div>
      )
    }
    return (
      <div>
        <SimpleStack showBlockie={true} count={5} scale={0.8} padding={200} spacing={70} height={180} {...this.state.stackData}/>
        <StackSelect message={"Select five of your pogs to risk:"} myTokens={this.props.context.myTokens} goFn={this.joinStack.bind(this)} />
      </div>
    )
  }
}
export default JoinStack;

/*

const JoinStack = ({ match: { params } }) => (
  <div>
    {params.stack}
  </div>
)*/
