// Customer management JavaScript
// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function () {
  checkAuthStatus();
  // Automatically load customers if user is logged in
  loadCustomersIfLoggedIn();
});

function checkAuthStatus() {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('jwt');

  if (user && token) {
    const userData = JSON.parse(user);
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userInfo').style.display = 'block';

    // Show navigation buttons for logged-in users
    const navButtons = [
      'viewCustomers',
      'getUserInfo',
      'getAllUsers',
      'toggleCustomerForm',
    ];
    navButtons.forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.style.display = 'inline-block';
      }
    });
  } else {
    document.getElementById('userInfo').style.display = 'none';

    // Hide navigation buttons for non-logged-in users
    const navButtons = [
      'viewCustomers',
      'getUserInfo',
      'getAllUsers',
      'toggleCustomerForm',
    ];
    navButtons.forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.style.display = 'none';
      }
    });
  }
}

// Automatically load customers if user is logged in
function loadCustomersIfLoggedIn() {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('jwt');

  if (user && token) {
    // User is logged in, automatically load their customers
    getCustomers();
  } else {
    // User is not logged in, show welcome message
    document.getElementById('output').innerHTML =
      '<div class="info">👋 Welcome! Please sign in to view your customers.</div>';
  }
}

// Set active button state
function setActiveButton(activeButtonId) {
  // Remove active class from all buttons
  const buttons = ['viewCustomers', 'getUserInfo', 'getAllUsers'];
  buttons.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.remove('active');
    }
  });

  // Add active class to the specified button
  const activeButton = document.getElementById(activeButtonId);
  if (activeButton) {
    activeButton.classList.add('active');
  }
}

async function getCustomers() {
  console.log('getCustomers called');
  const token = localStorage.getItem('jwt');
  if (!token) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please sign in first</div>';
    return;
  }

  // Set active state
  setActiveButton('viewCustomers');

  try {
    const res = await fetch('/api/customers', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const data = await res.json();

    if (data.success && data.customers) {
      if (data.customers.length === 0) {
        document.getElementById('output').innerHTML =
          '<div class="success">👥 No customers yet. Add one above!</div>';
      } else {
        const customersHtml = data.customers
          .map(
            (customer) =>
              `<div class="customer-item clickable" onclick="getCustomerDetails('${customer.id}')">
            <div class="customer-info">
              <strong>${customer.name}</strong>
              <span class="click-hint">Click to view details</span>
            </div>
          </div>`
          )
          .join('');

        document.getElementById(
          'output'
        ).innerHTML = `<div class="success">👥 Your Customers (${data.customers.length}):</div>
           <div class="customers-list">${customersHtml}</div>`;
      }
    } else {
      document.getElementById('output').innerHTML = `<div class="error">❌ ${
        data.error || 'Failed to load customers'
      }</div>`;
    }
  } catch (error) {
    document.getElementById(
      'output'
    ).innerHTML = `<div class="error">❌ Network error: ${error.message}</div>`;
  }
}

async function getUserInfo() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please sign in first</div>';
    return;
  }

  // Set active state
  setActiveButton('getUserInfo');

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const data = await res.json();

    if (data.success && data.user) {
      document.getElementById(
        'output'
      ).innerHTML = `<div class="success">👤 Your Info:</div><pre>${JSON.stringify(
        data,
        null,
        2
      )}</pre>`;
    } else {
      document.getElementById('output').innerHTML = `<div class="error">❌ ${
        data.error || 'Failed to get user info'
      }</div>`;
    }
  } catch (error) {
    document.getElementById(
      'output'
    ).innerHTML = `<div class="error">❌ Network error: ${error.message}</div>`;
  }
}

async function getAllUsers() {
  console.log('getAllUsers called');

  // Set active state
  setActiveButton('getAllUsers');

  try {
    const res = await fetch('/api/auth/users');
    const data = await res.json();

    if (data.success && data.users) {
      document.getElementById(
        'output'
      ).innerHTML = `<div class="success">👥 All Users (${
        data.users.length
      }):</div><pre>${JSON.stringify(data, null, 2)}</pre>`;
    } else {
      document.getElementById('output').innerHTML = `<div class="error">❌ ${
        data.error || 'Failed to load users'
      }</div>`;
    }
  } catch (error) {
    document.getElementById(
      'output'
    ).innerHTML = `<div class="error">❌ Network error: ${error.message}</div>`;
  }
}

function signOut() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
  document.getElementById('userInfo').style.display = 'none';
  document.getElementById('output').innerHTML =
    '<div class="info">👋 Welcome! Please sign in to view your customers.</div>';
}

