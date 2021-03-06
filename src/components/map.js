import React from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE  } from 'react-native-maps';
import { buildApiString } from "./doe-api"
import axios from "axios/index"
// import { getZipCode } from './google-maps-api'

const LATITUDE = 37.7749;
const LONGITUDE = -122.4194;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;

export default class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      prevLatLng: {},
      coordinate: { latitude: LATITUDE, longitude: LONGITUDE },
      apiData: { fuel_stations: [ { latitude: 0, longitude: 0 } ] },
      currentZipCode: ''
    }
  }

  callApi(apiString) {
    axios.get(apiString)
      .then((response) => {
        console.log(response.data);
        this.setState( { apiData: response.data } )
      } )
      .catch((error) => console.log(error))
  }

  getCcsStations() {
    const apiOptions = {
      ev_connector_type: "J1772COMBO",
      limit: "20"
    };

    const apiString = buildApiString(apiOptions);

    this.callApi(apiString)
  }

  getLevel3StationsNearMe(zip) {
    const apiOptions = { zip,
                      ev_charging_level: "dc_fast",
                      limit: "20"}
    const apiString = buildApiString(apiOptions);

    this.callApi(apiString)
  }

  // calculate straight line coordinates between two coordinates
  calcCrow(startCoords, stopCoords) {
    const R = 6371; // km
    const dLat = this.toRad(stopCoords.latitude - startCoords.latitude)
    const dLon = this.toRad(stopCoords.longitude - startCoords.longitude)
    const lat1 = (startCoords.latitude)
    const lat2 = this.toRad(stopCoords.latitude)
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d;
  }

  // Converts numeric degrees to radians
  toRad(Value) {
    return Value * Math.PI / 180;
  }

  componentDidMount() {
    // this.getCcsStations();
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        console.log("current user position: ", position);
        const oldCoordinate = this.state.coordinate
        const newCoordinate = { latitude: position.coords.latitude, longitude: position.coords.longitude }

        this.setState({
          prevLatLng: oldCoordinate,
          coordinate: newCoordinate
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  getMapRegion = () => {
    if(this.state.latitude == null || this.state.longitude == null) {
      return {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    } else {
      return {
        latitude: this.state.coordinate.latitude,
        longitude: this.state.coordinate.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView
          showUserLocation
          showsMyLocationButton
          showsTraffic
          followUserLocation
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: LATITUDE,
            longitude: LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }}
          region={this.getMapRegion()}
        >
            {/*
          <Marker coordinate={this.state.coordinate}></Marker>

          {this.state.apiData.fuel_stations.map( ( data, index) => {
            let coordinate = {latitude: data.latitude, longitude: data.longitude}
            return(
              <Marker key={index} coordinate={coordinate} pinColor="blue" />
            )
          })}
          */}
        </MapView>

        {/*
        <TextInput onChangeText={(currentZipCode) => this.setState({currentZipCode})}
                   value={this.state.currentZipCode} ></TextInput>
         <Button onPress={ this.getLevel3StationsNearMe.bind(this, this.state.currentZipCode)} title="Refresh" />
        <Text>Lat: {this.state.coordinate.latitude}</Text>
        <Text>Long: {this.state.coordinate.longitude}</Text>


        { this.state.apiData.fuel_stations.map( ( data ) => {
          return(
            <Text key={data.id}>{data.id}</Text>
          )
        })

        }
        */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 600,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%'
  }
});
