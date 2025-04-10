/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

/// type success or error
export const alert = (message, type) => {
    hideAlert();
  const markup = `<div class='alert alert--${type}'>${message}</div>`;
  document.body.insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(()=> hideAlert() , 5000);
};
