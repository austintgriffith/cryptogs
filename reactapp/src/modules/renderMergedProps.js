import React from 'react'
export default function (component, ...rest){
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}
