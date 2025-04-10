/* eslint-disable */
/// Any code tht related to the give element from the page we write here

import { logout } from './logout.mjs';
import { login } from './login.mjs';
import { updateSettings } from './changeData.mjs';

const form_login = document.querySelector('.form-login');
const logoutBut = document.querySelector('.nav__el--logout');
const form_user_data = document.querySelector('.form-user-data');
const form_password_data = document.querySelector('.form-password-data');

if (form_login)
  form_login.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });

if (logoutBut) logoutBut.addEventListener('click', logout);

if (form_user_data) {
  form_user_data.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const form = new FormData();
    form.append('name' ,document.getElementById('name').value )
    form.append('email' , document.getElementById('email').value)
    form.append('photo' , document.getElementById('photo').files[0]/* because it's just one file */)

    document.querySelector('.button-data-from').textContent = 'processing ...';

    await updateSettings(form, 'data');

    document.querySelector('.button-change-pass').textContent = 'save settings';
  });
}

if (form_password_data) {
  form_password_data.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    document.querySelector('.button-change-pass').textContent = 'processing ...';

    /// this is return a promise so we can await that till the process is going to finish and after that we can delete the input's value
    await updateSettings({ currentPassword, password, passwordConfirm }, 'password');

    document.querySelector('.button-change-pass').textContent = 'save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
