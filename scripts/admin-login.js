/* ===================================
   SMARTROUTE — ADMIN LOGIN SCRIPT
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('adminLoginForm');
  const togglePwdBtn = document.getElementById('togglePwd');
  const passwordInput = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginSpinner = document.getElementById('loginSpinner');

  // Toggle Password Visibility
  if (togglePwdBtn && passwordInput) {
    togglePwdBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    });
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('adminUsername').value.trim();
      const password = passwordInput.value.trim();

      loginError.style.display = 'none';
      loginBtnText.textContent = 'Authenticating...';
      if (loginSpinner) loginSpinner.style.display = 'inline-block';

      setTimeout(() => {
        // Validate credentials (admin / admin123 or demo mode)
        if (username.toLowerCase() === 'admin' && password === 'admin123') {
          sessionStorage.setItem('smartroute_admin_logged_in', 'true');
          sessionStorage.setItem('smartroute_admin_user', username);
          window.location.href = 'admin-dashboard.html';
        } else {
          loginBtnText.textContent = 'Sign In to Admin Panel';
          if (loginSpinner) loginSpinner.style.display = 'none';
          loginError.style.display = 'flex';
        }
      }, 600);
    });
  }
});
