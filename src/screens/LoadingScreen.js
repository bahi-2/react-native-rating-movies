import {Image, ProgressBarAndroid, View} from "react-native";
import React from "react";

export default class LoadingScreen extends React.Component {
    render() {
        return(
            <View style={{flex: 1}}>
              <Image
                  style={{flex:1, resizeMode: 'stretch', width: null, height: null}}
                  source = {require('Kinoslav/src/assets/splash.jpg')} />
              <ProgressBarAndroid styleAttr='Horizontal' color="#2196F3" />
            </View>
        )
    }
}