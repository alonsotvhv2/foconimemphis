let db;
let editId = null;

const DB_NAME = 'TaskDB';
const STORE_NAME = 'tasks';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

async function renderTasks() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    const taskBody = document.getElementById('taskBody');
    taskBody.innerHTML = '';

    try {
        if (!db) await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const tasks = request.result;
            tasks.forEach((task) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${task.task}</td>
                    <td>
                        <button class="edit-btn" onclick="editTask(${task.id})">Editar</button>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">Eliminar</button>
                    </td>
                `;
                taskBody.appendChild(row);
            });
            loading.style.display = 'none';
        };
        request.onerror = () => {
            alert('Error al cargar las tareas.');
            loading.style.display = 'none';
        };
    } catch (error) {
        alert('Error al conectar con la base de datos.');
        loading.style.display = 'none';
    }
}

async function addOrUpdateTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    if (task === '') {
        alert('Por favor, ingrese una tarea.');
        return;
    }

    try {
        if (!db) await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const taskObj = { task };
        let request;

        if (editId === null) {
            request = store.add(taskObj);
        } else {
            taskObj.id = editId;
            request = store.put(taskObj);
        }

        request.onsuccess = () => {
            taskInput.value = '';
            editId = null;
            document.getElementById('addBtn').textContent = 'Agregar';
            document.getElementById('cancelBtn').style.display = 'none';
            renderTasks();
        };
        request.onerror = () => alert('Error al guardar la tarea.');
    } catch (error) {
        alert('Error al conectar con la base de datos.');
    }
}

async function editTask(id) {
    try {
        if (!db) await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            const task = request.result;
            if (task) {
                document.getElementById('taskInput').value = task.task;
                editId = id;
                document.getElementById('addBtn').textContent = 'Actualizar';
                document.getElementById('cancelBtn').style.display = 'inline';
            }
        };
        request.onerror = () => alert('Error al cargar la tarea.');
    } catch (error) {
        alert('Error al conectar con la base de datos.');
    }
}

async function deleteTask(id) {
    if (!confirm('¿Está seguro de eliminar esta tarea?')) return;

    try {
        if (!db) await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => renderTasks();
        request.onerror = () => alert('Error al eliminar la tarea.');
    } catch (error) {
        alert('Error al conectar con la base de datos.');
    }
}

function cancelEdit() {
    document.getElementById('taskInput').value = '';
    editId = null;
    document.getElementById('addBtn').textContent = 'Agregar';
    document.getElementById('cancelBtn').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', renderTasks);
