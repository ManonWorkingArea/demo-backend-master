// userActivity.js

import axios from 'axios';
import Cookies from 'js-cookie';

export function login() {
  // Check if user has logged in before
  const userData = Cookies.get('user');
  if (!userData) {
    // If user is logging in for the first time, store their unique data in a cookie
    const uniqueUserData = generateUniqueUserData();
    Cookies.set('user', uniqueUserData);

    // Record user activity in API or database
    recordUserActivity('first', uniqueUserData);
  } else {
    const username = 'username_here'; // Replace with actual username

    if (userData === username) {
      // If the username in the cookie matches the current user's username, it's a repeated login
      recordUserActivity('same', userData);
    } else {
      // If the username in the cookie doesn't match the current user's username, it's an error
      recordUserActivity('error', userData);
    }
  }

  // Get user's IP address and track IP location
  getUserIP();
}

function generateUniqueUserData() {
  // Generate some unique user data (e.g., UUID, timestamp, etc.)
  return 'unique_user_data_here';
}

async function recordUserActivity(type, userData) {
  try {
    // Send a request to your API to record user activity
    await axios.post('/record-activity', { type, userData });
  } catch (error) {
    console.error('Error recording user activity:', error);
  }
}

async function getUserIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    const userIP = response.data.ip;
    // Call IP Geolocation API to get user's location
    getLocation(userIP);
  } catch (error) {
    console.error('Error getting user IP:', error);
  }
}

async function getLocation(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const { city, region, country_name, latitude, longitude } = response.data;
    // Record user's location in API or database
    recordLocation(city, region, country_name, latitude, longitude);
  } catch (error) {
    console.error('Error getting user location:', error);
  }
}

async function recordLocation(city, region, country, latitude, longitude) {
  try {
    // Send a request to your API to record user's location
    await axios.post('/record-location', { city, region, country, latitude, longitude });
  } catch (error) {
    console.error('Error recording user location:', error);
  }
}
