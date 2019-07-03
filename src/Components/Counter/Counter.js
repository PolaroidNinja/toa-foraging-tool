import React, {Component} from 'react';
import './Counter.css';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import '../../../node_modules/materialize-css/dist/js/materialize.min.js';
import { Button } from 'react-materialize';

export class Counter extends Component {

  render() {
    return <><Button floating icon="remove" className="red" onClick={() => {this.props.decreaseValue()}}/>
    <span className="counter-large">{this.props.value}</span>
    <Button floating icon="add" className="green" onClick={() => {this.props.increaseValue()}}/></>
  };
}
