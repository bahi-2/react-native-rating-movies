import React, { Component } from 'react';

import {
    Container, Header, Content,
    Body, Title, Card, Text
} from "native-base";

import * as firebase from './src/config/firebase.js';
import { cinemas } from './src/config/storage.js'
import {
    getCurrentDate, getDateForDay, getCurrentDay,
    mapScheduleToMovies, isEmpty
} from './src/util/helpers.js';
import { CinemaCard } from "./src/components/CinemaCard";
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
        cinema: cinemas[3], // todo
        day: getCurrentDay(),
        date: getCurrentDate()
    };

    /** Constructor which sets the initial state. */
    constructor(props) {
        super(props);

        // initial state
        this.state = this.INITIAL_STATE;
        firebase.getAllMovies()
            .then(movies =>
                this.setState({
                        ...this.state,
                        movies: movies
                    },
                    () => {
                        this.loadSchedule();
                    })
            );
    }

    /** Loads the movie schedule based on cinema and day in this.state. */
    loadSchedule() {
        let date = this.state.date;
        let cinema = this.state.cinema;
        let fullDate = date.substring(0, 2) + '-' +
            date.substring(2) + '-' +
            new Date().getFullYear();
        console.log(`Searching for movies playing in ${cinema} on ${fullDate}`);

        firebase.getSchedule(cinema, date)
            .then(movieSchedules => {
                let movieItems = mapScheduleToMovies(movieSchedules, this.state.movies);
                this.setState({
                    ...this.state,
                    dataSource: movieItems,
                    isLoading: false
                });
            })
            .catch(err => console.log(err));
    }


    onCinemaChange(value: string) {
        this.setState({
                ...this.state,
                cinema: value,
                isLoading: true
            },
            () => {
                this.loadSchedule();
            }
        );
    }

    onDayChange(value: string) {
        let newDate = getDateForDay(value);
        this.setState({
                ...this.state,
                day: value,
                date: newDate,
                isLoading: true
            },
            () => { //callback which calls the update when ready
                this.loadSchedule();
            });
    }

    /** This method returns the elements that should be rendered on the screen. Before all items are loaded it
     *  simply returns a loading splash screen. */
    render() {
        /* Shows the splash screen with a progress bar while waiting for data. */
        if (this.state.isLoading) {
            return (<LoadingScreen/>);
        }

        let movieList;
        if (isEmpty(this.state.dataSource)) {
            let warning =  `Projekcije još nisu objavljene za ${this.state.day}.`;
            movieList = <Card><Text> { warning } </Text></Card>;
        } else {
            movieList = <CinemaCard dataSource={this.state.dataSource}/>;
        }

        /* When the data is loaded render the app. */
        return (
            <Container style={{backgroundColor: '#e3ecf9'}}>

                <Header>
                    <Body>
                    <Title style={{color: 'white', alignSelf: 'center'}}>
                        Cinestar: {this.state.day}
                    </Title>
                    </Body>
                </Header>

                <Content padder>
                    <CinemaPicker
                        selectedValue={this.state.cinema}
                        onValueChange={this.onCinemaChange.bind(this)}/>

                    <DayPicker
                        selectedValue={this.state.day}
                        onValueChange={this.onDayChange.bind(this)}/>

                    {movieList}
                </Content>

            </Container>
        );

    }
}