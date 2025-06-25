const API = 'https://todolist123123.onrender.com';

async function signup() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    alert('Reģistrēts! Tagad pieslēdzies.');
  } else {
    alert(data.error || 'Kļūda reģistrējoties.');
  }
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    alert('Pieslēgšanās veiksmīga!');
    loadTasks();
    showLoggedInUser();
  } else {
    alert(data.error || 'Kļūda pieslēdzoties.');
  }
}

async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  return fetch(url, options);
}

async function addTask() {
  const title = document.getElementById('newTask').value.trim();
  const description = document.getElementById('newDesc').value.trim();
  const status = document.getElementById('newStatus').value;
  if (!title) return;
  const res = await authFetch(`${API}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ title, description, status })
  });
  if (res.ok) {
    document.getElementById('newTask').value = '';
    document.getElementById('newDesc').value = '';
    loadTasks();
  } else {
    alert('Kļūda pievienojot uzdevumu.');
  }
}

async function loadTasks() {
  const res = await authFetch(`${API}/tasks`);
  if (!res.ok) {
    document.getElementById('tasks').innerHTML = '<div>Neizdevās ielādēt uzdevumus.</div>';
    return;
  }
  const tasks = await res.json();
  renderTasks(tasks);
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function renderTasks(tasks) {
  const tasksDiv = document.getElementById('tasks');
  if (!tasks.length) {
    tasksDiv.innerHTML = '<div>Nav uzdevumu.</div>';
    return;
  }
  tasksDiv.innerHTML = '';
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task';

    // Title as textarea
    const titleInput = document.createElement('textarea');
    titleInput.value = task.title;
    titleInput.disabled = true;
    titleInput.title = task.title;
    titleInput.addEventListener('input', () => autoResize(titleInput));

    // Description as textarea
    const descInput = document.createElement('textarea');
    descInput.value = task.description || '';
    descInput.disabled = true;
    descInput.title = task.description || '';
    descInput.addEventListener('input', () => autoResize(descInput));

    // Status select
    const statusSelect = document.createElement('select');
    ['nepabeigts', 'pabeigts'].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      if (task.status === opt) option.selected = true;
      statusSelect.appendChild(option);
    });
    statusSelect.disabled = true;
    statusSelect.style.marginLeft = '10px';


    const editBtn = document.createElement('button');
    editBtn.textContent = 'Labot';
    let editing = false;
    editBtn.onclick = async () => {
      if (!editing) {
        titleInput.disabled = false;
        descInput.disabled = false;
        statusSelect.disabled = false;
        editBtn.textContent = 'Saglabāt';
        editing = true;
      } else {
        titleInput.disabled = true;
        descInput.disabled = true;
        statusSelect.disabled = true;
        editBtn.textContent = 'Labot';
        editing = false;
        await updateTask(task._id, titleInput.value, descInput.value, statusSelect.value);
      }
    };


    const delBtn = document.createElement('button');
    delBtn.textContent = 'Dzēst';
    delBtn.onclick = async () => {
      if (confirm('Vai tiešām dzēst šo uzdevumu?')) {
        await deleteTask(task._id);
      }
    };


    const commentBtn = document.createElement('button');
    commentBtn.textContent = 'Komentāri';
    commentBtn.onclick = () => showCommentsModal(task._id);

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    actions.appendChild(commentBtn);

    div.appendChild(titleInput);
    div.appendChild(descInput);
    div.appendChild(statusSelect);
    div.appendChild(actions);

    tasksDiv.appendChild(div);

    autoResize(titleInput);
    autoResize(descInput);

    if (task.sharedWith && task.sharedWith.length > 0) {
      const sharedIcon = document.createElement('span');
      sharedIcon.textContent = '🔗 Koplietots';
      sharedIcon.style.color = '#b58900';
      sharedIcon.style.marginRight = '8px';
      div.insertBefore(sharedIcon, div.firstChild);
    }
  });
}

async function updateTask(id, title, description, status) {
  const res = await authFetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description, status })
  });
  if (!res.ok) {
    alert('Kļūda labojot uzdevumu.');
  } else {
    loadTasks();
  }
}

async function deleteTask(id) {
  const res = await authFetch(`${API}/tasks/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    alert('Kļūda dzēšot uzdevumu.');
  } else {
    loadTasks();
  }
}

// Auto-load tasks if already logged in
if (localStorage.getItem('token')) {
  loadTasks();
  showLoggedInUser();
}

/* CSS styles for task textareas */
const style = document.createElement('style');
style.textContent = `
.task {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px #ece6d1;
}

.task textarea {
  font-size: 1rem;
  background: #fffbe6;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0 8px 0 0;
  box-sizing: border-box;
  color: #5c5246;
  resize: none;
  min-height: 32px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  line-height: 1.5;
  display: block;
}
`;
document.head.appendChild(style);

let currentTaskIdForComments = null;

function showCommentsModal(taskId) {
  currentTaskIdForComments = taskId;
  document.getElementById('commentModal').style.display = 'flex';
  loadComments(taskId);
}

function hideCommentsModal() {
  document.getElementById('commentModal').style.display = 'none';
  document.getElementById('commentsList').innerHTML = '';
  document.getElementById('newCommentText').value = '';
}

async function loadComments(taskId) {
  const res = await authFetch(`${API}/tasks/${taskId}/comments`);
  const comments = await res.json();
  const list = document.getElementById('commentsList');
  list.innerHTML = '';
  if (!comments.length) {
    list.innerHTML = '<div>Nav komentāru.</div>';
    return;
  }
  comments.forEach(c => {
    const div = document.createElement('div');
    div.style.marginBottom = '8px';
    div.style.padding = '6px 10px';
    div.style.background = '#fdf6e3';
    div.style.borderRadius = '6px';
    div.textContent = c.text + (c.createdAt ? ` (${new Date(c.createdAt).toLocaleString()})` : '');
    list.appendChild(div);
  });
}

async function addComment() {
  const text = document.getElementById('newCommentText').value.trim();
  if (!text) return;
  await authFetch(`${API}/tasks/${currentTaskIdForComments}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
  document.getElementById('newCommentText').value = '';
  loadComments(currentTaskIdForComments);
}

// Modal event listeners
document.getElementById('closeCommentModal').onclick = hideCommentsModal;
document.getElementById('addCommentBtn').onclick = addComment;

async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  // Decode JWT payload (base64)
  const payload = JSON.parse(atob(token.split('.')[1]));
  // Fetch user info from backend
  const res = await authFetch(`${API}/auth/user/${payload.id}`);
  if (!res.ok) return null;
  return await res.json();
}

async function showLoggedInUser() {
  const user = await getCurrentUser();
  if (user) {
    document.getElementById('userInfo').textContent = `Sveicināts, ${user.username}!`;
    document.getElementById('logoutBtn').style.display = 'inline-block';
  }
}

document.getElementById('logoutBtn').onclick = () => {
  localStorage.removeItem('token');
  location.reload();
};