// Get full customer details when clicked
async function getCustomerDetails(customerId) {
  console.log('getCustomerDetails called for ID:', customerId);
  const token = localStorage.getItem('jwt');
  if (!token) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please sign in first</div>';
    return;
  }

  try {
    const res = await fetch(`/api/customers/${customerId}`, {
      headers: { Authorization: 'Bearer ' + token },
    });
    const data = await res.json();

    if (data.success && data.customer) {
      const customer = data.customer;
      const customerDetailsHtml = `
        <div class="customer-details">
          <div class="customer-header">
            <h3>${customer.name}</h3>
            <button onclick="getCustomers()" class="btn btn-secondary">← Back to List</button>
          </div>
          <div class="customer-info">
            <div class="info-row">
              <strong>Email:</strong> ${customer.email}
            </div>
            ${
              customer.phone
                ? `<div class="info-row"><strong>Phone:</strong> ${customer.phone}</div>`
                : ''
            }
            ${
              customer.company
                ? `<div class="info-row"><strong>Company:</strong> ${customer.company}</div>`
                : ''
            }
            <div class="info-row">
              <strong>Added:</strong> ${new Date(
                customer.createdAt
              ).toLocaleDateString()}
            </div>
            ${
              customer.updatedAt
                ? `<div class="info-row"><strong>Last Updated:</strong> ${new Date(
                    customer.updatedAt
                  ).toLocaleDateString()}</div>`
                : ''
            }
          </div>
        </div>
      `;

      document.getElementById('output').innerHTML = customerDetailsHtml;
    } else {
      document.getElementById('output').innerHTML = `<div class="error">❌ ${
        data.error || 'Failed to load customer details'
      }</div>`;
    }
  } catch (error) {
    document.getElementById(
      'output'
    ).innerHTML = `<div class="error">❌ Network error: ${error.message}</div>`;
  }
}

// Make functions globally available
window.getCustomers = getCustomers;
window.getUserInfo = getUserInfo;
window.getAllUsers = getAllUsers;
window.toggleCustomerForm = toggleCustomerForm;
window.getCustomerDetails = getCustomerDetails;
window.signOut = signOut;

// Add event listeners for all buttons
document.addEventListener('DOMContentLoaded', function () {
  // Sign out button
  const signoutBtn = document.getElementById('signoutBtn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', signOut);
  }

  // View customers button
  const viewCustomersBtn = document.getElementById('viewCustomers');
  if (viewCustomersBtn) {
    viewCustomersBtn.addEventListener('click', getCustomers);
  }

  // Get user info button
  const getUserInfoBtn = document.getElementById('getUserInfo');
  if (getUserInfoBtn) {
    getUserInfoBtn.addEventListener('click', getUserInfo);
  }

  // Get all users button
  const getAllUsersBtn = document.getElementById('getAllUsers');
  if (getAllUsersBtn) {
    getAllUsersBtn.addEventListener('click', getAllUsers);
  }

  // Toggle customer form button
  const toggleCustomerFormBtn = document.getElementById('toggleCustomerForm');
  if (toggleCustomerFormBtn) {
    toggleCustomerFormBtn.addEventListener('click', toggleCustomerForm);
  }

  // Add event listener for customer form
  const addCustomerForm = document.getElementById('addCustomerForm');
  if (addCustomerForm) {
    addCustomerForm.addEventListener('submit', handleAddCustomer);
  }
});

// Toggle customer form visibility
function toggleCustomerForm() {
  console.log('toggleCustomerForm called');
  const customerForm = document.getElementById('customerForm');
  const token = localStorage.getItem('jwt');

  if (!token) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please sign in first</div>';
    return;
  }

  if (customerForm.style.display === 'none') {
    customerForm.style.display = 'block';
  } else {
    customerForm.style.display = 'none';
  }
}

// Handle adding a new customer
async function handleAddCustomer(e) {
  e.preventDefault();

  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const company = document.getElementById('customerCompany').value.trim();

  if (!name || !email) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please enter customer name and email</div>';
    return;
  }

  const token = localStorage.getItem('jwt');
  if (!token) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please sign in first</div>';
    return;
  }

  try {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ name, email, phone, company }),
    });

    const data = await res.json();

    if (data.success && data.customer) {
      // Clear the form
      document.getElementById('customerName').value = '';
      document.getElementById('customerEmail').value = '';
      document.getElementById('customerPhone').value = '';
      document.getElementById('customerCompany').value = '';

      // Show success message
      document.getElementById(
        'output'
      ).innerHTML = `<div class="success">✅ ${data.message}</div>`;

      // Refresh customers display immediately
      getCustomers();
    } else {
      document.getElementById('output').innerHTML = `<div class="error">❌ ${
        data.error || 'Failed to add customer'
      }</div>`;
    }
  } catch (error) {
    document.getElementById(
      'output'
    ).innerHTML = `<div class="error">❌ Network error: ${error.message}</div>`;
  }
}
