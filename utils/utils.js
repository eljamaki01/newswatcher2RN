import React from 'react';
import { Alert } from 'react-native';

export function toHours(date) {
  var d1 = date;
  var d2 = Date.now();
  var diff = Math.floor((d2 - d1) / 3600000);
  if (diff === 0 || diff < 2) {
    return "1 hour ago";
  } else {
    return diff.toString() + " hours ago";
  }
}

export function fetchMyNews(dispatch, userId, token) {
  dispatch({ type: 'REQUEST_NEWS' });
  fetch(`https://www.newswatcher2rweb.com/api/users/${userId}`, {
    method: 'GET',
    headers: new Headers({
      'x-auth': token
    }),
    cache: 'default'
  })
    .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
    .then(response => {
      if (!response.ok || response.status !== 200) {
        throw new Error(response.json.message);
      }
      for (var i = 0; i < response.json.newsFilters.length; i++) {
        for (var j = 0; j < response.json.newsFilters[i].newsStories.length; j++) {
          response.json.newsFilters[i].newsStories[j].hours = toHours(response.json.newsFilters[i].newsStories[j].date);
        }
      }
      dispatch({ type: 'RECEIVE_NEWS_SUCCESS', newsFilters: response.json.newsFilters });
      dispatch({ type: 'MSG_DISPLAY', msg: "News fetched" });
    })
    .catch(error => {
      dispatch({ type: 'MSG_DISPLAY', msg: `News fetch failed: ${error.message}` });
      Alert.alert(`News fetch failed: ${error.message}`);
    });
}

export function fetchMyProfile(dispatch, userId, token) {
    dispatch({ type: 'REQUEST_PROFILE' });
    fetch(`https://www.newswatcher2rweb.com/api/users/${userId}`, {
      method: 'GET',
      headers: new Headers({
        'x-auth': token
      }),
      cache: 'default'
    })
      .then(r => r.json().then(json => ({ ok: r.ok, status: r.status, json })))
      .then(response => {
        if (!response.ok || response.status !== 200) {
          throw new Error(response.json.message);
        }
        for (var i = 0; i < response.json.newsFilters.length; i++) {
          response.json.newsFilters[i].keywordsStr = response.json.newsFilters[i].keyWords.join(',');
        }
        dispatch({ type: 'RECEIVE_PROFILE_SUCCESS', user: response.json });
        dispatch({ type: 'MSG_DISPLAY', msg: "Profile fetched" });
      })
      .catch(error => {
        dispatch({ type: 'MSG_DISPLAY', msg: `Profile fetch failed: ${error.message}` });
        Alert.alert(`Profile fetch failed: ${error.message}`);
      });
}
