import React, { Component } from 'react';
import './App.css';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import '../../../node_modules/materialize-css/dist/js/materialize.min.js';
import { Navbar, NavItem, Row, TextInput, Card, CardTitle, Col, Button } from 'react-materialize';
import {Counter } from '../Counter/Counter.js';

class App extends Component {

  constructor() {
    super();

    this.state = {
      characters: [
        {name: "Dinithir", survival: "1", wisdom: 1, role: "None"},
        {name: "Owain", survival: "6", wisdom: 4, role: "None"}
      ],
      total: {
        food: 10,
        water: 14,
        repellant: 78
      }
    }
  }

  runOvernight() {
    let newState = Object.assign({}, this.state);
    newState.total.food -= this.state.characters.length;
    newState.total.water -= this.state.characters.length;
    this.setState(newState);
  }

  incrementTotal(type) {
    return () => {
      let newState = Object.assign({}, this.state);
      newState.total[type] = this.state.total[type] + 1
      this.setState(newState);
    }
  }

  decreaseTotal(type) {
    return () => {
      let newState = Object.assign({}, this.state);
      newState.total[type] = this.state.total[type] - 1
      this.setState(newState);
    }
  }

  updateCharacter(index, stat, value) {
    let stateUpdate = Object.assign({}, this.state.characters);
    stateUpdate[index][stat] = value.toString();
    this.setState(stateUpdate);
  }

  render() {
    return <div className="App">
      <Navbar brand={<a href="/">Tomb of Annahilation</a>} alignLinks="right">
        <NavItem>
          Getting started
        </NavItem>
        <NavItem href="components.html">
          Components
        </NavItem>
      </Navbar>
      <header>
        <h1>Resource Tracker</h1>
      </header>
      <Row>
        <Col m={4} s={12}>
          <Card horizontal header={<CardTitle image="http://dndspeak.com/wp-content/uploads/2018/03/wallpaper-2661116.jpg"/>} title="Food Rations">
            <Counter value={this.state.total.food} decreaseValue={this.decreaseTotal('food')} increaseValue={this.incrementTotal('food')}/>
          </Card>
        </Col>
        <Col m={4} s={12}>
          <Card horizontal header={<CardTitle image="https://66.media.tumblr.com/f8103e9361b5551aaa13eee0f83d56da/tumblr_p0w2cpR1qc1qg88oxo1_1280.jpg"/>} title="Water Rations">
            <Counter value={this.state.total.water} decreaseValue={this.decreaseTotal('water')} increaseValue={this.incrementTotal('water')}/>
          </Card>
        </Col>
        <Col m={4} s={12}>
          <Card horizontal header={<CardTitle image="https://dungeonsmaster.com/wp-content/uploads/2013/07/potions.jpg"/>} title="Insect Repellant">
            <Counter value={this.state.total.repellant} decreaseValue={this.decreaseTotal('repellant')} increaseValue={this.incrementTotal('repellant')}/>
          </Card>
        </Col>
      </Row>
      <hr/>
      <Row>
        <h3>Party</h3>
        {this.state.characters.map((character, index) => {
          return <Col m={4} s={12}>
            <Card title={character.name}>
              <Row>
                <TextInput label="Survival" value={character.survival} onChange={(e) => {console.log(this.updateCharacter(index, 'survival', e.target.value));}}/>
                <TextInput label="Wisdom Mod" value={character.wisdom} onChange={(e) => {console.log(this.updateCharacter(index, 'wisdom', e.target.value));}}/>
              </Row>
            </Card>
          </Col>
        })}
      </Row>
      <Button
          floating
          fab={{direction: 'left'}}
          icon="menu"
          className="red"
          large
        >
        <Button floating icon="exposure_plus_1" className="green" />
        <Button floating icon="exposure_neg_1" className="red" />
        <Button floating icon="brightness_medium" onClick={() => {this.runOvernight()}} className="green" />
        <Button floating icon="group_add" className="blue" />
      </Button>
    </div>
  };
}

export default App;
