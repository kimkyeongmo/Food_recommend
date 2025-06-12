import { AppRegistry } from 'react-native';
import App from './frontend/App'; // ✅ App.tsx를 등록
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
