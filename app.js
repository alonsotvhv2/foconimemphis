let editId = null;

async function checkDatabase() {
    try {
        const response = await fetch('/api/check-db');
        const result = await response.json();
        const message = result.success
            ? `La base de datos SQLite está conectada y la tabla "tasks" existe.`
            : `Error: ${result.error}`;
        console.log(message);
        document.getElementById('dbStatus').textContent = message;
        return result.success;
    } catch (error) {
        const errorMessage = `Error al verificar la base de datos: ${error.message}`;
        console.error(errorMessage);
        document.getElementById('dbStatus').textContent = errorMessage;
        return false;
    }
}

async function renderTasks() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    const taskBody = document.getElementById('taskBody');
    taskBody.innerHTML = '';

    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
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
    } catch (error) {
        alert('Error al cargar las tareas.');
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
        const method = editId === null ? 'POST' : 'PUT';
        const url = editId === null ? '/api/tasks' : `/api/tasks/${editId}`;
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task })
        });

        if (response.ok) {
            taskInput.value = '';
            editId = null;
            document.getElementById('addBtn').textContent = 'Agregar';
            document.getElementById('cancelBtn').style.display = 'none';
            renderTasks();
        } else {
            alert('Error al guardar la tarea.');
        }
    } catch (error) {
        alert('Error al conectar con el servidor.');
    }
}

async function editTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}`);
        const task = await response.json();
        if (task) {
            document.getElementById('taskInput').value = task.task;
            editId = id;
            document.getElementById('addBtn').textContent = 'Actualizar';
            document.getElementById('cancelBtn').style.display = 'inline';
        }
    } catch (error) {
        alert('Error al cargar la tarea.');
    }
}

async function deleteTask(id) {
    if (!confirm('¿Está seguro de eliminar esta tarea?')) return;

    try {
        const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (response.ok) {
            renderTasks();
        } else {
            alert('Error al eliminar la tarea.');
        }
    } catch (error) {
        alert('Error al conectar con el servidor.');
    }
}

function cancelEdit() {
    document.getElementById('taskInput').value = '';
    editId = null;
    document.getElementById('addBtn').textContent = 'Agregar';
    document.getElementById('cancelBtn').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    checkDatabase();
});
