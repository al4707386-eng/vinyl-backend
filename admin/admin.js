// Базовый URL для API
const API_URL = '/api';
const BACKEND_URL = 'http://localhost:3000';

// Ключ администратора
let adminKey = sessionStorage.getItem('adminKey') || '';

// ------- Утилита для запросов -------
async function apiFetch(url, options = {}) {
  const headers = {
    'X-Admin-Key': adminKey,
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Ошибка ${response.status}`);
  }

  return response.json();
}

// ------- Элементы страницы -------
const loginScreen = document.querySelector('#loginScreen');
const adminContent = document.querySelector('#adminContent');
const loginForm = document.querySelector('#loginForm');
const adminKeyInput = document.querySelector('#adminKeyInput');
const loginError = document.querySelector('#loginError');
const logoutBtn = document.querySelector('#logoutBtn');
const addRecordForm = document.querySelector('#addRecordForm');
const addRecordMessage = document.querySelector('#addRecordMessage');
const editRecordForm = document.querySelector('#editRecordForm');
const editRecordMessage = document.querySelector('#editRecordMessage');
const editRecordPanel = document.querySelector('#editRecordPanel');
const recCoverUpload = document.querySelector('#recCoverUpload');
const recExtraUpload = document.querySelector('#recExtraUpload');
const editRecCoverUpload = document.querySelector('#editRecCoverUpload');
const editRecExtraUpload = document.querySelector('#editRecExtraUpload');

// ------- Вход / выход -------
function showAdmin() {
  loginScreen.hidden = true;
  adminContent.hidden = false;
  logoutBtn.hidden = false;
  loadUsers();
  loadOrders();
  loadRecords();
  loadCoversByRecord();
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

// ------- Автоподбор доминирующего цвета -------
function extractDominantColor(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 40;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;

        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];

          const brightness = (pr + pg + pb) / 3;
          if (brightness < 30 || brightness > 220) continue;

          r += pr;
          g += pg;
          b += pb;
          count++;
        }

        if (count === 0) {
          resolve('#8a2d1a');
          return;
        }

        r = Math.round((r / count) * 0.75);
        g = Math.round((g / count) * 0.75);
        b = Math.round((b / count) * 0.75);

        const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
        resolve(hex);
      };

      img.onerror = () => resolve('#8a2d1a');
      img.src = event.target.result;
    };

    reader.onerror = () => resolve('#8a2d1a');
    reader.readAsDataURL(file);
  });
}

// ------- ПЛАСТИНКИ -------
async function loadRecords() {
  const tbody = document.querySelector('#recordsTable tbody');
  const empty = document.querySelector('#recordsEmpty');
  tbody.innerHTML = '';

  try {
    const records = await fetch(`${API_URL}/records`).then((r) => r.json());
    empty.hidden = records.length > 0;

    records.forEach((rec) => {
      const cover = rec.cover
        ? `<img class="record-thumb-mini" src="${BACKEND_URL}${rec.cover}" alt="">`
        : `<div class="record-thumb-mini record-thumb-mini--empty">💿</div>`;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${rec.id}</td>
        <td>${cover}</td>
        <td>${rec.title}</td>
        <td>${rec.artist}</td>
        <td>${rec.year || '—'}</td>
        <td>${rec.genre || '—'}</td>
        <td>${rec.price} ₽</td>
        <td>${rec.inStock ? 'да' : 'нет'}</td>
        <td>
          <button class="btn btn--small btn--ghost-dark"
                  data-action="edit-record"
                  data-id="${rec.id}">Редактировать</button>
          <button class="btn btn--small btn--danger"
                  data-action="delete-record"
                  data-id="${rec.id}">Удалить</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
  }
}

// ------- Создание пластинки -------
addRecordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  addRecordMessage.hidden = true;

  const imagesRaw = document.querySelector('#recImages').value.trim();
  const images = imagesRaw
    ? imagesRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const tracksRaw = document.querySelector('#recTracks').value.trim();
  const tracks = tracksRaw
    ? tracksRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const payload = {
    id: document.querySelector('#recId').value.trim(),
    title: document.querySelector('#recTitle').value.trim(),
    artist: document.querySelector('#recArtist').value.trim(),
    year: Number(document.querySelector('#recYear').value) || null,
    genre: document.querySelector('#recGenre').value.trim() || null,
    label: document.querySelector('#recLabel').value.trim() || null,
    country: document.querySelector('#recCountry').value.trim() || null,
    price: Number(document.querySelector('#recPrice').value),
    color: document.querySelector('#recColor').value.trim() || '#8a2d1a',
    cover: document.querySelector('#recCover').value.trim() || null,
    inStock: document.querySelector('#recInStock').value === '1',
    images,
    description: document.querySelector('#recDescription').value.trim() || null,
    tracks,
  };

  try {
    await apiFetch(`${API_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    addRecordMessage.textContent = `Пластинка «${payload.title}» добавлена`;
    addRecordMessage.className = 'form-message form-message--ok';
    addRecordMessage.hidden = false;

    addRecordForm.reset();
    document.querySelector('#recColor').value = '#8a2d1a';
    loadRecords();
    loadCoversByRecord();
  } catch (error) {
    addRecordMessage.textContent = 'Ошибка: ' + error.message;
    addRecordMessage.className = 'form-message form-message--error';
    addRecordMessage.hidden = false;
  }
});

