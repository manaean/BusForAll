import api from '../api/axios';

// Get all routes
const response = await api.get('/api/routes');
console.log(response.data);

// Login
const response = await api.post('/api/auth/login', {
  email: 'admin@busforall.com',
  password: 'password123'
});