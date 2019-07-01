import React, {Component} from 'react';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import '../../../node_modules/materialize-css/dist/js/materialize.min.js';
import { Row, Col, Select, Card, TextInput } from 'react-materialize';

const Editor = (props) => (<Row>
<TextInput label="Name" value={props.character.name.toString()} onChange={(e) => {props.updateCharacter(props.index, 'name', e.target.value);}}/>
<TextInput label="Survival" value={props.character.survival.toString()} onChange={(e) => {props.updateCharacter(props.index, 'survival', e.target.value);}}/>
<TextInput label="Wisdom Mod" value={props.character.wisdom.toString()} onChange={(e) => {props.updateCharacter(props.index, 'wisdom', e.target.value);}}/>
<a onClick={()=>{props.setState({isEditing: false})}}>Save <i className="tiny material-icons">save</i></a>
</Row>
)

const Display = (props) => (<>
  <Col m={6} s={12}>
    Survival: {props.character.survival}
  </Col>
  <Col m={6} s={12}>
    Wisdom: {props.character.wisdom}
  </Col>
</>)

export class Character extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    }
  }

  render() {
    return <>
    <Card title={this.props.character.name} actions={[<a onClick={() => {this.props.remove(this.props.index)}}>Remove</a>,<a onClick={()=>{this.setState({isEditing: !this.state.isEditing})}}>Edit <i className="tiny material-icons">edit</i></a>]}>
        {this.state.isEditing && <Editor character={this.props.character} index={this.props.index} updateCharacter={this.props.updateCharacter} setState={this.setState.bind(this)}/>}
      <Row>
        {!this.state.isEditing && <Display character={this.props.character}/>}
      </Row>
      <Row>
        <Select label="Choose your role" value={this.props.character.role} onChange={(e) => this.props.updateCharacter(this.props.index, 'role', e.target.value)}>
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
