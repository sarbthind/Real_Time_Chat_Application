import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5000', // Backend URL
  baseURL: 'https://real-time-chat-app-backend-kob0.onrender.com', // Backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;
