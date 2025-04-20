# DailyDeck

DailyDeck is a modern, feature-rich dashboard application that helps you stay organized and productive throughout your day.

## Features

- **Dynamic Clock & Greeting**: Displays current time and personalized greetings
- **Weather Updates**: Real-time weather information based on your location
- **Daily Quotes**: Inspirational quotes that refresh periodically
- **Todo List**: Manage your daily tasks with ease
- **Focus Setting**: Set and track your main focus for the day
- **Calendar Widget**: View upcoming events at a glance
- **Fun Facts**: Daily interesting facts to learn something new
- **Music Player**: Built-in music player with relaxing tracks
- **Voice Control**: Hands-free operation with voice commands
- **Theme Toggle**: Switch between light and dark themes
- **Beautiful Backgrounds**: Dynamic backgrounds from Unsplash

## Voice Commands

- "add task [task name]"
- "delete task [number]"
- "list tasks"
- "clear tasks"
- "weather"
- "time"
- "date"
- "focus"
- "set focus [focus text]"
- "quote"
- "new quote"
- "toggle theme"
- "help"

## Setup

1. Clone the repository
2. Replace API keys in `script.js`:
   ```javascript
   const WEATHER_API_KEY = 'your_openweather_api_key';
   const UNSPLASH_API_KEY = 'your_unsplash_api_key';
   ```
3. Open `index.html` in a modern web browser

## API Keys Required

- [OpenWeather API](https://openweathermap.org/api)
- [Unsplash API](https://unsplash.com/developers)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Speech API
- Local Storage API
- Various Web APIs (Geolocation, etc.)

## Features in Detail

### Weather Widget
- Real-time weather updates
- Temperature in Celsius/Fahrenheit
- Location-based forecasts

### Todo List
- Add/remove tasks
- Mark tasks as complete
- Persistent storage

### Music Player
- Built-in playlist
- Play/pause/skip controls
- Keyboard shortcuts

### Voice Assistant
- Natural language commands
- Voice feedback
- Easy task management

## Keyboard Shortcuts

- `Space`: Toggle music play/pause
- `Alt + ←`: Previous track
- `Alt + →`: Next track
- `Alt + Space`: Toggle voice control

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Weather data provided by OpenWeather
- Background images from Unsplash
- Icons from Font Awesome
