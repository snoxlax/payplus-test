// Signin page JavaScript
document.addEventListener('DOMContentLoaded', function () {
  const signinForm = document.getElementById('signinForm');

  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success && data.token && data.user) {
          // Store user info and token
          localStorage.setItem('jwt', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Show success and redirect
          document.getElementById(
            'output'
          ).innerHTML = `<div class="success">✅ Welcome back, ${data.user.name}!</div>`;
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          document.getElementById(
            'output'
          ).innerHTML = `<div class="error">❌ ${
            data.error || 'Sign in failed'
          }</div>`;
        }
      } catch (error) {
        document.getElementById(
          'output'
        ).innerHTML = `<div class="error">❌ Network error: ${error.message}</div>`;
      }
    });
  }
});
