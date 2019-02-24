import { Body, Container, Content, Header, Title } from "native-base";
import { CinemaCard } from "../components/CinemaCard";
import React from "react";

export default class MainScreen extends React.Component {
    render() {
        return (
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

              <CinemaCard dataSource={this.state.dataSource} />
            </Content>

          </Container>
        );
    }
}