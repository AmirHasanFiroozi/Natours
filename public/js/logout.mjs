/* eslint-disable */
import axios from 'axios';
import { alert } from './alert.mjs';

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    console.log(res)

    /// The location.reload(true) method is used in JavaScript to reload the current page
    /// What location.reload(true) Does:
    /// Forces a hard refresh - The true parameter makes the browser reload the page from the server, bypassing the cache
    /// Equivalent to Ctrl+F5 or Shift+Reload in most browsers
    /// Fetches all resources fresh from the server (HTML, CSS, JS, images, etc.)
    /// Important Notes:
    /// This is now deprecated in modern browsers. The forceGet parameter (the true value) is no longer supported in most current browsers.
    /// Modern alternative: Just use location.reload() without parameters, or implement cache-busting techniques if you need to ensure fresh content.
    if (res.data.status === "success") location.reload(true);
  } catch (err) {
    alert(err.response.data.message, 'error');
  }
};
