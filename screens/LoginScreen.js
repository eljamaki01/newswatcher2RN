import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Alert,
  AsyncStorage
} from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { fetchMyNews } from '../utils/utils';

export class LoginScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      password: "",
      remeberMe: false,
      showModal: false
    };
  }

  static navigationOptions = {
    title: 'Links',
  };

  handleLogin = () => {
    const { dispatch } = this.props
    return fetch('https://www.newswatcher2rweb.com/api/sessions', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      cache: 'default', // no-store or no-cache ro default?
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
      .then(response => {
        if (!response.ok || response.status !== 201) {
          throw new Error(response.json.message);
        }
        // Set the token in device storage
        var xfer = {
          token: response.json.token,
          displayName: response.json.displayName,
          userId: response.json.userId
        };
        AsyncStorage.setItem("userToken", JSON.stringify(xfer));
        dispatch({ type: 'RECEIVE_TOKEN_SUCCESS', msg: `Signed in as ${response.json.displayName}`, session: response.json });
        Alert.alert(`Signed in as ${response.json.displayName}`);
        // window.location.hash = "#news";
        // We were logged out, and now are logged back in so we need to get the news again for the other tab
        fetchMyNews(this.props.dispatch, response.json.userId, response.json.token);
      })
      .catch(error => {
        dispatch({ type: 'MSG_DISPLAY', msg: `Sign in failed: ${error.message}` });
        Alert.alert(`Sign in failed: ${error.message}`);
      });
  }

  handleLogout = () => {
    const { dispatch } = this.props
    fetch(`https://www.newswatcher2rweb.com/api/sessions/${this.props.session.userId}`, {
      method: 'DELETE',
      headers: new Headers({
        'x-auth': this.props.session.token
      }),
      cache: 'default' // no-store or no-cache?
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
      .then(response => {
        if (!response.ok || response.status !== 200) {
          throw new Error(response.json.message);
        }
        dispatch({ type: 'DELETE_TOKEN_SUCCESS', msg: "Signed out" });
        AsyncStorage.removeItem("userToken");
        // window.location.hash = "";
        Alert.alert("Signed out");
      })
      .catch(error => {
        dispatch({ type: 'MSG_DISPLAY', msg: `Sign out failed: ${error.message}` });
        Alert.alert(`Sign out failed: ${error.message}`);
      });
  }

  render() {
    // If already logged in, then we offer a logout button
    if (this.props.session) {
      return (
        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => this.handleLogout()}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View style={styles.formContainer}>
          <TextInput
            placeHolder="Enter email"
            placeHolderTextColor='rgba(255,255,255,0.7)'
            returnKeyType="next"
            onSubmitEditing={() => this.passwordInput.focus()}
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
            style={styles.input}
            onChangeText={(text) => this.setState({ email: text })}
          />
          <TextInput
            placeHolder="Enter password"
            placeHolderTextColor='rgba(255,255,255,0.7)'
            secureTextEntry
            style={styles.input}
            ref={(input) => this.passwordInput = input}
            onChangeText={(text) => this.setState({ password: text })}
          />
          <TouchableOpacity style={styles.buttonContainer} onPress={() => this.handleLogin()}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db'
  },
  formContainer: {
    padding: 20
  },
  input: {
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
    color: '#FFF',
    paddingHorizontal: 10
  },
  buttonContainer: {
    backgroundColor: '#2980b9',
    paddingVertical: 15
  },
  buttonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700'
  },
});

LoginScreen.propTypes = {
  dispatch: PropTypes.func.isRequired,
  session: PropTypes.object
};

const mapStateToProps = state => {
  return {
    session: state.app.session
  }
}

export default connect(mapStateToProps)(LoginScreen)
