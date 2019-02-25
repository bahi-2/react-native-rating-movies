import React, {Component} from 'react';
import { ProgressBarAndroid, View, Image, AsyncStorage } from 'react-native';

import { Container, Header, Content,
         Body, Title, Card, Text } from "native-base";

import { moviesRef, scheduleRef } from 'Kinoslav/src/config/firebase.js';
import { cinemaLinks } from 'Kinoslav/src/config/storage.js'
import { getCurrentDate, getDayOffset, isEmpty } from 'Kinoslav/src/components/helpers.js';
import { CinemaCard } from "./src/components/CinemaCard";
import { IMDB_BASE_URL } from "./src/config/storage";
import LoadingScreen from "./src/screens/LoadingScreen";
import { CinemaPicker, DayPicker } from './src/components/CustomPickers';

/** The bellow require calls fix a bug with es6 symbols. */
// symbol polyfills
global.Symbol = require('core-js/es6/symbol');
require('core-js/fn/symbol/iterator');
// collection fn polyfills
require('core-js/fn/map');
require('core-js/fn/set');
require('core-js/fn/array/find');

/** Entry point of the application. This is where the magic happens. */
export default class App extends Component {

  /** Initial state of the app. Show the loading screen and load movies for Zagreb. */
  INITIAL_STATE = {
        isLoading: true,
        selectedCinema: 'CineStar Zagreb (Branimir centar)',
        cinemaURL: cinemaLinks["CineStar Zagreb (Branimir centar)"],
        day: 'Danas',
        dayOffset: 0
  };

  /** Constructor which sets the initial state. */
  constructor(props){
    super(props);

    // initial state
    this.state = this.INITIAL_STATE;
  }

  /** Method which is called after the screen is successfully rendered. */
  componentDidMount() {
    let cinemaName = this.state.cinemaURL.split("/")[3];
    let dayOffset = this.state.dayOffset;
    console.log('searching for movies at: ' +cinemaName+", "+dayOffset+" days from today");
    var filteredSchedule = scheduleRef.child(dayOffset+"/"+cinemaName);
    filteredSchedule.once("value")
      .then(snapshot => snapshot.val())
      .then(movieItems => {
        this.setState({
          ...this.state,
          dataSource: movieItems,
          isLoading: false
        });
      });
  }
  
  onCinemaChange(value: string) {
    this.setState({
        ...this.state,
        selectedCinema: value,
        cinemaURL: cinemaLinks[value],
        isLoading: true
      },
      function () {
        this.componentDidMount()
      }
    );
  }

  onDayChange(value: string) {
    let newDate = getDayOffset(value);
    this.setState({
      ...this.state,
      day: value,
      dayOffset: newDate,
      isLoading: true
      },
      function () { //callback which calls the update when ready
        this.componentDidMount()
    });
  }

  /** This method returns the elements that should be rendered on the screen. Before all items are loaded it
   *  simply returns a loading splash screen. */
  render() {
    /* Shows the splash screen with a progress bar while waiting for data. */
    if(this.state.isLoading){
      return(<LoadingScreen />);
    }

    let movieList;
    if (isEmpty(this.state.dataSource)) {
        movieList = <Card><Text> Projekcije još nisu objavljene za {this.state.day}. </Text></Card>;
    } else {
        movieList = <CinemaCard dataSource={this.state.dataSource} />;
    }

    /* When the data is loaded render the app. */
    return(
        <Container style={{backgroundColor: '#e3ecf9'}}>

          <Header>
            <Body>
              <Title style={{color:'white', alignSelf: 'center'}}>
                Cinestar: {this.state.day}
              </Title>
            </Body>
          </Header>

          <Content padder>
            <CinemaPicker
              selectedValue={this.state.selectedCinema}
              onValueChange={this.onCinemaChange.bind(this)} />

            <DayPicker
              selectedValue={this.state.day}
              onValueChange={this.onDayChange.bind(this)} />

            {movieList}
          </Content>

        </Container>
    );
  
  }
}