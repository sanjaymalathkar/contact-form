const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const WeatherData = require('./public/src/models/WeatherData');


// MongoDB Connection
mongoose.connect //ADD YOUR MONGODB URI, {
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


// Contact Page Route
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/contact.html')); // Serve the "Contact" page
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
