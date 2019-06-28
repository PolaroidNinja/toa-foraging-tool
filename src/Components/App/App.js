import React, { Component } from 'react';
import './App.css';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import M from '../../../node_modules/materialize-css/dist/js/materialize.min.js';
import { Navbar, NavItem, Row, TextInput, Card, CardTitle, Col, Button, Select, Badge } from 'react-materialize';
import {Counter} from '../Counter';
import {Character} from '../Character';
import { DiceRoller } from 'rpg-dice-roller';

const WATER_BARREL = "water_barrel"
const NO_RAIN = 0;
const LIGHT_RAIN = 1;
const NORMAL_RAIN = 2;
const HEAVY_RAIN = 3;
const TROPICAL_STORM = 4;
const RIVER = 1;
const roller = new DiceRoller();

class App extends Component {

  constructor() {
    super();

    this.state = {
      terrain: {
        current: RIVER,
        dc: 10
      },
      weather: {
        rain: NORMAL_RAIN,
        heat: 1
      },
      characters: [
        {name: "Dinithir", survival: "1", wisdom: 1, role: "idle"},
        {name: "Owain", survival: "6", wisdom: 4, role: "food"},
        {name: "Shela", survival: "0", wisdom: 0, role: "idle"}
      ],
      collectors: [
        {type: WATER_BARREL, max: 8, current: 3, rate: 1},
        // {type: WATER_BARREL, max: 8, current: 3, rate: 1}
      ],
      container: [
        {type: 'water'}
      ],
      total: {
        food: 10,
        water: 0,
        repellant: 78
      }
    }

    this.updateWaterTotalFromContainers();
  }

  determineWeather() {
    roller.roll('1d20');
    let weatherRoll = roller.log.shift().total;
    let newState = Object.assign({}, this.state);
    if(weatherRoll > 16 && weatherRoll != 20) {
      newState.weather.rain = HEAVY_RAIN;
    } else if (weatherRoll == 20) {
      newState.weather.rain = TROPICAL_STORM;
    } else if (weatherRoll == 1) {
      newState.weather.rain = NO_RAIN;
    } else {
      newState.weather.rain = NORMAL_RAIN;
    }
    this.setState(newState);
  }

  runOvernight() {
    let newState = Object.assign({}, this.state);
    newState.total.food -= this.state.characters.length;
    this.setState(newState);
    this.spendWater(this.state.characters.length);
    this.collectWater();
    this.forage();
  }

  forage() {
    let newState = Object.assign({}, this.state);
    let foragers = newState.characters.filter(character => {
      return character.role == "food";
    });
    let totalFoodFound = 0;
    foragers.forEach(character => {
      roller.roll(`1d20+${character.survival}`);
      let forageRoll = roller.log.shift();
      let rollOutput = `<strong>${character.name}</strong>&nbsp;rolled&nbsp;<strong title="${forageRoll}">${forageRoll.total}</strong>&nbsp;to forage`;
      if(forageRoll.total >= this.state.terrain.dc) {
        roller.roll(`1d6+${character.wisdom}`);
        let foodFound = roller.log.shift();

        totalFoodFound += foodFound.total;
        rollOutput += `&nbsp;and found&nbsp;<strong title="${foodFound}">${foodFound.total}</strong>&nbsp;rations of food!`;

      } else {
        rollOutput += `&nbsp;and did not find any food!`
      }
      M.toast({html: rollOutput.toString(), displayLength: 10000});
    });

    this.setTotal('food', this.state.total.food + totalFoodFound)();
  }

  collectWater() {
    let newContainerState = Object.assign({}, this.state);
    newContainerState.collectors.forEach(collector => {
      collector.current += this.state.weather.rain * collector.rate;
      if(collector.current > collector.max) {
        collector.current = collector.max;
      }
    });
    this.setState(newContainerState);
    this.updateWaterTotalFromContainers();
  }

