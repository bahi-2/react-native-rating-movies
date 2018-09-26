import React, {Component} from 'react';
import { View, Linking } from 'react-native';

import { CardItem, Text, Button, Picker } from "native-base";

export class ScheduleCardItem extends React.Component {

  renderSecondRow() {
    const itemCount = this.props.item.schedule.length;
    if (itemCount > 4) {
      return (
        <CardItem style={{backgroundColor: '#d8e7ff', paddingTop: 0}}>
          {this.props.item.schedule.map((time, i) =>
            {
              if (i>=4) return(
                <Button key={i} onPress={() => {Linking.openURL(time.link)}} small bordered style={{marginRight: 5}}>
                  <Text>{time.time}</Text>
                </Button>
              )
            })
          }
        </CardItem>
      );
    } else {
      return null;
    }
  }

  render() {
    return(
      <View>
        <CardItem style={{backgroundColor: '#d8e7ff'}}>
          {
            this.props.item.schedule.map((time, i) =>
            {
              if (i<4) return(
                <Button onPress={() => {Linking.openURL(time.link)}} key={i} small bordered style={{marginRight: 5}}>
                  <Text>{time.time}</Text>
                </Button>
              )
            })
          }
        </CardItem>
        {this.renderSecondRow()}
      </View>
    )
  }
}
