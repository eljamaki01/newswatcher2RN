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
  Picker
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchMyProfile } from '../utils/utils';

class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteOK: false,
      selectedValue: '',
      selectedIdx: 0
    };
  }

  componentDidMount() {
    if (!this.props.session) {
      // return window.location.hash = "";
      return;
    }

    // We only get here once to this code, and maybe not, if we are not logged in
    fetchMyProfile(this.props.dispatch, this.props.session.userId, this.props.session.token);
  }

  handleAdd = () => {
    const { dispatch } = this.props
    if (this.props.user.newsFilters.length === 5) {
      dispatch({ type: 'MSG_DISPLAY', msg: "No more newsFilters allowed" });
    } else {
      var len = this.props.user.newsFilters.length;
      dispatch({ type: 'ADD_FILTER' });
      this.setState({ selectedIdx: len });
    }
  }

  handleDelete = () => {
    this.props.dispatch({ type: 'DELETE_FILTER', selectedIdx: this.state.selectedIdx });
    this.setState({ selectedIdx: 0 });
  }

  handleSave = () => {
    const { dispatch } = this.props
    fetch(`https://www.newswatcher2rweb.com/api/users/${this.props.session.userId}`, {
      method: 'PUT',
      headers: new Headers({
        'x-auth': this.props.session.token,
        'Content-Type': 'application/json'
      }),
      cache: 'default', // no-store or no-cache ro default?
      body: JSON.stringify(this.props.user)
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
      .then(response => {
        if (!response.ok || response.status !== 200) {
          throw new Error(response.json.message);
        }
        dispatch({ type: 'MSG_DISPLAY', msg: "Profile saved" });
      })
      .catch(error => {
        dispatch({ type: 'MSG_DISPLAY', msg: `Profile save failed: ${error.message}` });
        Alert.alert(`Profile save failed: ${error.message}`);
      });
  }

  render() {
    if (!this.props.session) {
      return (
        <View>
          <Text>Not currently logged in</Text>
        </View>
      );
    }

    if (this.props.isLoading) {
      return (
        <View>
          <Text>Loading profile...</Text>
        </View>
      );
    }

    return (
      <View>
        <Text>News Filters</Text>
        <Picker
          selectedValue={this.state.selectedValue}
          onValueChange={(itemValue, itemIndex) => this.setState({ selectedValue: itemValue, selectedIdx: itemIndex })}>
          {this.props.user.newsFilters.map((filter, idx) =>
            <Picker.Item label={filter.name} value={idx} />
          )}
        </Picker>
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View style={styles.formContainer}>
            <Text>Name:</Text>
            <TextInput
              placeHolder="Enter filter name"
              placeHolderTextColor='rgba(255,255,255,0.7)'
              style={styles.input}
              onChangeText={(text) => this.props.dispatch({ type: 'ALTER_FILTER_NAME', filterIdx: this.state.selectedIdx, value: text })}
              value={this.props.user.newsFilters[this.state.selectedIdx].name}
            />
            <TextInput
              placeHolder="Enter keywords"
              placeHolderTextColor='rgba(255,255,255,0.7)'
              style={styles.input}
              onChangeText={(text) => this.props.dispatch({ type: 'ALTER_FILTER_KEYWORDS', filterIdx: this.state.selectedIdx, value: text })}
              value={this.props.user.newsFilters[this.state.selectedIdx].keywordsStr}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity disabled={this.props.user.newsFilters.length>4} style={styles.buttonContainer} onPress={this.handleAdd}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={this.props.user.newsFilters.length<2} style={styles.buttonContainer} onPress={this.handleDelete}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonContainer} onPress={this.handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
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
    flexGrow: 1,
    backgroundColor: '#2980b9',
    paddingVertical: 15,
    marginLeft: 5,
    marginRight: 5
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

ProfileScreen.propTypes = {
  appLogoutCB: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    session: state.app.session,
    user: state.profile.user,
    isLoading: state.profile.isLoading
  }
}

export default connect(mapStateToProps)(ProfileScreen)
