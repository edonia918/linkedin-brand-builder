// Auth form functionality
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');
  const loading = document.getElementById('authLoading');
  const success = document.getElementById('authSuccess');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Show corresponding form
      forms.forEach(form => form.classList.remove('active'));
      document.getElementById(targetTab + 'Form').classList.add('active');

      // Hide loading and success states
      loading.style.display = 'none';
      success.style.display = 'none';
    });
  });

  // Password strength indicator
  const passwordInput = document.getElementById('signupPassword');
  const strengthIndicator = document.getElementById('passwordStrength');

  passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    let feedback = '';

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (password.length === 0) {
      strengthIndicator.style.display = 'none';
    } else {
      strengthIndicator.style.display = 'block';
      if (strength < 3) {
        strengthIndicator.className = 'password-strength weak';
        feedback = 'Weak - Add uppercase, numbers, or symbols';
      } else if (strength < 4) {
        strengthIndicator.className = 'password-strength medium';
        feedback = 'Medium - Add one more element for stronger security';
      } else {
        strengthIndicator.className = 'password-strength strong';
        feedback = 'Strong password!';
      }
      strengthIndicator.textContent = feedback;
    }
  });

  // Form validation and submission
  function showError(formId, message) {
    const errorDiv = document.getElementById(formId + 'Error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'flex';
  }

  function hideError(formId) {
    document.getElementById(formId + 'Error').style.display = 'none';
  }

  function setSessionAuth(user, token) {
    sessionStorage.setItem('launchbrandCurrentUser', JSON.stringify(user));
    if (token) sessionStorage.setItem('launchbrandToken', token);
  }

  async function handleAuthSuccess(user, token) {
    setSessionAuth(user, token);
    window.location.href = 'workspace.html';
  }

  // Sign in form
  signinForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideError('signin');

    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    if (!email || !password) {
      showError('signin', 'Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showError('signin', 'Please enter a valid email address.');
      return;
    }

    signinForm.style.display = 'none';
    loading.style.display = 'flex';

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Sign in failed');
      }

      await handleAuthSuccess(data.user || { email }, data.token);
    } catch (error) {
      loading.style.display = 'none';
      signinForm.style.display = 'block';
      showError('signin', error.message || 'Sign in failed');
    }
  });

  // Sign up form
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideError('signup');

    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showError('signup', 'Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showError('signup', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      showError('signup', 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showError('signup', 'Passwords do not match.');
      return;
    }

    signupForm.style.display = 'none';
    loading.style.display = 'flex';

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Account creation failed');
      }

      setSessionAuth(data.user || { firstName, lastName, email }, data.token);
      window.location.href = 'workspace.html';
    } catch (error) {
      loading.style.display = 'none';
      signupForm.style.display = 'block';
      showError('signup', error.message || 'Account creation failed');
    }
  });
});
