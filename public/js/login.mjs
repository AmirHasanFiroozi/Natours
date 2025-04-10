/// eslint give us error here because eslint config just for node.js but here we write frontend code not node.js
/*eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import { alert , hideAlert } from './alert.mjs';
import User from '../../Model/userModel';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      alert('you are successfully logged in' , 'success');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (error) {
    alert(error.response.data.message , 'error');
  }
};
