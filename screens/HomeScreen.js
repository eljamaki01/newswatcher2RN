import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
  ScrollView,
  Alert
} from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
// import Touchable from 'react-native-platform-touchable';

function toHours(date) {
  var d1 = date;
  var d2 = Date.now();
  var diff = Math.floor((d2 - d1) / 3600000);
  if (diff === 0 || diff < 2) {
    return "1 hour ago";
  } else {
    return diff.toString() + " hours ago";
  }
}

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true, news: null };
  }

  componentDidMount() {
    return fetch('https://www.newswatcher2rweb.com/api/homenews', {
      method: 'GET',
      cache: 'default'
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
      .then(response => {
        if (!response.ok || response.status !== 200) {
          throw new Error(response.json.message);
        }
        for (var i = 0; i < response.json.length; i++) {
          response.json[i].hours = toHours(response.json[i].date);
        }
        this.setState({
          isLoading: false,
          news: response.json
        });
        // this.props.dispatch({ type: 'MSG_DISPLAY', msg: "Home Page news fetched" });
      })
      .catch(error => {
        this.props.dispatch({ type: 'MSG_DISPLAY', msg: `Home News fetch failed: ${error.message}` });
        Alert.alert(`Home News fetch failed: ${error.message}`);
      });
  }

  onStoryPress = (story) => {
    WebBrowser.openBrowserAsync(story.link);
  };

  onNYTPress = () => {
    WebBrowser.openBrowserAsync('https://developer.nytimes.com');
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <Text>Loading home page news...</Text>
        </View>
      );
    }

    let TouchableElement = TouchableHighlight;

    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }
    // For the Image try resizeMode="contain" and "cover"

    return (
      <View>
        <ScrollView>
          {this.state.news.map((newsStory, idx) =>
            <TouchableElement key={idx} onPress={() => this.onStoryPress(newsStory)}>
              <View style={styles.row}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: newsStory.imageUrl }} style={styles.storyImage} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.storyTitle} numberOfLines={2}>
                    {newsStory.title}
                  </Text>
                  <Text style={styles.storySnippet} numberOfLines={3}>
                    {newsStory.contentSnippet}
                  </Text>
                  <Text style={styles.storySourceHours}>
                    {newsStory.source} - {newsStory.hours}
                  </Text>
                </View>
              </View>
            </TouchableElement>
          )}
          <TouchableElement key={this.state.news.length} onPress={() => this.onNYTPress()}>
            <View style={styles.row}>
              <Image source={require('../assets/images/poweredby_nytimes_30b.png')} />
              <View style={styles.textContainer}>
                <Text style={styles.storyTitle} numberOfLines={2}>
                  Data provided by The New York Times
                </Text>
              </View>
            </View>
          </TouchableElement>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    borderStyle: 'solid',
    borderBottomColor: '#dddddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 5,
  },
  imageContainer: {
    backgroundColor: '#dddddd',
    width: 90,
    height: 90,
    marginRight: 10
  },
  textContainer: {
    flex: 1,
  },
  storyImage: {
    width: 90,
    height: 90,
  },
  storyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  storySnippet: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
  },
  storySourceHours: {
    fontSize: 12,
    color: 'gray',
  },
});