import React, { Component } from 'react';
import './App.css';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import M from '../../../node_modules/materialize-css/dist/js/materialize.min.js';
import { Navbar, Row, Card, CardTitle, Col, Button, Badge } from 'react-materialize';
import {Counter} from '../Counter';
import {Character} from '../Character';
import {Container} from '../Container';
import { DiceRoller } from 'rpg-dice-roller';

const WATER_BARREL = "Water Barrel"
const NO_RAIN = 0;
// const LIGHT_RAIN = 1;
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
        {name: "Dinithir", survival: "1", wisdom: 1, role: "water"},
        {name: "Owain", survival: "6", wisdom: 4, role: "food"},
        {name: "Shela", survival: "0", wisdom: 0, role: "idle"}
      ],
      collectors: [
        {name: WATER_BARREL, type: 'water', max: 8, current: 3, rate: 1},
        // {type: WATER_BARREL, max: 8, current: 3, rate: 1}
      ],
      containers: [
        {name: "Wine Skin", type: 'water', max:1, current: 0},
        {name: "Bag (Partially Filled)", type: 'food', max:5, current: 1},
      ],
      total: {
        food: 10,
        water: 0,
        repellant: 78
      }
    }
  }

  componentDidMount() {
    this.updateWaterTotalFromContainers();
    this.updateFoodTotalFromContainers();
  }
  determineWeather() {
    roller.roll('1d20');
    let weatherRoll = roller.log.shift().total;
    let newState = Object.assign({}, this.state);
    if(weatherRoll > 16 && weatherRoll !== 20) {
      newState.weather.rain = HEAVY_RAIN;
    } else if (weatherRoll === 20) {
      newState.weather.rain = TROPICAL_STORM;
    } else if (weatherRoll === 1) {
      newState.weather.rain = NO_RAIN;
    } else {
      newState.weather.rain = NORMAL_RAIN;
    }
    this.setState(newState);
  }

  runOvernight() {
    this.spendFood(this.state.characters.length);
    this.spendWater(this.state.characters.length);
    this.collectWater();
    this.distillWater();
    this.forage();
  }

  forage() {
    let newState = Object.assign({}, this.state);
    let foragers = newState.characters.filter(character => {
      return character.role === "food";
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

    this.addFood(totalFoodFound);
  }

  distillWater() {
    let newState = Object.assign({}, this.state);
    let distillers = newState.characters.filter(character => {
      return character.role === "water";
    });
    let totalWaterFound = 0;
    distillers.forEach(character => {
      roller.roll(`1d20+${character.survival}`);
      let forageRoll = roller.log.shift();
      let rollOutput = `<strong>${character.name}</strong>&nbsp;rolled&nbsp;<strong title="${forageRoll}">${forageRoll.total}</strong>&nbsp;to find water`;
      if(forageRoll.total >= this.state.terrain.dc) {
        roller.roll(`1d6+${character.wisdom}`);
        let waterFound = roller.log.shift();

        totalWaterFound += waterFound.total;
        rollOutput += `&nbsp;and got&nbsp;<strong title="${waterFound}">${waterFound.total}</strong>&nbsp;gallons of water!`;

      } else {
        rollOutput += `&nbsp;and did not get any drinkable water!`
      }
      M.toast({html: rollOutput.toString(), displayLength: 10000});
    });

    this.addWater(totalWaterFound);
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

  addWater(amount=1) {
    const toastHTML = `Not enough space for water! <button onClick="javascript:(function click() { M.Toast.getInstance(document.querySelector('.waterSupply')).dismiss(); })()" class="btn-flat toast-action">Ok</button>`;
    this.editContainerableResource('water', amount, () => {
      M.toast({html: toastHTML, classes: 'red waterSupply', displayLength: 10000000});
    });
  }

  spendWater(amount=1) {
    this.editContainerableResource('water', amount * -1, (amount) => {
      const toastHTML = `Not enough water! You are deficient by ${amount}. <button onClick="javascript:(function click() { M.Toast.getInstance(document.querySelector('.waterSupply')).dismiss(); })()" class="btn-flat toast-action">Ok</button>`;
      M.toast({html: toastHTML, classes: 'red waterSupply', displayLength: 10000000});
    });
  }

  addFood(amount=1) {
    const toastHTML = `Not enough space for food rations! <button onClick="javascript:(function click() { M.Toast.getInstance(document.querySelector('.foodSupply')).dismiss(); })()" class="btn-flat toast-action">Ok</button>`;
    this.editContainerableResource('food', amount, () => {
      M.toast({html: toastHTML, classes: 'red foodSupply', displayLength: 10000000});
    });
  }

  spendFood(amount=1) {
    this.editContainerableResource('food', amount * -1, () => {
      const toastHTML = `Not enough food! You are deficient by ${amount}. <button onClick="javascript:(function click() { M.Toast.getInstance(document.querySelector('.foodSupply')).dismiss(); })()" class="btn-flat toast-action">Ok</button>`;
      M.toast({html: toastHTML, classes: 'red foodSupply', displayLength: 10000000});
    });
  }

  editContainerableResource(resourceType, amount, errCallback) {
    console.log(`Editing ${resourceType} by ${amount}`);
    let newState = Object.assign({}, this.state);
    let collectors = newState.collectors.filter(x => {return x.type === resourceType});
    let containers = newState.containers.filter(x => {return x.type === resourceType});
    let modify = (x) => { return x += 1};
    let filter = (x) => { return x.current < x.max };

    if(amount < 0) {
      modify = (x) => { return x -= 1};
      filter = (x) => { return x.current > 0 };
      amount = Math.abs(amount);
    }

    containers = [...containers, ...collectors].filter(filter);
    containers.forEach((x) => {console.log(x.name);})
    if(containers.length <= 0) {
      console.warn('no containers found');
      errCallback(amount);
      return;
    }

    while(amount > 0) {
      console.log('~~ outer while ~~');
      console.log(`${resourceType} left to edit: ${amount}`);
      while(filter(containers[0]) && amount > 0) {
        console.log('-- inner while --');
        console.log(`Updating ${containers[0].name} with ${containers[0].current}/${containers[0].max}`);
        containers[0].current = modify(containers[0].current);
        amount -= 1;
        console.log(`${containers[0].name} now has ${containers[0].current}/${containers[0].max}`);
        console.log(`amount is now ${amount}`);
      }

      if(amount > 0) {
        console.log(`amount is still ${amount} but 1st container is full (${containers[0].current}/${containers[0].max})`);
        console.log('shifting containers');
        containers.shift();
        if(containers.length <= 0 && amount > 0) {
          console.log('No more containers after shifting! Exit.');
          errCallback(amount);
          break;
        }
      }
    }
    this.setState(newState);
    this.updateWaterTotalFromContainers();
    this.updateFoodTotalFromContainers();
  }

  updateWaterTotalFromContainers() {
    let newState = Object.assign({}, this.state);
    newState.total.water = 0;
    this.state.collectors.filter(x => x.type === "water").forEach(collector => {
      newState.total.water += collector.current;
    });
    this.state.containers.filter(x => x.type === "water").forEach(collector => {
      newState.total.water += collector.current;
    });
    this.setState(newState);
  }

  updateFoodTotalFromContainers() {
    let newState = Object.assign({}, this.state);
    newState.total.food = 0;
    this.state.collectors.filter(x => x.type === "food").forEach(collector => {
      newState.total.food += collector.current;
    });
    this.state.containers.filter(x => x.type === "food").forEach(collector => {
      newState.total.food += collector.current;
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

  addCollector({name=WATER_BARREL,type="water", max=8, current=0, rate=1} = {}) {
    let stateUpdate = Object.assign({}, this.state);
    stateUpdate.collectors.push({name:name, type: type, max: max, current: current, rate: rate});
    this.setState(stateUpdate);
    this.updateWaterTotalFromContainers();
    this.updateFoodTotalFromContainers();
  }

  removeCollector(index) {
    let stateUpdate = Object.assign({}, this.state);
    stateUpdate.collectors.splice(index, 1);
    this.setState(stateUpdate);
    this.updateWaterTotalFromContainers();
    this.updateFoodTotalFromContainers();
  }

  addContainer({name="Bag (Partially Filled)", type='food', max=5, current=0} = {}) {
    let stateUpdate = Object.assign({}, this.state);
    stateUpdate.containers.push({name:name, type: type, max: max, current: current});
    this.setState(stateUpdate);
    this.updateWaterTotalFromContainers();
    this.updateFoodTotalFromContainers();
  }

  removeContainer(index) {
    let stateUpdate = Object.assign({}, this.state);
    stateUpdate.containers.splice(index, 1);
    this.setState(stateUpdate);
    this.updateWaterTotalFromContainers();
    this.updateFoodTotalFromContainers();
  }

  updateContainer(index, stat, value, isCollector) {
    let stateObj = isCollector ? this.state.collectors : this.state.containers;
    let stateUpdate = Object.assign({}, stateObj);
    stateUpdate[index][stat] = parseInt(value) ? parseInt(value) : value;
    this.setState(stateUpdate);
    this.updateWaterTotalFromContainers();
    this.updateFoodTotalFromContainers();
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
      <Row className="counters">
        <Col m={4} s={12}>
          <Card horizontal header={<CardTitle image="http://dndspeak.com/wp-content/uploads/2018/03/wallpaper-2661116.jpg"/>} title="Food Rations">
            <Counter value={this.state.total.food} decreaseValue={this.spendFood.bind(this)} increaseValue={this.addFood.bind(this)}/>
          </Card>
        </Col>
        <Col m={4} s={12}>
          <Card horizontal header={<CardTitle image="./assets/images/water_rations.jpg"/>} title="Water Rations">
            <Counter value={this.state.total.water} decreaseValue={this.spendWater.bind(this)} increaseValue={this.addWater.bind(this)}/>
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
          return <Col m={3} s={12}>
            <Character character={character} index={index} updateCharacter={this.updateCharacter.bind(this)} remove={this.removeCharacter.bind(this)}/>
          </Col>
        })}
      </Row>
      <Row>
        <h3>Collectors</h3>
        {this.state.collectors.map((collector, index) => {
          return <Col m={4} s={12}>
            <Container container={collector} index={index} updateContainer={this.updateContainer.bind(this)} remove={this.removeCollector.bind(this)} rate={collector.rate}/>
          </Col>
        })}
      </Row>
      <Row>
        <h3>Containers</h3>
        {this.state.containers.map((container, index) => {
          return <Col m={3} s={12}>
            <Container container={container} index={index} updateContainer={this.updateContainer.bind(this)} remove={this.removeContainer.bind(this)} />
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
        <Button floating icon="category" onClick={() => {this.addContainer()}} className="green" />
        <Button floating icon="local_drink" onClick={() => {this.addCollector()}} className="blue" />
        <Button floating icon="brightness_3" onClick={() => {this.runOvernight()}} className="green" />
        <Button floating icon="group_add" onClick={() => {this.addCharacter()}}  className="blue" />
      </Button>
    </div>
  };
}

export default App;