// ------- Редактирование пластинки -------
async function openEditRecord(id) {
  try {
    const rec = await fetch(`${API_URL}/records/${id}`).then((r) => r.json());

    document.querySelector('#editRecId').value = rec.id;
    document.querySelector('#editRecordTitle').textContent = rec.title;
    document.querySelector('#editRecTitle').value = rec.title;
    document.querySelector('#editRecArtist').value = rec.artist;
    document.querySelector('#editRecYear').value = rec.year || '';
    document.querySelector('#editRecGenre').value = rec.genre || '';
    document.querySelector('#editRecLabel').value = rec.label || '';
    document.querySelector('#editRecCountry').value = rec.country || '';
    document.querySelector('#editRecPrice').value = rec.price;
    document.querySelector('#editRecCover').value = rec.cover || '';
    document.querySelector('#editRecInStock').value = rec.inStock ? '1' : '0';
    document.querySelector('#editRecImages').value = (rec.images || []).join('\n');
    document.querySelector('#editRecDescription').value = rec.description || '';
    document.querySelector('#editRecTracks').value = (rec.tracks || []).join('\n');

    editRecordPanel.hidden = false;
    editRecordPanel.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    alert('Ошибка загрузки: ' + error.message);
  }
}

editRecordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  editRecordMessage.hidden = true;

  const id = document.querySelector('#editRecId').value;

  const imagesRaw = document.querySelector('#editRecImages').value.trim();
  const images = imagesRaw
    ? imagesRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const tracksRaw = document.querySelector('#editRecTracks').value.trim();
  const tracks = tracksRaw
    ? tracksRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const payload = {
    title: document.querySelector('#editRecTitle').value.trim(),
    artist: document.querySelector('#editRecArtist').value.trim(),
    year: Number(document.querySelector('#editRecYear').value) || null,
    genre: document.querySelector('#editRecGenre').value.trim() || null,
    label: document.querySelector('#editRecLabel').value.trim() || null,
    country: document.querySelector('#editRecCountry').value.trim() || null,
    price: Number(document.querySelector('#editRecPrice').value),
    cover: document.querySelector('#editRecCover').value.trim() || null,
    inStock: document.querySelector('#editRecInStock').value === '1',
    images,
    description: document.querySelector('#editRecDescription').value.trim() || null,
    tracks,
  };

  try {
    await apiFetch(`${API_URL}/records/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    editRecordMessage.textContent = 'Изменения сохранены';
    editRecordMessage.className = 'form-message form-message--ok';
    editRecordMessage.hidden = false;

    loadRecords();
    loadCoversByRecord();

    setTimeout(() => {
      editRecordPanel.hidden = true;
      editRecordForm.reset();
    }, 1200);
  } catch (error) {
    editRecordMessage.textContent = 'Ошибка: ' + error.message;
    editRecordMessage.className = 'form-message form-message--error';
    editRecordMessage.hidden = false;
  }
});

document.querySelector('#cancelEditBtn').addEventListener('click', () => {
  editRecordPanel.hidden = true;
  editRecordForm.reset();
});

// ------- Обложки по пластинкам -------
async function loadCoversByRecord() {
  const container = document.querySelector('#coversByRecord');
  const empty = document.querySelector('#coversEmpty');
  container.innerHTML = '';

  try {
    const records = await fetch(`${API_URL}/records`).then((r) => r.json());
    empty.hidden = records.length > 0;

    records.forEach((rec) => {
      const card = document.createElement('div');
      card.className = 'covers-record';

      const photos = [];

      if (rec.cover) {
        photos.push({ path: rec.cover, isMain: true });
      }
      (rec.images || []).forEach((img) => {
        photos.push({ path: img, isMain: false });
      });

      let photosHtml = '';

      if (photos.length === 0) {
        photosHtml = `<p class="covers-record__empty">Картинок пока нет — загрузите ниже и вставьте путь в форму редактирования.</p>`;
      } else {
        photosHtml =
          '<div class="covers-record__grid">' +
          photos
            .map(
              (p) => `
                <div class="covers-record__item ${p.isMain ? 'covers-record__item--main' : ''}">
                  ${p.isMain ? '<span class="covers-record__badge">Обложка</span>' : ''}
                  <img src="${BACKEND_URL}${p.path}" alt="">
                  <p class="covers-record__path">${p.path}</p>
                </div>
              `
            )
            .join('') +
          '</div>';
      }

      card.innerHTML = `
        <h3 class="covers-record__title">${rec.title}</h3>
        <p class="covers-record__subtitle">${rec.artist} · ${rec.id}</p>
        ${photosHtml}
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error(error);
  }
}

