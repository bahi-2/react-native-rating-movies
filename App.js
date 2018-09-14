import React, {Component} from 'react';
import { ProgressBarAndroid,View, Image  } from 'react-native';

import { Container, Header, Content, 
         Card, CardItem, Text, Body, 
         Thumbnail, Left, Title, 
         Spinner, Button, Icon } from "native-base";
import cheerio from 'react-native-cheerio';

import { getIMDBRating } from 'imdbcinestar/src/ratings.js';
import {cinemaLinks} from 'imdbcinestar/src/config/storage.js'
import { ScheduleCardItem } from 'imdbcinestar/src/components/ScheduleCardItem.js';
import { CinemaPicker, DayPicker } from 'imdbcinestar/src/components/CustomPickers.js';
import { getCurrentDate, getDateForDay } from 'imdbcinestar/src/components/helpers.js';

// symbol polyfills
global.Symbol = require('core-js/es6/symbol');
require('core-js/fn/symbol/iterator');

// collection fn polyfills
require('core-js/fn/map');
require('core-js/fn/set');
require('core-js/fn/array/find');

export default class App extends React.Component {

  constructor(props){
    super(props);

    // initial state
    this.state = { 
      isLoading: true, 
      selectedCinema: 'Cinestar Zagreb',
      cinemaURL: cinemaLinks["CineStar Zagreb"],
      day: 'Danas',
      date: getCurrentDate()
    };
  }

  componentDidMount() {
    // MAKNI OVO KAD POPRAVIŠ RATINGE
    // setTimeout(() => this.setState(this.state),2000);
        
    console.log('searching for movies at: ' + this.state.cinemaURL+"/"+this.state.date)
    return fetch(this.state.cinemaURL+"/"+this.state.date)
      .then((response) => response.text())
      .then((htmlString) => {
        // parsiramo html u konstantu koja podsjeća na JQuery (kao i njena uporaba)
        const $ = cheerio.load(htmlString);
        
        // lista svih kartica o filmu 
        // kartica ima: 1) tablicu informacija o filmu
        //              2) td.cover sa slikom
        //              3) div.scheduleBody_sub2 rasporeda prikaza
        let movieBoxList = $('div.movie_box');

        // 1) lista svih tablica informacija, sadrži sav text
        let tbodies = movieBoxList.find("table.info_movie_list > tbody");

        var movieItems = [];  // završna lista koja će se prikazivati na ekranu
        
        tbodies.each(function(index,tbody) {
          // array informacija o jednom filmu
          let movieInfo = [];
          // puni movieInfo sa svim dostupnim field-ovima
          $(this).find('td > a:nth-child(1)')
                 .each((index, item) => movieInfo.push(item.firstChild.data));

          // nađe sliku povezanu sa tim filmom skakajući po DOM-u
          let img = $(this).parent().parent().prev().find('img').attr('src');

          // lista rasporeda prikaza
          let scheduleList = $(this).parent().parent().parent().parent().parent().next();
          schedule = [];
          scheduleList.find('div.vrijeme_sub > div.termin > a.tips')
                  .each(function (index, tag) {
                    schedule.push({
                      time: $(this).text(),
                      link: $(this).attr('href')
                    })
                  });

          // extract-amo varijable iz array-a informacija
          let movieItem = {
            titleHR: movieInfo[0],
            titleEN: movieInfo[1],
            image: img,
            // duration:
            producer: movieInfo[2],
            genre: movieInfo[3],
            // actors: movieInfo[],
            // country: movieInfo[],
            imdbRating: '-',
            schedule: schedule
          };

          // add the rating
          // getIMDBRating(movieItem.titleEN);

          // only display movies that have at least one play
          if (schedule.length !== 0){
            movieItems.push(movieItem);
          }
        })

        this.setState({
          isLoading: false,
          dataSource: movieItems,
        });

      })
      .catch((error) => {
        console.error("Error while fetching resources from cinestar: " + error);
      });
  }
  
  onCinemaChange(value: string) {
    this.setState({
      ...this.state,
      selectedCinema: value,
      cinemaURL: cinemaLinks[value],
      isLoading: true
    });
    this.componentDidMount()
  }

  onDayChange(value: string) {
    let newDate = getDateForDay(value);
    this.setState({
      ...this.state,
      day: value,
      date: newDate,
      isLoading: true
      },
      function () { //callback which calls the update when ready
        this.componentDidMount()
    });
  }

  render() {

    if(this.state.isLoading){
      // if(true){
      return(
        <View style={{flex: 1}}>
          <Image style={{flex:1, resizeMode: 'stretch', width: null, height: null}} source = {require('imdbcinestar/src/assets/splash.jpg')} />
          <ProgressBarAndroid styleAttr='Horizontal' color="#2196F3" />
        </View>
      )
    }

    return (
      <Container style={{backgroundColor: '#e3ecf9'}}>
        <Header>
          <Body>
            <Title style={{color:'white', alignSelf: 'center'}}> Cinestar: {this.state.day} </Title>
          </Body>
        </Header>
        <Content padder>

          <CinemaPicker 
            selectedValue={this.state.selectedCinema} 
            onValueChange={this.onCinemaChange.bind(this)} />
          
          <DayPicker 
            selectedValue={this.state.day}
            onValueChange={this.onDayChange.bind(this)} />

          <Card dataArray={this.state.dataSource}
                renderRow=
                  { (item) => 
                    <Content>
                      <CardItem bordered style={{backgroundColor: '#e5efff'}}>
                        <Left>
                          <Thumbnail source={{uri: item.image}} />
                          <Body>
                            <Text> {item.titleHR} </Text>
                            <Text note> {item.titleEN} </Text>
                            <Text note> Žanr: {item.genre} </Text>
                          </Body>
                        </Left>
                        <Text>IMDB: {item.imdbRating}</Text>
                      </CardItem>
                      <ScheduleCardItem item={item} />
                    </Content>
                  } />
        </Content>
      </Container>
    );
  
  }
}