import React from 'react';
import { Picker } from 'native-base';

/** This class renders a drop-down menu for selecting a day of the week. */
export class DayPicker extends React.Component {
	render() {
		return(
			<Picker
			  mode="dropdown"
			  style={{ width: undefined }}
			  selectedValue={this.props.selectedValue}
			  onValueChange={this.props.onValueChange}
			>
			  <Picker.Item enabled={false} label = "Odaberi dan" value = "Danas" />
			  <Picker.Item label = "Ponedjeljak" value = "Ponedjeljak" />
			  <Picker.Item label = "Utorak" value = "Utorak" />
			  <Picker.Item label = "Srijeda" value = "Srijeda" />
			  <Picker.Item label = "Četvrtak" value = "Četvrtak" />
			  <Picker.Item label = "Petak" value = "Petak" />
			  <Picker.Item label = "Subota" value = "Subota" />
			  <Picker.Item label = "Nedjelja" value = "Nedjelja" />
			</Picker>
		)
	}
}


/** This class renders a drop-down menu for selecting a cinema for which to display content. */
export class CinemaPicker extends React.Component {
	render() {
		return(
			<Picker
			  mode="dropdown"
			  style={{ width: undefined }}
			  selectedValue={this.props.selectedValue}
			  onValueChange={this.props.onValueChange}
			>
			  <Picker.Item enabled={false} label="Odaberi kino" value="Cinestar Zagreb" />
			  <Picker.Item label= "CineStar Zagreb (Branimir centar)" value= "CineStar Zagreb (Branimir centar)" />
			  <Picker.Item label= "CineStar Novi Zagreb (Avenue mall)" value= "CineStar Novi Zagreb (Avenue mall)" />
			  <Picker.Item label= "CineStar Arena IMAX (Arena centar)" value= "CineStar Arena IMAX (Arena centar)" />
			  <Picker.Item label= "CineStar Joker Split" value= "CineStar Joker Split" />
			  <Picker.Item label= "CineStar 4DX Mall of Split " value= "CineStar 4DX Mall of Split " />
			  <Picker.Item label= "CineStar Rijeka 4DX (Tower Center)" value= "CineStar Rijeka 4DX (Tower Center)" />
			  <Picker.Item label= "CineStar Zadar (City Galleria)" value= "CineStar Zadar (City Galleria)" />
			  <Picker.Item label= "CineStar Šibenik (Dalmare centar)" value= "CineStar Šibenik (Dalmare centar)" />
			  <Picker.Item label= "CineStar Osijek (Portanova centar)" value= "CineStar Osijek (Portanova centar)" />
			  <Picker.Item label= "CineStar Varaždin (Lumini centar)  " value= "CineStar Varaždin (Lumini centar)  " />
			  <Picker.Item label= "CineStar Dubrovnik (Dvori Lapad)   " value= "CineStar Dubrovnik (Dvori Lapad)   " />
			  <Picker.Item label= "CineStar Sl. Brod (City Colosseum)     " value= "CineStar Sl. Brod (City Colosseum)     " />
			  <Picker.Item label= "CineStar Vukovar (K Centar Golubica)   " value= "CineStar Vukovar (K Centar Golubica)   " />
			  <Picker.Item label= "CineStar Mostar (Mepas Mall)   " value= "CineStar Mostar (Mepas Mall)   " />
			  <Picker.Item label= "CineStar Bihać (Bingo centar)   " value= "CineStar Bihać (Bingo centar)   " />
			  <Picker.Item label= "CineStar Tuzla (Bingo City Center)" value= "CineStar Tuzla (Bingo City Center)" />
			</Picker>
		)
	}
}