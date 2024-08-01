import axios from "axios";
import { doLogoutAction } from "../redux/account/accountSlice";
import { message } from "antd";
import { useDispatch } from "react-redux";

// Create Axios instance
const instance = axios.create({
    baseURL: `https://apilandinvest.gachmen.org`,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
});

// export const refreshAccessToken = async (id) => {
//   try {
//       const response = await instance.post(`/refresh_token/${id}`);
//       const { access_token } = response.data;
      
//       // Cập nhật access token mới vào local storage hoặc cookies
//       localStorage.setItem('access_token', access_token);
      
//       return response.data;
//   } catch (error) {
//       console.error('Refresh token error:', error);
//       throw error;
//   }
// };
// instance.defaults.headers.common = {'Authorization': `Bearer ${localStorage.getItem('access_token')}`}

export const handleRefreshToken = async (userId) => {
  try {
      const res = await instance.post(`/refresh_token/${userId}`);
      console.log(res);
      // console.log('res data refresh token',res);

      if (res && res.data) {
          const access_token = res.data.access_token;
          localStorage.setItem('refresh_token', access_token);
          return access_token;
      }
      return null;
  } catch (error) {
      console.error('Token refresh failed', error);
      return null;
  }
};


// Request interceptor
instance.interceptors.request.use(
  function (config) {
    // Log config before request is sent
    console.log("config", config);
    return config;
  }, 
  function (error) {
    // Handle request error
    return Promise.reject(error);
  }
);

const NO_RETRY_HEADER = 'x-no-retry';

// Response interceptor
instance.interceptors.response.use(
    function (response) {
      return response;
    },
    async function  (error) {
      if (error.config && error.response && +error.response.status === 401 && !error.config.headers[NO_RETRY_HEADER]) {
        const access_token = await handleRefreshToken();
        error.config.headers[NO_RETRY_HEADER] = 'true';
        if(access_token) {
          // error.config.headers['Authorization'] = `Bearer ${access_token}`
          // localStorage.setItem('access_token', access_token)
          return instance.request(error.config);
        }
      }
  
      if(error.config && error.response && +error.response.status === 400 && error.config.url === '/refresh_token/249'){
        window.location.href = './login';
      }
      return error?.response?.data ?? Promise.reject(error);
    }
  );
export default instance;
