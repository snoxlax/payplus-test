// Signup page JavaScript
document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirmPassword');

  // Real-time password validation
  if (confirmPasswordField) {
    confirmPasswordField.addEventListener('input', function () {
      const password = passwordField.value;
      const confirmPassword = confirmPasswordField.value;
      const matchText = document.getElementById('passwordMatchText');

      if (confirmPassword && password !== confirmPassword) {
        confirmPasswordField.style.borderColor = '#dc3545';
        confirmPasswordField.style.boxShadow =
          '0 0 0 3px rgba(220, 53, 69, 0.1)';
        matchText.textContent = '❌ Passwords do not match';
        matchText.style.color = '#dc3545';
      } else if (confirmPassword && password === confirmPassword) {
        confirmPasswordField.style.borderColor = '#28a745';
        confirmPasswordField.style.boxShadow =
          '0 0 0 3px rgba(40, 167, 69, 0.1)';
        matchText.textContent = '✅ Passwords match';
        matchText.style.color = '#28a745';
      } else {
        confirmPasswordField.style.borderColor = '#e9ecef';
        confirmPasswordField.style.boxShadow = 'none';
        matchText.textContent = '';
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const idNumber = document.getElementById('idNumber').value;

      // Validate passwords match
      if (password !== confirmPassword) {
        document.getElementById('output').innerHTML =
          '<div class="error">❌ Passwords do not match</div>';
        return;
      }

      // Validate ID number on frontend
      if (!/^\d{9}$/.test(idNumber)) {
        document.getElementById('output').innerHTML =
          '<div class="error">❌ ID number must be exactly 9 digits</div>';
        return;
      }

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, idNumber }),
        });
        const data = await res.json();

        if (data.success && data.user) {
          // Store user info and token
          localStorage.setItem('jwt', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Show success and redirect
          document.getElementById(
            'output'
          ).innerHTML = `<div class="success">✅ ${data.message}</div>`;
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          document.getElementById(
            'output'
          ).innerHTML = `<div class="error">❌ ${
            data.error || 'Sign up failed'
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
