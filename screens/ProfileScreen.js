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
import { fetchMyNews } from '../utils/utils';
import { fetchMyProfile } from '../utils/utils';
import ModalDropdown from 'react-native-modal-dropdown';

class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteOK: false,
      selectedValue: '',
      selectedIdx: 0,
      showFilterNameModal: false,
      filterName: ""
    };
  }

  static navigationOptions = {
    header: null
  };

  // Screes are lazy initialized. This will run when navigated at that time and one time only.
  componentDidMount() {
    if (!this.props.session) {
      return;
    }

    fetchMyProfile(this.props.dispatch, this.props.session.userId, this.props.session.token);
  }

  handleAdd = () => {
    const { dispatch } = this.props
    if (this.props.user.newsFilters.length === 5) {
      dispatch({ type: 'MSG_DISPLAY', msg: "No more newsFilters allowed" });
      Alert.alert("No more newsFilters allowed");
    } else {
      var len = this.props.user.newsFilters.length;
      dispatch({ type: 'ADD_FILTER', filterName: this.state.filterName });
      this.setState({ selectedValue: len, selectedIdx: len });
    }
    this.setState({ showFilterNameModal: false });
  }

  handleDelete = () => {
    this.props.dispatch({ type: 'DELETE_FILTER', selectedIdx: this.state.selectedIdx });
    this.setState({ selectedValue: 0, selectedIdx: 0 });
  }

  handleSave = () => {
    const { dispatch } = this.props
    fetch(`https://www.newswatcher2rweb.com/api/users/${this.props.session.userId}`, {
      method: 'PUT',
      headers: new Headers({
        'x-auth': this.props.session.token,
        'Content-Type': 'application/json'
      }),
      cache: 'default',
      body: JSON.stringify(this.props.user)
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
      .then(response => {
        if (!response.ok || response.status !== 200) {
          throw new Error(response.json.message);
        }
        dispatch({ type: 'MSG_DISPLAY', msg: "Profile saved" });
        Alert.alert("Profile save");
        // SInce filter changed, force a refresh of news stories.
        setTimeout(() => {
          fetchMyNews(this.props.dispatch, this.props.session.userId, this.props.session.token);
        }, 2000);
      })
      .catch(error => {
        dispatch({ type: 'MSG_DISPLAY', msg: `Profile save failed: ${error.message}` });
        Alert.alert(`Profile save failed: ${error.message}`);
      });
  }

  handleOnValueChange = (itemIndex, itemValue) => {
    this.setState({ selectedValue: itemValue, selectedIdx: itemIndex });
  }

  _renderFilterNameModal = () => {
    return (
      <Modal
        visible={this.state.showFilterNameModal}
        animationType={'slide'}
        onRequestClose={() => this.setState({ showFilterNameModal: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.formContainer}>
            <Text>Filter Name:</Text>
            <TextInput
              placeHolder="Enter filter name"
              placeHolderTextColor='rgba(255,255,255,0.7)'
              autoCapitalize='none'
              autoCorrect={false}
              style={styles.input}
              onChangeText={(text) => this.setState({ filterName: text })}
            />
            <TouchableOpacity style={styles.buttonContainer} onPress={this.handleAdd}>
              <Text style={styles.buttonText}>Create Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => this.setState({ showFilterNameModal: false })}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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

    const optionsArray = this.props.user.newsFilters.map((filter) => filter.name);

    return (
      <View>
        <Text>News Filters</Text>
        <Picker
          selectedValue={this.state.selectedValue}
          onValueChange={this.handleOnValueChange}>
          {this.props.user.newsFilters.map((filter, idx) =>
            <Picker.Item label={filter.name} key={idx} value={idx} />
          )}
        </Picker>
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View style={styles.formContainer}>
            <Text>Keywords:</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.props.dispatch({ type: 'ALTER_FILTER_KEYWORDS', filterIdx: this.state.selectedIdx, value: text })}
              value={this.props.user.newsFilters[this.state.selectedIdx].keywordsStr}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity disabled={this.props.user.newsFilters.length > 4} style={styles.buttonContainer} onPress={() => this.setState({ showFilterNameModal: true })}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={this.props.user.newsFilters.length < 2} style={styles.buttonContainer} onPress={this.handleDelete}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonContainer} onPress={this.handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
          {this._renderFilterNameModal()}
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3498db'
  },
  formContainer: {
    padding: 20
  },
  pickerText: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginTop: 5,
    marginBottom: 5,
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
