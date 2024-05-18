document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const list = document.getElementById('todo-list');
    const counter = document.getElementById('todo-counter');

    let filter = 'all';
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function addTask(task) {
        if (tasks.some(t => t.text === task.text)) {
            alert('Task already exists!');
            return;
        }
        tasks.push(task);
        saveTasks();
        renderTasks();
    }

    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function removeTask(index) {
        const li = list.children[index];
        li.classList.add('removing');
        li.addEventListener('animationend', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });
    }

    function editTask(index, newText) {
        if (tasks.some((t, i) => t.text === newText && i !== index)) {
            alert('Task already exists!');
            return;
        }
        tasks[index].text = newText;
        saveTasks();
        renderTasks();
    }

    function clearCompletedTasks() {
        const incompleteTasks = tasks.filter(task => !task.completed);
        tasks.length = 0;
        tasks.push(...incompleteTasks);
        saveTasks();
        renderTasks();
    }

    function renderTasks() {
        list.innerHTML = '';
        tasks
            .filter(task => {
                if (filter === 'completed') return task.completed;
                if (filter === 'not-completed') return !task.completed;
                return true;
            })
            .forEach((task, index) => {
                const li = document.createElement('li');
                li.className = 'todo-item' + (task.completed ? ' completed' : '');
                li.dataset.index = index; // Adiciona o índice como um atributo de dados
                li.innerHTML = `
                    <span>${task.text}</span>
                    <input type="text" class="edit-input" value="${task.text}" onblur="finishEditTask(${index}, this.value)" onkeydown="handleEditKey(event, ${index}, this.value)" style="display: none;">
                    <div>
                        <button class="edit-button" onclick="startEditTask(${index})">Edit</button>
                        <button onclick="toggleTask(${index})">Complete</button>
                        <button onclick="removeTask(${index})">Remove</button>
                    </div>
                `;
                list.appendChild(li);
            });
        updateCounter();
    }

    function updateCounter() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        counter.textContent = `Total tasks: ${totalTasks} | Completed tasks: ${completedTasks}`;
    }

    function startEditTask(index) {
        const li = list.children[index];
        const span = li.querySelector('span');
        const input = li.querySelector('.edit-input');
        span.style.display = 'none';
        input.style.display = 'block';
        input.focus();
    }

    function finishEditTask(index, newText) {
        editTask(index, newText);
    }

    function handleEditKey(event, index, newText) {
        if (event.key === 'Enter') {
            finishEditTask(index, newText);
        }
    }

    function setFilter(newFilter) {
        filter = newFilter;
        renderTasks();
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const task = {
            text: input.value,
            completed: false
        };
        addTask(task);
        input.value = '';
    });

    // Inicializar o SortableJS para permitir arrastar e soltar
    const sortable = new Sortable(list, {
        onEnd: function (event) {
            const oldIndex = event.oldIndex;
            const newIndex = event.newIndex;
            tasks.splice(newIndex, 0, tasks.splice(oldIndex, 1)[0]);
            saveTasks();
            renderTasks();
        }
    });

    renderTasks();

    window.toggleTask = toggleTask;
    window.removeTask = removeTask;
    window.startEditTask = startEditTask;
    window.finishEditTask = finishEditTask;
    window.handleEditKey = handleEditKey;
    window.setFilter = setFilter;
    window.clearCompletedTasks = clearCompletedTasks;
});
