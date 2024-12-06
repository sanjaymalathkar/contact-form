const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const WeatherData = require('./public/src/models/WeatherData');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// MongoDB Schema and Model for Contact Form Data
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Weather API Route
app.get('/api/weather', async (req, res) => {
    const { location } = req.query;

    try {
        // Fetch current weather
        const currentWeatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
        const currentWeather = currentWeatherResponse.data;

        // Fetch forecast
        const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
        const forecastData = forecastResponse.data.list.filter((f, index) => index % 8 === 0).slice(0, 5);

        // Prepare response
        const weatherData = {
            current: {
                location: currentWeather.name,
                temperature: currentWeather.main.temp,
                description: currentWeather.weather[0].description,
                humidity: currentWeather.main.humidity,
                windSpeed: currentWeather.wind.speed
            },
            forecast: forecastData.map(day => ({
                date: new Date(day.dt * 1000).toLocaleDateString(),
                temperature: day.main.temp,
                description: day.weather[0].description,
                humidity: day.main.humidity
            }))
        };

        // Save to MongoDB
        const weatherDoc = new WeatherData(weatherData);
        await weatherDoc.save();

        res.json(weatherData);
    } catch (error) {
        console.error('Weather API Error:', error);
        res.status(500).json({ error: 'Weather data fetch failed' });
    }
});

// Contact Form POST Route
app.post('/submit-contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Create a new contact document
    const newContact = new Contact({
        name,
        email,
        message
    });

    try {
        // Save to MongoDB
        await newContact.save();
        res.json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting your message. Please try again later.'
        });
    }
});

// About Page Route
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/about.html')); // Serve the "About" page
});

// Home Page Route
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html')); // Serve the "Home" page
});

// Contact Page Route
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/contact.html')); // Serve the "Contact" page
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
