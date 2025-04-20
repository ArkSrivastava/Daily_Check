// Real API keys - Replace with your own
const WEATHER_API_KEY = '1d5f24494ddafe96d6834bcdf95da862';
const UNSPLASH_API_KEY = '6ZxX3clhPNiLOzeab11GePNwmhGGYWQp2aWFdcVSf_I'; // Replace with your key

// Update clock and greeting
function updateTime() {
    const now = new Date();
    const timeDisplay = document.getElementById('time');
    const greetingDisplay = document.getElementById('greeting');
    
    timeDisplay.textContent = now.toLocaleTimeString();
    
    const hour = now.getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    
    greetingDisplay.textContent = greeting;
}

// Set random background
async function setRandomBackground() {
    try {
        const topics = 'nature,landscape,space';
        const response = await fetch(
            `https://api.unsplash.com/photos/random?topics=${topics}&orientation=landscape&client_id=${UNSPLASH_API_KEY}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch background');
        
        const data = await response.json();
        const bgImage = document.getElementById('bg-image');
        const newImage = document.createElement('div');
        
        // Set up new image
        newImage.style.cssText = bgImage.style.cssText;
        newImage.style.backgroundImage = `url(${data.urls.regular})`;
        newImage.style.opacity = '0';
        
        // Update attribution
        document.getElementById('photo-credit').href = data.user.links.html;
        document.getElementById('photo-credit').textContent = data.user.name;
        
        // Transition images
        bgImage.parentNode.appendChild(newImage);
        await new Promise(resolve => setTimeout(resolve, 100));
        newImage.style.opacity = '1';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        bgImage.remove();
        newImage.id = 'bg-image';
        
    } catch (error) {
        console.error('Background error:', error);
        // Fallback gradients
        const gradients = [
            'linear-gradient(45deg, #2c3e50, #3498db)',
            'linear-gradient(45deg, #16a085, #2980b9)',
            'linear-gradient(45deg, #2c3e50, #e74c3c)'
        ];
        document.body.style.backgroundImage = gradients[Math.floor(Math.random() * gradients.length)];
    }
}

// Get weather
async function getWeather(retryCount = 0) {
    const weatherSection = document.querySelector('.weather-section');
    weatherSection.classList.add('loading');
    
    try {
        console.log('Fetching weather data...');
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                maximumAge: 300000
            });
        });
        
        const { latitude, longitude } = position.coords;
        console.log(`Location obtained: ${latitude}, ${longitude}`);
        
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate weather data
        if (!data.weather?.[0] || !data.main?.temp || !data.name) {
            throw new Error('Invalid weather data received');
        }
        
        console.log('Weather data:', data);
        
        const weatherIcon = document.querySelector('.weather-icon');
        weatherIcon.className = `fas ${getWeatherIcon(data.weather[0].main)} weather-icon`;
        
        const tempC = Math.round(data.main.temp);
        const tempF = Math.round((tempC * 9/5) + 32);
        const unit = localStorage.getItem('tempUnit') || 'C';
        
        document.getElementById('temp').textContent = `${unit === 'C' ? tempC : tempF}°${unit}`;
        document.getElementById('temp').onclick = () => {
            const newUnit = unit === 'C' ? 'F' : 'C';
            localStorage.setItem('tempUnit', newUnit);
            document.getElementById('temp').textContent = `${newUnit === 'C' ? tempC : tempF}°${newUnit}`;
        };
        
        document.getElementById('location').textContent = data.name;
        document.getElementById('description').textContent = data.weather[0].description;
        
    } catch (error) {
        console.error('Weather error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        let errorMessage = 'Weather unavailable';
        if (error.code === 1) errorMessage = 'Location access denied';
        else if (error.code === 2) errorMessage = 'Location unavailable';
        else if (error.code === 3) errorMessage = 'Location timeout';
        
        document.getElementById('weather').innerHTML = `<p>${errorMessage}</p>`;
        
        // Retry logic for network errors
        if (retryCount < 2 && !error.code) {
            console.log(`Retrying weather fetch... Attempt ${retryCount + 1}`);
            setTimeout(() => getWeather(retryCount + 1), 3000);
        }
    } finally {
        weatherSection.classList.remove('loading');
    }
}

function getWeatherIcon(weather) {
    const icons = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Snow': 'fa-snowflake',
        'Thunderstorm': 'fa-bolt',
        'Drizzle': 'fa-cloud-rain',
        'Mist': 'fa-smog',
        'Haze': 'fa-smog',
        'Fog': 'fa-smog',
        'Dust': 'fa-smog',
        'Sand': 'fa-smog',
        'Ash': 'fa-smog',
        'Squall': 'fa-wind',
        'Tornado': 'fa-wind'
    };
    return icons[weather] || 'fa-cloud';
}

// Local quotes database
const quotes = [
    { content: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { content: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { content: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
    { content: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { content: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { content: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
    // Add 90 more quotes here...
];

// Modified quote function to use local database
async function getQuote() {
    const quoteSection = document.querySelector('.quote-section');
    quoteSection.classList.add('loading');
    
    try {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const quoteElement = document.getElementById('quote');
        const authorElement = document.getElementById('author');
        
        // Add fade out effect
        quoteElement.style.opacity = '0';
        authorElement.style.opacity = '0';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        quoteElement.textContent = randomQuote.content;
        authorElement.textContent = `- ${randomQuote.author}`;
        
        // Add fade in effect
        quoteElement.style.transition = 'opacity 0.5s ease';
        authorElement.style.transition = 'opacity 0.5s ease';
        quoteElement.style.opacity = '1';
        authorElement.style.opacity = '1';
        
    } catch (error) {
        console.error('Quote error:', error);
    } finally {
        quoteSection.classList.remove('loading');
    }
}

// Add quote refresh button handler
document.getElementById('refresh-quote').addEventListener('click', () => {
    getQuote();
});

// Todo list functionality
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${todo}</span>
            <div class="todo-actions">
                <button class="icon-button" onclick="completeTodo(${index})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="icon-button" onclick="deleteTodo(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

function completeTodo(index) {
    const li = todoList.children[index];
    li.classList.toggle('completed');
    li.style.animation = 'scaleIn 0.3s ease';
}

function deleteTodo(index) {
    const li = todoList.children[index];
    li.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }, 300);
}

todoForm.onsubmit = (e) => {
    e.preventDefault();
    const todo = todoInput.value.trim();
    if (todo) {
        todos.push(todo);
        saveTodos();
        renderTodos();
        todoInput.value = '';
    }
};

// Focus functionality
const focusInput = document.getElementById('focus-input');
focusInput.value = localStorage.getItem('focus') || '';
focusInput.onchange = () => {
    localStorage.setItem('focus', focusInput.value);
};

// Enhanced scroll handling
function handleScroll() {
    const scrollTop = document.querySelector('.scroll-top');
    const sections = document.querySelectorAll('.section');
    
    // Enhanced scroll button visibility
    const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if (scrollProgress > 0.1) {
        scrollTop.classList.add('visible');
        scrollTop.style.transform = `scale(${1 + scrollProgress * 0.2})`;
    } else {
        scrollTop.classList.remove('visible');
        scrollTop.style.transform = 'scale(1)';
    }
    
    // Enhanced section animations
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const visible = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;
        
        if (visible) {
            section.classList.add('visible');
            section.style.transform = 'translateY(0)';
            section.style.opacity = '1';
        } else {
            section.classList.remove('visible');
            section.style.transform = 'translateY(50px)';
            section.style.opacity = '0';
        }
    });

    const blur = Math.min(20, window.scrollY / 10);
    document.querySelector('.dashboard').style.backdropFilter = `blur(${blur}px)`;
}

// Scroll to top functionality
document.querySelector('.scroll-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add scroll event listener
window.addEventListener('scroll', handleScroll);

// Theme toggle functionality
function initializeTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    document.querySelector('.theme-toggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Progress bar
function updateProgressBar() {
    const progress = document.querySelector('.progress-bar');
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progress.style.width = `${scrolled}%`;
}

// Calendar functionality
function initializeCalendar() {
    const events = [
        { date: '2024-01-20', title: 'Team Meeting', time: '10:00 AM' },
        { date: '2024-01-21', title: 'Project Deadline', time: '5:00 PM' }
    ];
    
    const eventsList = document.getElementById('events-list');
    const today = new Date().toISOString().split('T')[0];
    
    const upcomingEvents = events
        .filter(event => event.date >= today)
        .slice(0, 3);
    
    eventsList.innerHTML = upcomingEvents.map(event => `
        <div class="event-item" style="animation: slideIn 0.3s ease-out">
            <div class="event-time">${event.time}</div>
            <div class="event-title">${event.title}</div>
        </div>
    `).join('');
}

// Music player functionality
const songs = [
    { title: 'Lofi Beat 1', artist: 'Chill Artist', url: 'path/to/song1.mp3' },
    { title: 'Study Music', artist: 'Focus Artist', url: 'path/to/song2.mp3' }
];

let currentSongIndex = 0;
let isPlaying = false;

function togglePlay() {
    const playPauseBtn = document.getElementById('play-pause');
    isPlaying = !isPlaying;
    playPauseBtn.innerHTML = isPlaying ? 
        '<i class="fas fa-pause"></i>' : 
        '<i class="fas fa-play"></i>';
    // Add actual music playing logic here
}

function updateSongInfo() {
    document.getElementById('song-title').textContent = songs[currentSongIndex].title;
    document.getElementById('artist').textContent = songs[currentSongIndex].artist;
}

// Enhanced scroll animations with Intersection Observer
function setupScrollAnimations() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.opacity = '1';
                if (entry.target.classList.contains('section')) {
                    entry.target.classList.add('visible');
                }
            } else {
                entry.target.style.transform = 'translateY(50px)';
                entry.target.style.opacity = '0';
                if (entry.target.classList.contains('section')) {
                    entry.target.classList.remove('visible');
                }
            }
        });
    }, options);

    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        observer.observe(section);
    });
}

// Enhanced scroll handling
function handleScroll() {
    const scrollTop = document.querySelector('.scroll-top');
    const sections = document.querySelectorAll('.section');
    
    // Enhanced scroll button visibility
    const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if (scrollProgress > 0.1) {
        scrollTop.classList.add('visible');
        scrollTop.style.transform = `scale(${1 + scrollProgress * 0.2})`;
    } else {
        scrollTop.classList.remove('visible');
        scrollTop.style.transform = 'scale(1)';
    }
    
    // Enhanced section animations
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const visible = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;
        
        if (visible) {
            section.classList.add('visible');
            section.style.transform = 'translateY(0)';
            section.style.opacity = '1';
        } else {
            section.classList.remove('visible');
            section.style.transform = 'translateY(50px)';
            section.style.opacity = '0';
        }
    });

    const scrolled = window.scrollY;
    const maxBlur = 30;
    const blur = Math.min(maxBlur, scrolled / 10);
    
    requestAnimationFrame(() => {
        document.querySelector('.dashboard').style.backdropFilter = `blur(${blur}px)`;
        document.querySelector('.dashboard').style.background = 
            `rgba(0,0,0,${Math.min(0.7, 0.3 + scrolled / 1000)})`;
    });
}

// Smooth section transitions
function animateSection(section) {
    const elements = section.querySelectorAll('*');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            el.style.transform = 'translateY(0)';
            el.style.opacity = '1';
        }, index * 100);
    });
}

// Fun Facts Database
const funFacts = [
    "A day on Venus is longer than its year.",
    "Honey never spoils. Archaeologists found 3000-year-old honey still preserved.",
    "The shortest war in history lasted 38 minutes.",
    "A cloud can weigh more than a million pounds.",
    "Octopuses have three hearts.",
    // Add more fun facts here
];

// Calendar and Events Management
const events = [
    { date: new Date(), title: 'Today', type: 'current' },
    // Add your events here
];

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

function updateCalendarWidget() {
    const container = document.getElementById('events-list');
    const today = new Date();
    const nextWeek = new Array(7).fill(null).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return date;
    });

    const eventsHTML = nextWeek.map(date => {
        const dateStr = formatDate(date);
        const dayEvents = events.filter(e => 
            formatDate(e.date) === dateStr
        );
        
        return `
            <div class="calendar-day ${date.toDateString() === today.toDateString() ? 'today' : ''}"
                 style="animation: fadeIn 0.5s ease-out ${Math.random() * 0.5}s">
                <div class="date">${dateStr}</div>
                ${dayEvents.map(event => `
                    <div class="event" data-type="${event.type}">
                        ${event.title}
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');

    container.innerHTML = eventsHTML;
}

// Fun Fact Display
function updateFunFact() {
    const funFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    const funFactContainer = document.getElementById('fun-fact');
    
    funFactContainer.style.opacity = '0';
    setTimeout(() => {
        funFactContainer.textContent = funFact;
        funFactContainer.style.opacity = '1';
    }, 300);
}

// Initialize with smooth loading sequence
document.addEventListener('DOMContentLoaded', async () => {
    updateTime();
    await Promise.all([
        setRandomBackground(),
        getWeather(),
        getQuote()
    ]);
    handleScroll(); // Initial check for visible sections
    initializeTheme();
    window.addEventListener('scroll', updateProgressBar);
    initializeCalendar();
    updateSongInfo();
    
    // Add music control listeners
    document.getElementById('play-pause').onclick = togglePlay;
    document.getElementById('next-track').onclick = () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        updateSongInfo();
    };
    document.getElementById('prev-track').onclick = () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        updateSongInfo();
    };

    setupScrollAnimations();
    document.querySelectorAll('.section').forEach(section => {
        animateSection(section);
    });

    updateCalendarWidget();
    updateFunFact();
});

// Debounced scroll handler for better performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.addEventListener('scroll', debounce(handleScroll, 10));

// Refresh data periodically
setInterval(updateTime, 1000);
setInterval(getWeather, 300000); // Every 5 minutes
setInterval(getQuote, 3600000); // Every hour
setInterval(setRandomBackground, 1800000); // Every 30 minutes

// Audio Player functionality
const playlist = [
    {
        title: 'Lofi Study',
        artist: 'ChillBeats',
        url: 'https://mp3.chillhop.com/serve.php/?mp3=10075'
    },
    {
        title: 'Peaceful Piano',
        artist: 'RelaxingTime',
        url: 'https://mp3.chillhop.com/serve.php/?mp3=9272'
    },
    {
        title: 'Morning Coffee',
        artist: 'Aiguille',
        url: 'https://mp3.chillhop.com/serve.php/?mp3=9148'
    }
];

class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = 0;
        this.isPlaying = false;
        
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('error', () => this.handleError());
        this.audio.addEventListener('loadstart', () => this.handleLoading());
        this.audio.addEventListener('canplay', () => this.handleCanPlay());
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
    }

    next() {
        this.currentTrack = (this.currentTrack + 1) % playlist.length;
        this.loadAndPlay();
    }

    prev() {
        this.currentTrack = (this.currentTrack - 1 + playlist.length) % playlist.length;
        this.loadAndPlay();
    }

    loadAndPlay() {
        const track = playlist[this.currentTrack];
        this.audio.src = track.url;
        this.audio.load();
        this.audio.play();
        this.isPlaying = true;
        this.updateTrackInfo();
        this.updatePlayButton();
    }

    updateTrackInfo() {
        const track = playlist[this.currentTrack];
        document.getElementById('song-title').textContent = track.title;
        document.getElementById('artist').textContent = track.artist;
    }

    updatePlayButton() {
        const playPauseBtn = document.getElementById('play-pause');
        playPauseBtn.innerHTML = this.isPlaying ? 
            '<i class="fas fa-pause"></i>' : 
            '<i class="fas fa-play"></i>';
    }

    handleError() {
        console.error('Audio playback error');
        document.getElementById('song-title').textContent = 'Error playing track';
        document.getElementById('artist').textContent = 'Please try again';
    }

    handleLoading() {
        document.getElementById('song-title').textContent = 'Loading...';
    }

    handleCanPlay() {
        this.updateTrackInfo();
    }
}

// Initialize audio player
const player = new AudioPlayer();

// Add music control listeners
document.getElementById('play-pause').addEventListener('click', () => player.togglePlay());
document.getElementById('next-track').addEventListener('click', () => player.next());
document.getElementById('prev-track').addEventListener('click', () => player.prev());

// Add keyboard controls for music
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        player.togglePlay();
    } else if (e.code === 'ArrowRight' && e.altKey) {
        player.next();
    } else if (e.code === 'ArrowLeft' && e.altKey) {
        player.prev();
    }
});

// Refresh fun fact periodically
setInterval(updateFunFact, 1800000); // Every 30 minutes

// Voice Assistant class with error handling
class VoiceAssistant {
    constructor() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported');
            }
            this.recognition = new SpeechRecognition();
            this.synthesis = window.speechSynthesis;
            this.isListening = false;
            this.setupRecognition();
            this.setupCommands();
            
            // Ensure microphone icon is visible initially
            this.updateUI(false);
        } catch (error) {
            console.error('Voice Assistant Error:', error);
            this.showError('Voice commands are not supported in this browser');
        }
    }

    setupRecognition() {
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI(true);
            this.showStatus('Listening...');
        };

        this.recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            console.log('Voice command received:', command);
            this.handleCommand(command);
        };

        this.recognition.onerror = (event) => {
            console.error('Voice Recognition Error:', event.error);
            this.showError(`Error: ${event.error}`);
            this.updateUI(false);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI(false);
            this.showStatus('');
        };
    }

    setupCommands() {
        this.commands = {
            'add task': (text) => {
                const task = text.replace('add task', '').trim();
                if (task) {
                    todos.push(task);
                    saveTodos();
                    renderTodos();
                    this.speak(`Added task: ${task}`);
                }
            },
            'delete task': (text) => {
                const index = parseInt(text.match(/\d+/)?.[0] || '1') - 1;
                if (index >= 0 && index < todos.length) {
                    const task = todos[index];
                    deleteTodo(index);
                    this.speak(`Deleted task: ${task}`);
                } else {
                    this.speak("Sorry, I couldn't find that task number");
                }
            },
            'list tasks': () => {
                if (todos.length === 0) {
                    this.speak("You have no tasks on your list");
                    return;
                }
                const taskList = todos.map((task, i) => `Task ${i + 1}: ${task}`).join('. ');
                this.speak(`Here are your tasks: ${taskList}`);
            },
            'clear tasks': () => {
                todos = [];
                saveTodos();
                renderTodos();
                this.speak("All tasks have been cleared");
            },
            'weather': () => {
                const temp = document.getElementById('temp').textContent;
                const desc = document.getElementById('description').textContent;
                const location = document.getElementById('location').textContent;
                this.speak(`The weather in ${location} is ${temp} with ${desc}`);
            },
            'time': () => {
                const time = document.getElementById('time').textContent;
                this.speak(`The current time is ${time}`);
            },
            'date': () => {
                const date = new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                this.speak(`Today is ${date}`);
            },
            'focus': () => {
                const focus = document.getElementById('focus-input').value;
                if (focus) {
                    this.speak(`Your focus for today is ${focus}`);
                } else {
                    this.speak("You haven't set a focus for today");
                }
            },
            'set focus': (text) => {
                const focus = text.replace('set focus', '').trim();
                if (focus) {
                    document.getElementById('focus-input').value = focus;
                    localStorage.setItem('focus', focus);
                    this.speak(`Set your focus to: ${focus}`);
                }
            },
            'quote': () => {
                const quote = document.getElementById('quote').textContent;
                const author = document.getElementById('author').textContent;
                this.speak(`${quote} ${author}`);
            },
            'new quote': () => {
                document.getElementById('refresh-quote').click();
                this.speak('Here is a new quote for you');
            },
            'toggle theme': () => {
                document.querySelector('.theme-toggle').click();
                const theme = document.documentElement.getAttribute('data-theme');
                this.speak(`Switched to ${theme} theme`);
            },
            'help': () => {
                this.speak(`Here are some commands you can use: 
                    add task, delete task, list tasks, clear tasks, 
                    weather, time, date, focus, set focus, quote, 
                    new quote, toggle theme, and help`);
            }
        };
    }

    handleCommand(command) {
        console.log('Processing command:', command);
        let handled = false;

        // Check for exact matches first
        if (this.commands[command]) {
            this.commands[command](command);
            handled = true;
        } else {
            // Check for partial matches
            for (const [key, action] of Object.entries(this.commands)) {
                if (command.includes(key)) {
                    action(command);
                    handled = true;
                    break;
                }
            }
        }

        if (!handled) {
            this.speak(`I didn't understand that command. Say 'help' for a list of commands.`);
        }
    }

    speak(text) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => this.showStatus('Speaking...');
        utterance.onend = () => this.showStatus('');
        utterance.onerror = (error) => this.showError('Speech synthesis error');

        this.synthesis.speak(utterance);
    }

    updateUI(isListening) {
        const button = document.getElementById('voice-control');
        const icon = button.querySelector('i') || document.createElement('i');
        
        button.classList.toggle('active', isListening);
        icon.className = `fas fa-microphone${isListening ? '-slash' : ''}`;
        
        if (!button.contains(icon)) {
            button.appendChild(icon);
        }
        
        // Keep button visible
        button.style.display = 'flex';
    }

    showStatus(message) {
        const status = document.getElementById('voice-status');
        status.textContent = message;
        status.style.opacity = message ? '1' : '0';
    }

    showError(message) {
        console.error(message);
        this.showStatus(message);
        setTimeout(() => this.showStatus(''), 3000);
    }

    toggle() {
        try {
            if (this.isListening) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        } catch (error) {
            this.showError('Voice recognition error. Please try again.');
        }
    }
}

// Initialize voice assistant
const voiceAssistant = new VoiceAssistant();

// Add voice control event listeners
document.getElementById('voice-control').addEventListener('click', () => {
    voiceAssistant.toggle();
});

// Add keyboard shortcut (Alt + Space) for voice control
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.code === 'Space') {
        e.preventDefault();
        voiceAssistant.toggle();
    }
});

// Initialize voice assistant with visible mic
document.addEventListener('DOMContentLoaded', () => {
    // ...existing initialization code...
    
    // Ensure voice control button is visible
    const voiceControl = document.getElementById('voice-control');
    if (voiceControl) {
        voiceControl.style.display = 'flex';
    }
});
