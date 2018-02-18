import React, { Component } from 'react';
import Cryptog from './Cryptog.js'
import Blockies from 'react-blockies'

class Stack extends Component {

  render(){
    let {SubmitStacks,sender,token1,token2,token3,token4,token5} = this.props

    console.log("token1",token1)

    for(let stack in SubmitStacks){
      console.log(stack)
    }

    let cryptogSize = 60

    return (
      <div style={{width:'100%',margin: "0 auto",background:"#ffffff",border:'1px solid #BBBBBB',padding:10,textAlign:'left'}}>
        <div className="container">
          <div className="row">
            <div className="col-xs-2 col-md-2">
                <Blockies
                  seed={sender}
                  scale={8}
                />
            </div>
            <div className="col-xs-2 col-md-2">
              <Cryptog size={cryptogSize}/>
            </div>
            <div className="col-xs-2 col-md-2">
              <Cryptog size={cryptogSize}/>
            </div>
            <div className="col-xs-2 col-md-2">
              <Cryptog size={cryptogSize}/>
            </div>
            <div className="col-xs-2 col-md-2">
              <Cryptog size={cryptogSize}/>
            </div>
            <div className="col-xs-2 col-md-2">
              <Cryptog size={cryptogSize}/>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default Stack;
