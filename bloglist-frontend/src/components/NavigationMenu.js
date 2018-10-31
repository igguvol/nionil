import React from 'react'
import {Route, Switch, NavLink, Link, BrowserRouter as Router} from 'react-router-dom'


export default NavigationMenu = (props) => (
  <div style={{backgroundColor:'lightblue', padding:'1em', border:'1px solid black'}}>
    <NavLink activeStyle={props.activeStyle} style={props.defaultStyle} exact to='/'>blogs</NavLink>&nbsp;
    <NavLink activeStyle={props.activeStyle} style={props.defaultStyle} exact to='/create'>users</NavLink>&nbsp;
    {props.user.name} logged in <button onClick={props.logout}>logout</button>

  </div>
)