// ------- ПОЛЬЗОВАТЕЛИ -------
async function loadUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  const empty = document.querySelector('#usersEmpty');
  tbody.innerHTML = '';

  try {
    const users = await apiFetch(`${API_URL}/users`);
    empty.hidden = users.length > 0;

    users.forEach((user) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.createdAt}</td>
        <td>
          <button class="btn btn--small btn--danger"
                  data-action="delete-user"
                  data-id="${user.id}">Удалить</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
  }
}

// ------- ЗАКАЗЫ -------
async function loadOrders() {
  const tbody = document.querySelector('#ordersTable tbody');
  const empty = document.querySelector('#ordersEmpty');
  tbody.innerHTML = '';

  try {
    const orders = await apiFetch(`${API_URL}/orders`);
    empty.hidden = orders.length > 0;

    orders.forEach((order) => {
      const itemsText = Array.isArray(order.items)
        ? order.items.join(', ')
        : order.items;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.userName || '—'}</td>
        <td>${itemsText}</td>
        <td>${order.total} ₽</td>
        <td>
          <select data-action="change-status" data-id="${order.id}">
            <option value="новый" ${order.status === 'новый' ? 'selected' : ''}>новый</option>
            <option value="в работе" ${order.status === 'в работе' ? 'selected' : ''}>в работе</option>
            <option value="выполнен" ${order.status === 'выполнен' ? 'selected' : ''}>выполнен</option>
            <option value="отменён" ${order.status === 'отменён' ? 'selected' : ''}>отменён</option>
          </select>
        </td>
        <td>${order.createdAt}</td>
        <td>
          <button class="btn btn--small btn--danger"
                  data-action="delete-order"
                  data-id="${order.id}">Удалить</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
  }
}

// ------- Загрузка обложки прямо в форме создания -------
recCoverUpload.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const dominantColor = await extractDominantColor(file);

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
      body: formData,
    });

    if (!response.ok) throw new Error('Ошибка загрузки');

    const data = await response.json();

    document.querySelector('#recCover').value = data.path;
    document.querySelector('#recColor').value = dominantColor;

    loadCoversByRecord();
  } catch (error) {
    alert('Ошибка загрузки обложки: ' + error.message);
  } finally {
    event.target.value = '';
  }
});

