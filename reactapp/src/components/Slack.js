import React, { Component } from 'react';
import createClass from 'create-react-class';

export default createClass({
  render(){
    return (
      <div className={"messageLittle"} style={{zIndex:1000,position:'fixed',bottom:-30,right:10}}>
        <a target="_blank" href={"https://join.slack.com/t/cryptopogs/shared_invite/enQtMzIyNTI4Njc5MDMwLTkyZTczMTgwYzU2YTZhNmFiMDg5YTFkOGQzYmNlMGZhYmRmNmQ4ZTM2MGRkMjEyYmRmYWZiNzIzMDVhNDA3NDk"}>
        <img
          style={{cursor:"pointer"}}
          src="/slack.png" style={{maxWidth:20}}
        />
        </a>
      </div>
    )
  }
})
