import React, { Component } from 'react';
import createClass from 'create-react-class';

export default createClass({
  render(){
    return (
      <div className={"messageBorder"} style={{zIndex:1000,position:'fixed',bottom:-5,right:10}}>
        <div>
          <a target="_blank" href={"https://discord.gg/RhqxSj7"}>
          <img
            style={{cursor:"pointer"}}
            src="/discord.png" style={{maxWidth:20}}
          />
          </a>
        </div>
        <div>
          <a target="_blank" href={"https://join.slack.com/t/cryptopogs/shared_invite/enQtMzIyNTI4Njc5MDMwLTkyZTczMTgwYzU2YTZhNmFiMDg5YTFkOGQzYmNlMGZhYmRmNmQ4ZTM2MGRkMjEyYmRmYWZiNzIzMDVhNDA3NDk"}>
          <img
            style={{cursor:"pointer"}}
            src="/slack.png" style={{maxWidth:20}}
          />
          </a>
        </div>
      </div>
    )
  }
})