  spendWater(amount) {
    let newState = Object.assign({}, this.state);
    let potableWater = newState.collectors.filter(collector => {
      return collector.current > 0;
    });

    while(amount) {
      while(potableWater[0].current > 0 & amount > 0) {
        potableWater[0].current -= 1;
        amount -= 1;
      }

      if(amount > 0) {
        potableWater.shift();
        if(potableWater.length <= 0) {
          const toastHTML = `Not enough water! You are deficient by ${amount}. <button onClick="javascript:(function click() { M.Toast.getInstance(document.querySelector('.waterSupply')).dismiss(); })()" class="btn-flat toast-action">Ok</button>`;
          M.toast({html: toastHTML, classes: 'red waterSupply', displayLength: 10000000})
          break;
        }
      }
    }
    this.setState(newState);
    this.updateWaterTotalFromContainers();
  }

  updateWaterTotalFromContainers() {
    let newState = Object.assign({}, this.state);
    newState.total.water = 0;
    this.state.collectors.forEach(collector => {
      newState.total.water += collector.current;
    });
    this.setState(newState);
  }

  incrementTotal(type) {
    return () => {
      let newState = Object.assign({}, this.state);
      newState.total[type] = this.state.total[type] + 1
      this.setState(newState);
    }
  }

  setTotal(type, value) {
    return () => {
      let newState = Object.assign({}, this.state);
      newState.total[type] = value;
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

  removeCharacter(index) {
    let stateUpdate = Object.assign({}, this.state);
    stateUpdate.characters.splice(index, 1);
    this.setState(stateUpdate);
  }

  addCharacter({name=`Character ${this.state.characters.length + 1}`, survival="0", wisdom=0, role="idle"} = {}) {
    let stateUpdate = Object.assign({}, this.state);
    stateUpdate.characters.push({name: name, survival: survival, wisdom: wisdom, role: role});
    this.setState(stateUpdate);
  }

  render() {
    return <div className="App">
      <Navbar className="banner" brand={<a href="/">Tomb of Annahilation</a>} alignLinks="right">

      </Navbar>
      <Row>
        <Col m={4} s={12}>
          <header>
            <h1>Resource Tracker</h1>
          </header>
        </Col>
        <Col m={8} s={12}>
          <div class="valign-wrapper weather right">
            <Badge caption="inches" className="teal lighten-3 black-text">
              Rain: {this.state.weather.rain}
            </Badge>
            <Badge className="orange darken-3 black-text">
              Heat index: {this.state.weather.heat}
            </Badge>
          </div>
        </Col>
      </Row>
      <Row>
        <Col m={4} s={12}>
          <Card horizontal header={<CardTitle image="http://dndspeak.com/wp-content/uploads/2018/03/wallpaper-2661116.jpg"/>} title="Food Rations">
            <Counter value={this.state.total.food} decreaseValue={this.decreaseTotal('food')} increaseValue={this.incrementTotal('food')}/>
          </Card>
        </Col>
        <Col m={4} s={12}>
          <Card horizontal header={<CardTitle image="./assets/images/water_rations.jpg"/>} title="Water Rations">
            <Counter value={this.state.total.water} decreaseValue={this.decreaseTotal('water')} increaseValue={this.incrementTotal('water')}/>
          </Card>
        </Col>
        <Col m={4} s={12}>
          <Card horizontal header={<CardTitle image="./assets/images/repellant_rations.jpg"/>} title="Insect Repellant">
            <Counter value={this.state.total.repellant} decreaseValue={this.decreaseTotal('repellant')} increaseValue={this.incrementTotal('repellant')}/>
          </Card>
        </Col>
      </Row>
      <hr/>
      <Row>
        <h3>Party</h3>
        {this.state.characters.map((character, index) => {
          return <Col m={4} s={12}>
            <Character character={character} index={index} updateCharacter={this.updateCharacter.bind(this)} remove={this.removeCharacter.bind(this)}/>
          </Col>
        })}
      </Row>
      <Row>
        <h3>Collectors</h3>
        {this.state.collectors.map((collector, index) => {
          return <Col m={4} s={12}>
            <Card title={collector.type}>
              <p>{collector.current.toString()} gallons ({collector.max} gallons max)</p>
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
        <Button floating icon="group_add" onClick={() => {this.addCharacter()}}  className="blue" />
      </Button>
    </div>
  };
}

export default App;
