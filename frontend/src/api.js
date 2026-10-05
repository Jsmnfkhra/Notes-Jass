import axios from 'axios';

// Arahkan alamat ke server backend yang sedang berjalan
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Otomatis selipkan token login di setiap permintaan
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('noteflow_token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;