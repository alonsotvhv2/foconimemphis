let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editIndex = -1;

function renderTasks() {
    const taskBody = document.getElementById('taskBody');
    taskBody.innerHTML = '';
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task}</td>
            <td>
                <button class="edit-btn" onclick="editTask(${index})">Editar</button>
                <button class="delete-btn" onclick="deleteTask(${index})">Eliminar</button>
            </td>
        `;
        taskBody.appendChild(row);
    });
    saveTasks();
}

function addOrUpdateTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    if (task === '') {
        alert('Por favor, ingrese una tarea.');
        return;
    }

    if (editIndex === -1) {
        tasks.push(task);
    } else {
        tasks[editIndex] = task;
        editIndex = -1;
        document.getElementById('addBtn').textContent = 'Agregar';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    taskInput.value = '';
    renderTasks();
}

function editTask(index) {
    const taskInput = document.getElementById('taskInput');
    taskInput.value = tasks[index];
    editIndex = index;
    document.getElementById('addBtn').textContent = 'Actualizar';
    document.getElementById('cancelBtn').style.display = 'inline';
}

function deleteTask(index) {
    if (confirm('¿Está seguro de eliminar esta tarea?')) {
        tasks.splice(index, 1);
        renderTasks();
    }
}

function cancelEdit() {
    document.getElementById('taskInput').value = '';
    editIndex = -1;
    document.getElementById('addBtn').textContent = 'Agregar';
    document.getElementById('cancelBtn').style.display = 'none';
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

document.addEventListener('DOMContentLoaded', renderTasks);