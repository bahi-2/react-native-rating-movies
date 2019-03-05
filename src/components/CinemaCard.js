import {Linking} from "react-native";
import React from "react";

import {Body, Card, CardItem, Content, Icon, Left, Text, Thumbnail} from "native-base";

import { ScheduleCardItem } from 'Kinoslav/src/components/ScheduleCardItem.js';

/** This class is responsible for rendering a card containing items that represent movies playing in the cinema. */
export class CinemaCard extends React.Component {

    /** This method defines the way one card item is rendered. */
    renderCardRow(item) {
        return(
          <Content>
            <CardItem bordered style={{backgroundColor: '#e5efff'}}>
              <Left>
                <Thumbnail source={{uri: item.image}} />
                <Body>
                  <Text
                    onPress={
                      () => Linking.openURL(item.cinestarLink)
                    }
                    style={{color: 'blue'}}> {item.titleHR}
                  </Text>
                  <Text note> {item.title} </Text>
                  <Text note> Žanr: {item.genre} </Text>
                </Body>
              </Left>
                <Icon
                    type="FontAwesome"
                    name="imdb"
                    onPress={
                        () => Linking.openURL(item.imdbLink)
                    }
                />
              <Text>{item.imdbRating}</Text>
            </CardItem>
            <ScheduleCardItem item={item} />
          </Content>
        )
    }

    /** This method renders the card on the screen using the dataSource prop as it's data source. */
    render() {
        return(
          <Card dataArray={this.props.dataSource}
                renderRow=
                  { (item) => this.renderCardRow(item) }
          />
        )
    }
}
