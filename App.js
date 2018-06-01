import React from 'react';
import { Platform, StatusBar, StyleSheet, View, AsyncStorage } from 'react-native';
import { AppLoading, Asset, Font } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator } from 'react-navigation';
import MainTabNavigator from './navigation/MainTabNavigator';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducer from './reducers'
import { fetchMyNews } from './utils/utils';
import { fetchMyProfile } from './utils/utils';

const store = createStore(reducer);

const RootNavigator = TabNavigator(
  {
    Main: {
      screen: MainTabNavigator,
    }
  },
  {
    navigationOptions: () => ({
      headerTitleStyle: {
        fontWeight: 'normal',
      }
    })
  }
);

export default class App extends React.Component {
  state = {
    isLoadingComplete: false
  };

  componentDidMount() {
    // Check for token in device local storage, meaning user is signed in
    AsyncStorage.getItem('userToken', function (err, value) {
      if (value) {
        const tokenObject = JSON.parse(value);
        store.dispatch({ type: 'RECEIVE_TOKEN_SUCCESS', msg: `Signed in as ${tokenObject.displayName}`, session: tokenObject });
        // There could be a timing issue on startup so can't count on ComponentDidMount to fetch the data and have the
        // session token available at that time.
        fetchMyNews(store.dispatch, tokenObject.userId, tokenObject.token);
        fetchMyProfile(store.dispatch, tokenObject.userId, tokenObject.token);
      } else {
      }
    })
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <Provider store={store}>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
            <RootNavigator />
          </View>
        </Provider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