// ------- Загрузка доп. фото в форме создания -------
recExtraUpload.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  const textarea = document.querySelector('#recImages');
  const existing = textarea.value.trim();
  const newPaths = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'X-Admin-Key': adminKey },
        body: formData,
      });

      if (!response.ok) throw new Error('Ошибка загрузки');

      const data = await response.json();
      newPaths.push(data.path);
    } catch (error) {
      alert('Ошибка загрузки доп. фото: ' + error.message);
    }
  }

  textarea.value = [existing, ...newPaths].filter(Boolean).join('\n');

  loadCoversByRecord();
  event.target.value = '';
});

// ------- Загрузка обложки в форме редактирования -------
editRecCoverUpload.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
      body: formData,
    });

    if (!response.ok) throw new Error('Ошибка загрузки');

    const data = await response.json();

    document.querySelector('#editRecCover').value = data.path;

    loadCoversByRecord();
  } catch (error) {
    alert('Ошибка загрузки обложки: ' + error.message);
  } finally {
    event.target.value = '';
  }
});

// ------- Загрузка доп. фото в форме редактирования -------
editRecExtraUpload.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  const textarea = document.querySelector('#editRecImages');
  const existing = textarea.value.trim();
  const newPaths = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'X-Admin-Key': adminKey },
        body: formData,
      });

      if (!response.ok) throw new Error('Ошибка загрузки');

      const data = await response.json();
      newPaths.push(data.path);
    } catch (error) {
      alert('Ошибка загрузки доп. фото: ' + error.message);
    }
  }

  textarea.value = [existing, ...newPaths].filter(Boolean).join('\n');

  loadCoversByRecord();
  event.target.value = '';
});

// ------- Обработчики кликов -------
document.addEventListener('click', async (event) => {
  const action = event.target.dataset.action;
  if (!action) return;

  const id = event.target.dataset.id;

  try {
    if (action === 'edit-record') {
      await openEditRecord(id);
    }

    if (action === 'delete-record') {
      if (!confirm('Удалить пластинку?')) return;
      await apiFetch(`${API_URL}/records/${id}`, { method: 'DELETE' });
      loadRecords();
      loadCoversByRecord();
    }

    if (action === 'delete-user') {
      if (!confirm('Удалить пользователя? Все его заказы и избранное тоже удалятся.')) return;
      await apiFetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      loadUsers();
      loadOrders();
    }

    if (action === 'delete-order') {
      if (!confirm('Удалить заказ?')) return;
      await apiFetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      loadOrders();
    }

    if (action === 'delete-image') {
      if (!confirm('Удалить картинку?')) return;
      await apiFetch(`${API_URL}/upload/${id}`, { method: 'DELETE' });
      loadCoversByRecord();
    }

    if (action === 'copy-path') {
      const path = event.target.dataset.path;
      await navigator.clipboard.writeText(path);
      const original = event.target.textContent;
      event.target.textContent = 'Скопировано!';
      setTimeout(() => { event.target.textContent = original; }, 1500);
    }
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
});

// ------- Смена статуса заказа -------
document.addEventListener('change', async (event) => {
  if (event.target.dataset.action !== 'change-status') return;

  const id = event.target.dataset.id;
  const status = event.target.value;

  try {
    await apiFetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
});

// ------- ИНИЦИАЛИЗАЦИЯ -------
if (adminKey) {
  showAdmin();
} else {
  showLogin();
}