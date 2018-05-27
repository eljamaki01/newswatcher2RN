import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import Colors from '../constants/Colors';

import HomeScreen from '../screens/HomeScreen';
import MyNewsScreen from '../screens/MyNewsScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';

export default TabNavigator(
  {
    HomeNews: {
      screen: HomeScreen,
    },
    MyNews: {
      screen: MyNewsScreen,
    },
    NewsFilters: {
      screen: ProfileScreen,
    },
    Account: {
      screen: LoginScreen,
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'HomeNews':
            iconName =
              Platform.OS === 'ios' ? `ios-home${focused ? '' : '-outline'}`
                : 'md-home';
            break;
          case 'MyNews':
            iconName =
              Platform.OS === 'ios' ? `ios-funnel${focused ? '' : '-outline'}`
                : 'md-funnel';
            break;
          case 'NewsFilters':
            iconName =
              Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}`
                : 'md-options';
            break;
          case 'Account':
            iconName =
              Platform.OS === 'ios' ? `ios-person${focused ? '' : '-outline'}`
                : 'md-person';
        }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{ marginBottom: -3 }}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
          />
        );
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
  }
);
