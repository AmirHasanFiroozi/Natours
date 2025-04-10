/* eslint-disable */
import axios from 'axios';
import { alert } from './alert.mjs';

/// type can be 'password' and 'data'
export const updateSettings = async (data , type) => {
  try {
    const url = type === 'password' ? 'http://localhost:3000/api/v1/users/updatepassword': 'http://localhost:3000/api/v1/users/updateme';
    
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if(res.data.status === 'success'){
        alert(`${type.toUpperCase()} data is successfully changed` , 'success');
        location.reload(true);
    }
  } catch (err) {
    console.log(err)
    alert(err.response.message , 'error' )
  }
};
