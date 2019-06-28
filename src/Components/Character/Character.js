import React, {Component} from 'react';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import '../../../node_modules/materialize-css/dist/js/materialize.min.js';
import { Row, Select, Card, TextInput } from 'react-materialize';

export class Character extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <>
    <Card actions={<a onClick={() => {this.props.remove(this.props.index)}}>Remove</a>}>
      <Row>
        <h4 class="characterName" contenteditable="true">{this.props.character.name}</h4>
      </Row>
      <Row>
        <TextInput label="Survival" value={this.props.character.survival.toString()} onChange={(e) => {this.props.updateCharacter(this.props.index, 'survival', e.target.value);}}/>
        <TextInput label="Wisdom Mod" value={this.props.character.wisdom.toString()} onChange={(e) => {this.props.updateCharacter(this.props.index, 'wisdom', e.target.value);}}/>
      </Row>
      <Row>
        <Select label="Choose your option" value={this.props.character.role} onChange={(e) => this.props.updateCharacter(this.props.index, 'role', e.target.value)}>
          <option value="idle">
            Idle
          </option>
          <option value="food">
            Hunting (Food)
          </option>
          <option value="water">
            Gathering (Water)
          </option>
          <option value="map">
            Mapping
          </option>
          <option value="navigate">
            Navigating
          </option>
        </Select>
      </Row>
    </Card>
    </>
  };
}
