import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Alert,
  AsyncStorage,
  Modal,
  Switch,
  Button
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchMyNews } from '../utils/utils';
import { fetchMyProfile } from '../utils/utils';

export class LoginScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      password: "",
      showRegisterModal: false,
      showUnRegisterModal: false
    };
  }

  static navigationOptions = {
    header: null
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
        // We were logged out, and now are logged back in so we need to get the news again for the other tab
        fetchMyNews(this.props.dispatch, response.json.userId, response.json.token);
        fetchMyProfile(this.props.dispatch, response.json.userId, response.json.token);
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
      cache: 'default'
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
      .then(response => {
        if (!response.ok || response.status !== 200) {
          throw new Error(response.json.message);
        }
        dispatch({ type: 'DELETE_TOKEN_SUCCESS', msg: "Signed out" });
        AsyncStorage.removeItem("userToken");
        Alert.alert("Signed out");
      })
      .catch(error => {
        dispatch({ type: 'MSG_DISPLAY', msg: `Sign out failed: ${error.message}` });
        Alert.alert(`Sign out failed: ${error.message}`);
      });
  }

  handleRegister = () => {
    return fetch('https://www.newswatcher2rweb.com/api/users', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      cache: 'default',
      body: JSON.stringify({
        displayName: this.state.name,
        email: this.state.email,
        password: this.state.password
      })
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json: json })))
      .then(response => {
        if (!response.ok || response.status !== 201) {
          throw new Error(response.json.message);
        }
        this.props.dispatch({ type: 'MSG_DISPLAY', msg: "Registered" });
        this.setState({ showRegisterModal: false });
      })
      .catch(error => {
        this.props.dispatch({ type: 'MSG_DISPLAY', msg: `Registration failure: ${error.message}` });
        Alert.alert(`Registration failure: ${error.message}`);
      });
  }

  handleUnRegister = () => {
    const { dispatch } = this.props
    fetch(`https://www.newswatcher2rweb.com/api/users/${this.props.session.userId}`, {
      method: 'DELETE',
      headers: new Headers({
        'x-auth': this.props.session.token
      }),
      cache: 'default'
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
      .then(response => {
        if (!response.ok || response.status !== 200) {
          throw new Error(response.json.message);
        }
        dispatch({ type: 'DELETE_TOKEN_SUCCESS', msg: "Signed out" });
        AsyncStorage.removeItem("userToken");
        this.setState({ showUnRegisterModal: false });
        Alert.alert("Account deleted");
      })
      .catch(error => {
        dispatch({ type: 'MSG_DISPLAY', msg: `Account delete failed: ${error.message}` });
        Alert.alert(`Account delete failed: ${error.message}`);
      });
  }

  //TODO: Can create a render function that conditionally renders the user name area and follow DRY principle
  // and show good programming practices.
  _renderRegisterModal = () => {
    return (
      <Modal
        visible={this.state.showRegisterModal}
        animationType={'slide'}
        onRequestClose={() => this.setState({ showRegisterModal: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.formContainer}>
            <Text>Username:</Text>
            <TextInput
              placeHolder="Enter user name"
              placeHolderTextColor='rgba(255,255,255,0.7)'
              returnKeyType="next"
              onSubmitEditing={() => this.emailInput.focus()}
              autoCapitalize='none'
              autoCorrect={false}
              style={styles.input}
              onChangeText={(text) => this.setState({ name: text })}
            />
            <Text>Email:</Text>
            <TextInput
              placeHolder="Enter email"
              placeHolderTextColor='rgba(255,255,255,0.7)'
              returnKeyType="next"
              onSubmitEditing={() => this.passwordInput.focus()}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              style={styles.input}
              ref={(input) => this.emailInput = input}
              onChangeText={(text) => this.setState({ email: text })}
            />
            <Text>Password:</Text>
            <TextInput
              placeHolder="Enter password"
              placeHolderTextColor='rgba(255,255,255,0.7)'
              secureTextEntry
              style={styles.input}
              ref={(input) => this.passwordInput = input}
              onChangeText={(text) => this.setState({ password: text })}
            />
            <TouchableOpacity style={styles.buttonContainer} onPress={this.handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  _renderUnRegisterModal = () => {
    return (
      <Modal
        visible={this.state.showUnRegisterModal}
        animationType={'slide'}
        onRequestClose={() => this.setState({ showUnRegisterModal: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.formContainer}>
            <View style={{ flexDirection: 'row' }}>
              <Switch
                value={this.state.deleteOK}
                onValueChange={(value) => this.setState({ deleteOK: value })}>
              </Switch>
              <Text>Are you sure?</Text>
            </View>
            <Button
              disabled={!this.state.deleteOK}
              onPress={this.handleUnRegister}
              title="UnRegister"
              color="#841584"
            />
            <Text>Why leave us now?</Text>
            <Button
              onPress={() => this.setState({ showUnRegisterModal: false })}
              title="Cancel"
              color="#841584"
            />
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    // If already logged in, then we offer a logout button
    if (this.props.session) {
      return (
        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => this.handleLogout()}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
          <Text>No longer have a need for NewsWatcher?</Text>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => this.setState({ showUnRegisterModal: true })}>
            <Text style={styles.buttonText}>UnRegister</Text>
          </TouchableOpacity>
          {this._renderUnRegisterModal()}
        </View>
      );
    }

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View style={styles.formContainer}>
          <Text>Email:</Text>
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
          <Text>Password:</Text>
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
          <Text style={styles.buttonText}>Register if you want to see filtered new feeds</Text>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => this.setState({ showRegisterModal: true })}>
            <Text style={styles.buttonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
        {this._renderRegisterModal()}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'grey',
  }
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
