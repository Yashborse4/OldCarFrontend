# Car Marketplace - React Native App

A comprehensive car marketplace mobile application built with React Native, featuring car buying/selling, dealer networks, real-time chat, and vehicle analytics.

## 🚗 Features

### Core Features
- **User Authentication**: Secure login/register with forgot password functionality
- **Car Listings**: Browse, search, and filter car listings with detailed information
- **Vehicle Management**: Add, edit, and manage personal vehicle inventory
- **Real-time Chat**: Integrated messaging system for buyers and sellers
- **Dealer Dashboard**: Specialized interface for car dealers
- **Vehicle Analytics**: Comprehensive analytics and statistics for vehicles
- **Location Services**: Geolocation integration for local listings
- **Image Handling**: Advanced image picker and management

### Advanced Features
- **Network-aware UI**: Handles offline/online states gracefully
- **Dark/Light Theme**: Toggle between themes with system preference support
- **Group Chat**: Create and manage group conversations
- **Vehicle Search**: Advanced search with filters and sorting
- **Garage Management**: Personal vehicle collection management
- **Dealer Networks**: Specialized tools for automotive dealers

## 🛠 Tech Stack

- **Framework**: React Native 0.81.1
- **Language**: TypeScript
- **Navigation**: React Navigation 7.x with Stack Navigator
- **State Management**: React Context API
- **Network**: Axios for HTTP requests
- **Real-time**: STOMP.js for WebSocket connections
- **UI Components**: Custom component library with responsive design
- **Animation**: React Native Reanimated
- **Styling**: Linear gradients and responsive font sizing
- **Security**: React Native Keychain for secure storage
- **Testing**: Jest with React Native Testing Library

## 📱 Screenshots & Demo

*Screenshots and demo videos will be added here*

## 🚀 Getting Started

### Prerequisites

Make sure you have completed the [React Native development environment setup](https://reactnative.dev/docs/set-up-your-environment) before proceeding.

**Required:**
- Node.js >= 20
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yashborse4/OldCarFrontend.git
   cd OldCarFrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

4. **Android Setup**
   - Make sure Android Studio is installed
   - Start an Android emulator or connect a physical device

### Running the App

1. **Start Metro Bundler**
   ```bash
   npm start
   # or
   yarn start
   ```

2. **Run on Android**
   ```bash
   npm run android
   # or
   yarn android
   ```

3. **Run on iOS** (macOS only)
   ```bash
   npm run ios
   # or
   yarn ios
   ```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card)
│   ├── chat/           # Chat-related components
│   └── dashboard/      # Dashboard-specific components
├── screens/            # Application screens
│   ├── auth/          # Authentication screens
│   ├── car/           # Car-related screens
│   ├── chat/          # Chat screens
│   ├── dealer/        # Dealer-specific screens
│   └── main/          # Main app screens
├── navigation/         # Navigation configuration
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── services/          # API services and utilities
└── theme/             # Theme configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=your_backend_api_url
WEBSOCKET_URL=your_websocket_url
```

### Network Configuration

The app includes network-aware features that handle:
- Offline state detection
- Automatic retry mechanisms
- Cached data display when offline

## 📱 Key Screens

- **Dashboard**: Main hub with car listings and quick actions
- **Car Details**: Detailed vehicle information with image gallery
- **Chat**: Real-time messaging between users
- **Search**: Advanced search with filters
- **Profile**: User profile and settings
- **Dealer Dashboard**: Specialized interface for dealers
- **Vehicle Analytics**: Charts and statistics

## 🧪 Testing

```bash
# Run tests
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔨 Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
1. Open `ios/CarFinal.xcworkspace` in Xcode
2. Select "Generic iOS Device" as target
3. Product → Archive
4. Follow Xcode's distribution workflow


## 📝 Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run linting:
```bash
npm run lint
# or
yarn lint
```



**Built with ❤️ using React Native**
