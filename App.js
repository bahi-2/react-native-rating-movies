import React, {Component} from 'react';
import { ProgressBarAndroid, View, Image, AsyncStorage } from 'react-native';

import { Container, Header, Content,
         Body, Title } from "native-base";
import cheerio from 'react-native-cheerio';

import { getIMDBId, getIMDBRating } from 'Kinoslav/src/ratings.js';
import { cinemaLinks } from 'Kinoslav/src/config/storage.js'
import { CinemaPicker, DayPicker } from 'Kinoslav/src/components/CustomPickers.js';
import { getCurrentDate, getDateForDay } from 'Kinoslav/src/components/helpers.js';
import { CinemaCard } from "./src/components/CinemaCard";
import { IMDB_BASE_URL } from "./src/config/storage";
import LoadingScreen from "./src/screens/LoadingScreen";
import MainScreen from "./src/screens/MainScreen";

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
        selectedCinema: 'Cinestar Zagreb',
        cinemaURL: cinemaLinks["CineStar Zagreb"],
        day: 'Danas',
        date: getCurrentDate()
  };

  /** Constructor which sets the initial state. */
  constructor(props){
    super(props);

    // initial state
    this.state = this.INITIAL_STATE;
  }

  /** Method which is called after the screen is successfully rendered. */
  componentDidMount() {
    // MAKNI OVO KAD POPRAVIŠ RATINGE
    setTimeout(()=>this.setState(this.state), 4000);
    setInterval(()=>this.setState(this.state), 10000); // za svaki slučaj
    // setInterval(() => {this.setState(this.state);console.log('reloading')}, 2000);

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
        
        tbodies.each(async function(index,tbody) {
          // array informacija o jednom filmu
          let movieInfo = [];
          // puni movieInfo sa svim dostupnim field-ovima
          $(this).find('td > a:nth-child(1)')
                 .each((index, item) => movieInfo.push(item.firstChild.data));

          // nađe sliku povezanu sa tim filmom skačući po DOM-u
          let cover = $(this).parent().parent().prev();
          let img = cover.find('img').attr('src');
          // iz slike također uzmemo href atribut
          let cinestarLink = cover.find('a').attr('href');

          // lista rasporeda prikaza
          let scheduleList = $(this).parent().parent().parent().parent().parent().next();
          var schedule = [];
          scheduleList
                  .find('div.scheduleItem > div.vrijeme_sub > div.termin > a.tips')
                  .each(async function (index, tag) {
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
            schedule: schedule,
            cinestarLink: cinestarLink,
            // imdbLink: imdbLink
          };
          // const ID = getIMDBId(movieItem.titleEN);
          // let imdbLink = IMDB_BASE_URL + ID;
          // if (!ID) imdbLink = undefined;

          getIMDBId(movieItem.titleEN).then(function(id){
            if (!id) return;
            let imdbLink = IMDB_BASE_URL + id;
            movieItem.imdbLink=imdbLink;

            AsyncStorage.getItem(id)
                .then(cachedRating => {
                    console.log(cachedRating);

                    if (cachedRating) {
                      movieItem.imdbRating = cachedRating;
                      return;
                    }
                    getIMDBRating(imdbLink)
                      .then(rating => {
                        movieItem.imdbRating = rating;
                        AsyncStorage.setItem(id, rating, console.log);
                    });
                });
          }).catch(console.log);

          // add the rating
          // getIMDBRatingAPI(movieItem.titleEN);

          // only display movies that have at least one play
          if (schedule.length !== 0){
            movieItems.push(movieItem);
          }
        })

        this.setState({
          ...this.state,
          dataSource: movieItems,
        });

      })
      .then(() => {
        this.setState({isLoading: false});
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
      },
      function () {
        this.componentDidMount()
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

    /* When the data is loaded render the app. */
    return (<MainScreen />);
  
  }
}