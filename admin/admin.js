const API_URL = '/api';
const BACKEND_URL = 'https://vinyl-backend.layero.app'; // Твой сервер в интернете

let adminKey = sessionStorage.getItem('adminKey') || '';

async function apiFetch(url, options = {}) {
  const headers = { 'X-Admin-Key': adminKey, ...(options.headers || {}) };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(await response.text() || `Ошибка ${response.status}`);
  return response.json();
}

const loginScreen = document.querySelector('#loginScreen');
const adminContent = document.querySelector('#adminContent');
const loginForm = document.querySelector('#loginForm');
const adminKeyInput = document.querySelector('#adminKeyInput');
const loginError = document.querySelector('#loginError');
const logoutBtn = document.querySelector('#logoutBtn');

function showAdmin() {
  loginScreen.hidden = true;
  adminContent.hidden = false;
  logoutBtn.hidden = false;
  loadUsers();
  loadOrders();
  loadRecords(); // Загружаем таблицу пластинок
}

function showLogin() {
  loginScreen.hidden = false;
  adminContent.hidden = true;
  logoutBtn.hidden = true;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  adminKey = adminKeyInput.value.trim();
  try {
    await apiFetch(`${API_URL}/users`);
    sessionStorage.setItem('adminKey', adminKey);
    loginError.hidden = true;
    showAdmin();
  } catch (error) {
    loginError.hidden = false;
    adminKey = '';
  }
});

logoutBtn.addEventListener('click', () => {
  adminKey = '';
  sessionStorage.removeItem('adminKey');
  adminKeyInput.value = '';
  showLogin();
});

// --- Загрузка пластинок ---
async function loadRecords() {
  const tbody = document.querySelector('#recordsTable tbody');
  const empty = document.querySelector('#recordsEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  try {
    const records = await fetch(`${API_URL}/records`).then(r => r.json());
    empty.hidden = records.length > 0;

    records.forEach((rec) => {
      const cover = rec.cover
        ? `<img class="record-thumb-mini" src="${rec.cover.startsWith('http') ? rec.cover : BACKEND_URL + rec.cover}" alt="">`
        : `<div class="record-thumb-mini record-thumb-mini--empty">💿</div>`;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${rec.id}</td>
        <td>${cover}</td>
        <td>${rec.title}</td>
        <td>${rec.artist}</td>
        <td>${rec.year || '—'}</td>
        <td>${rec.price} ₽</td>
        <td>
          <button class="btn btn--small btn--danger" data-action="delete-record" data-id="${rec.id}">Удалить</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
    empty.hidden = false;
    empty.textContent = 'Ошибка загрузки';
  }
}

// --- Обработка кнопок (Удаление) ---
document.addEventListener('click', async (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  const id = event.target.dataset.id;

  try {
    if (action === 'delete-record') {
      if (!confirm('Удалить пластинку?')) return;
      await apiFetch(`${API_URL}/records/${id}`, { method: 'DELETE' });
      loadRecords(); // Обновляем таблицу
    }
    if (action === 'delete-user') {
      if (!confirm('Удалить пользователя?')) return;
      await apiFetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      loadUsers();
    }
    if (action === 'delete-order') {
      if (!confirm('Удалить заказ?')) return;
      await apiFetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      loadOrders();
    }
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
});

// Заглушки для остальных функций, чтобы админка не падала
async function loadUsers() {
  try {
    const users = await apiFetch(`${API_URL}/users`);
    const tbody = document.querySelector('#usersTable tbody');
    if(tbody) {
      tbody.innerHTML = users.map(u => `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td><button class="btn btn--small btn--danger" data-action="delete-user" data-id="${u.id}">Удалить</button></td></tr>`).join('');
    }
  } catch(e) {}
}

async function loadOrders() {
  try {
    const orders = await apiFetch(`${API_URL}/orders`);
    const tbody = document.querySelector('#ordersTable tbody');
    if(tbody) {
      tbody.innerHTML = orders.map(o => `<tr><td>${o.id}</td><td>${o.userName || '—'}</td><td>${o.total} ₽</td><td><button class="btn btn--small btn--danger" data-action="delete-order" data-id="${o.id}">Удалить</button></td></tr>`).join('');
    }
  } catch(e) {}
}

if (adminKey) { showAdmin(); } else { showLogin(); }