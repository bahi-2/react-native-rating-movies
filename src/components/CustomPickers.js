import React from 'react';
import { Picker } from 'native-base';

import { cinemas, croatianDays } from '../config/storage.js';


/** This class renders a drop-down menu for selecting a day of the week. */
export class DayPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {render: createPickerFromOptionsArray(croatianDays, props)};
  }

	render() {
		return this.state.render;
	}

}


/** This class renders a drop-down menu for selecting a cinema for which to display content. */
export class CinemaPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {render: createPickerFromOptionsArray(cinemas, props)};
  }

  render() {
    return this.state.render;
  }

}


function createPickerFromOptionsArray(arr, props) {
  let pickerItems = [];
  for (let i=0; i<arr.length; i++) {
    let item = <Picker.Item label={arr[i]} value={arr[i]} key={i} />;
    pickerItems.push(item);
  }
  return(
    <Picker
      mode="dropdown"
      style={{ width: undefined }}
      selectedValue={props.selectedValue}
      onValueChange={props.onValueChange}
    >
      {pickerItems}
    </Picker>
  );
}