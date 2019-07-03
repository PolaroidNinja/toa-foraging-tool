import React, {Component} from 'react';
import '../../../node_modules/materialize-css/dist/css/materialize.min.css';
import '../../../node_modules/materialize-css/dist/js/materialize.min.js';
import { Row, Col, Select, Card, TextInput } from 'react-materialize';

const Editor = (props) => (<Row>
<TextInput label="Name" value={props.container.name.toString()} onChange={(e) => {props.updateContainer(props.index, 'name', e.target.value, (props.rate !== undefined));}}/>
<TextInput label="Max" value={props.container.max.toString()} onChange={(e) => {props.updateContainer(props.index, 'max', e.target.value, (props.rate !== undefined));}}/>
<TextInput label="Current" value={props.container.current.toString()} onChange={(e) => {props.updateContainer(props.index, 'current', e.target.value, (props.rate !== undefined));}}/>
{props.rate && <TextInput label="Rate" value={props.container.rate.toString()} onChange={(e) => {props.updateContainer(props.index, 'rate', e.target.value, (props.rate !== undefined));}}/>}
<Select label="What does this contain?" value={props.container.type} onChange={(e) => {props.updateContainer(props.index, 'type', e.target.value, (props.rate !== undefined));}}>
  <option value="water">Water</option>
  <option value="food">Food</option>
</Select>
<a onClick={()=>{props.setState({isEditing: false})}}>Save <i className="tiny material-icons">save</i></a>
</Row>
);

const Display = (props) => (<>
  <p>{props.container.current.toString()} {props.container.type === "water" ? 'gallons' : 'rations'} ({props.container.max} {props.container.type === "water" ? 'gallons' : 'rations'} max)</p>
</>)

export class Container extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    }
  }

  render() {
    return <Card title={this.props.container.name} actions={[<a onClick={() => {this.props.remove(this.props.index)}}>Remove</a>,<a onClick={()=>{this.setState({isEditing: !this.state.isEditing})}}>Edit <i className="tiny material-icons">edit</i></a>]}>
        {this.state.isEditing && <Editor container={this.props.container} index={this.props.index} updateContainer={this.props.updateContainer} setState={this.setState.bind(this)} rate={this.props.rate}/>}
        {!this.state.isEditing && <Display container={this.props.container}/>}
    </Card>
  }
}
