// Main page JavaScript (index.html)
// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function () {
  checkAuthStatus();
});

function checkAuthStatus() {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('jwt');

  if (user && token) {
    const userData = JSON.parse(user);
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userInfo').style.display = 'block';
  } else {
    document.getElementById('userInfo').style.display = 'none';
  }
}

async function getTodos() {
  console.log('getTodos called');
  const token = localStorage.getItem('jwt');
  if (!token) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please sign in first</div>';
    return;
  }

  try {
    const res = await fetch('/api/todos', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const data = await res.json();

    if (data.success && data.todos) {
      if (data.todos.length === 0) {
        document.getElementById('output').innerHTML =
          '<div class="success">📝 No todos yet. Add one above!</div>';
      } else {
        const todosHtml = data.todos
          .map(
            (todo) =>
              `<div class="todo-item">
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${
                todo.text
              }</span>
            <small class="todo-date">${new Date(
              todo.createdAt
            ).toLocaleDateString()}</small>
          </div>`
          )
          .join('');

        document.getElementById(
          'output'
        ).innerHTML = `<div class="success">📝 Your Todos (${data.todos.length}):</div>
           <div class="todos-list">${todosHtml}</div>`;
      }
    } else {
      document.getElementById('output').innerHTML = `<div class="error">❌ ${
        data.error || 'Failed to load todos'
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
    '<div class="success">✅ You have been signed out successfully</div>';
}

// Make functions globally available
window.getCustomers = getCustomers;
window.getUserInfo = getUserInfo;
window.getAllUsers = getAllUsers;
window.toggleCustomerForm = toggleCustomerForm;
window.signOut = signOut;

// Add event listeners for all buttons
document.addEventListener('DOMContentLoaded', function () {
  // Sign out button
  const signoutBtn = document.getElementById('signoutBtn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', signOut);
  }

  // Get customers button
  const getCustomersBtn = document.getElementById('getCustomers');
  if (getCustomersBtn) {
    getCustomersBtn.addEventListener('click', getCustomers);
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

// Toggle todo form visibility
function toggleTodoForm() {
  console.log('toggleTodoForm called');
  const todoForm = document.getElementById('todoForm');
  const token = localStorage.getItem('jwt');

  if (!token) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please sign in first</div>';
    return;
  }

  if (todoForm.style.display === 'none') {
    todoForm.style.display = 'block';
  } else {
    todoForm.style.display = 'none';
  }
}

// Handle adding a new todo
async function handleAddTodo(e) {
  e.preventDefault();

  const todoInput = document.getElementById('todoInput');
  const text = todoInput.value.trim();

  if (!text) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please enter a todo item</div>';
    return;
  }

  const token = localStorage.getItem('jwt');
  if (!token) {
    document.getElementById('output').innerHTML =
      '<div class="error">❌ Please sign in first</div>';
    return;
  }

  try {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (data.success && data.todo) {
      // Clear the input
      todoInput.value = '';

      // Show success message
      document.getElementById(
        'output'
      ).innerHTML = `<div class="success">✅ ${data.message}</div>`;

      // Refresh todos display
      setTimeout(() => {
        getTodos();
      }, 1000);
    } else {
      document.getElementById('output').innerHTML = `<div class="error">❌ ${
        data.error || 'Failed to add todo'
      }</div>`;
    }
  } catch (error) {
    document.getElementById(
      'output'
    ).innerHTML = `<div class="error">❌ Network error: ${error.message}</div>`;
  }
}
