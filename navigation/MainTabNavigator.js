import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';

import HomeScreen from '../screens/HomeScreen';
import MyNewsScreen from '../screens/MyNewsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';

const HomeStack = createStackNavigator({
  screen: HomeScreen
});

HomeStack.navigationOptions = {
  tabBarLabel: 'HomeNews',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-home${focused ? '' : '-outline'}` : 'md-home'}
    />
  )
};

const MyNewsStack = createStackNavigator({
  screen: MyNewsScreen
});

MyNewsStack.navigationOptions = {
  tabBarLabel: 'MyNews',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-funnel${focused ? '' : '-outline'}` : 'md-funnel'}
    />
  )
};

const ProfileStack = createStackNavigator({
  screen: ProfileScreen
});

ProfileStack.navigationOptions = {
  tabBarLabel: 'NewsFilters',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options'}
    />
  )
};

const LoginStack = createStackNavigator({
  screen: LoginScreen
});

LoginStack.navigationOptions = {
  tabBarLabel: 'Account',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-person${focused ? '' : '-outline'}` : 'md-person'}
    />
  )
};


export default createBottomTabNavigator({
  HomeStack,
  MyNewsStack,
  ProfileStack,
  LoginStack
});
