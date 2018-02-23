import React from 'react'
import { Route, Redirect } from "react-router-dom"
import renderMergedProps from  '../modules/renderMergedProps.js'
export default ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest);
    }}/>
  );
}
