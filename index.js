/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { enableScreens, enableFreeze } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// Optimize navigation performance and animations
enableScreens(true);
enableFreeze(true);

AppRegistry.registerComponent(appName, () => App);
