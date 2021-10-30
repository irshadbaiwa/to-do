document.addEventListener('DOMContentLoaded', function() {

    // Load and fill page variables
    loadData();

    // Event listeners
    document.querySelector('#add-task').addEventListener('click', addTask);
    document.querySelector('#cancel-task').addEventListener('click', clearForm);
    document.querySelector('button#deleteAll').addEventListener('click', warn);
    document.querySelectorAll('tbody').forEach(element => {
        element.addEventListener('click', event => showOptions(event));
    });
});



function loadData() {

    // Clear tables and initialize totals as 0 
    // before loading data
    // To prevent repitition
    clearTable('todoTable');
    clearTable('completedTable');
    document.querySelector('#ttasks-ttl').innerHTML = 0;
    document.querySelector('#ctasks-ttl').innerHTML = 0;

    // Load JSON string from local storage
    if (localStorage.tasks) {

        // Try parsing the string
        try {
            tasks = JSON.parse(localStorage.tasks);
            let todo = tasks.tasksTodo;
            let completed = tasks.completedTasks;

            // Set values of totals to page
            document.querySelector('#ttasks-ttl').innerHTML = todo.length;
            document.querySelector('#ctasks-ttl').innerHTML = completed.length;

            // Load data to respective tables
            todo.forEach(loadTodo)
            completed.forEach(loadCompleted)

        } catch (error) {
            console.log(error);
        }
    }
}


function loadTodo(task) {

    const tBody = document.querySelector('#todoTable>tbody');
    const row = document.createElement('tr');

    let taskCol = document.createElement('td');
    taskCol.dataset.id = `${task.id}`;
    taskCol.innerHTML = `<i class="bi bi-hourglass-split text-secondary"></i> ${task.task}`;
    row.append(taskCol);

    let dateCol = document.createElement('td');
    dateCol.dataset.id = `${task.id}`;
    dateCol.innerHTML = formatDate(task.date);
    row.append(dateCol);

    let priorityCol = document.createElement('td');
    priorityCol.dataset.id = `${task.id}`;
    let priority = task.priority;
    switch (priority) {
        case 3:
            priorityCol.innerHTML = 'High';
            priorityCol.className = 'text-danger';
            break;
        case 2:
            priorityCol.innerHTML = 'Medium';
            priorityCol.className = 'text-primary';
            break;
        default:
            priorityCol.innerHTML = 'Low';
            priorityCol.className = 'text-secondary';
    }
    row.append(priorityCol);

    tBody.append(row);

}


function loadCompleted(task) {
    
    const tBody = document.querySelector('#completedTable>tbody');
    const row = document.createElement('tr');

    let taskCol = document.createElement('td');
    taskCol.dataset.id = `${task.id}`;
    taskCol.innerHTML = `<i class="bi bi-check2-circle text-success"></i> ${task.task}`;
    row.append(taskCol);

    let dateCol = document.createElement('td');
    dateCol.dataset.id = `${task.id}`;
    dateCol.innerHTML = formatDate(task.date);
    row.append(dateCol);

    tBody.append(row);

}


function addTask() {

    // Get input
    const form = document.forms.newtaskform;
    let task = form.elements['task'].value.trim();
    let dateString = form.elements['date'].value;
    let date = (dateString) ? new Date(dateString) : new Date();
    let priority = parseInt(form.elements['priority'].value);

    // Task can't be empty
    if (task === '') {
        return
    }

    // Add tasks object to Local Storage (if absent)
    if (!localStorage.getItem('tasks')) {
        localStorage.tasks = JSON.stringify({
            tasksTodo: [],
            completedTasks: []
        });
    }

    // Add new task to tasks

    let tasks = JSON.parse(localStorage.tasks);

    let newTask = {
        // Id is created by concatenating task title
        // and current date (in number; milliseconds from 1970)
        id: task + Number(new Date()),
        task,
        date,
        priority
    };

    tasks.tasksTodo.unshift(newTask);

    // Update local Storage
    localStorage.tasks = JSON.stringify(tasks);

    // Clear form fields
    clearForm()

    // Reload tasks
    loadData();
    
}


function showOptions(event) {
    
    // Get id of the column clicked
    let item = event.target;
    let item_id = item.dataset.id;

    // Configure Modal
    const modal = document.querySelector('#optionsModal');
    const modalClass = new bootstrap.Modal(modal);
    const tableId = item.parentNode.parentNode.parentNode.id;

    // Buttons
    const markDone = document.querySelector('#markDoneBtn');
    const deleteBtn = document.querySelector('#deleteTaskBtn');
    const deleteAllTasks = document.querySelector('#deleteAllTasksBtn');

    // Hide 'Mark Done' btn for completed tasks
    if (tableId === 'completedTable') {
        markDone.style.display = 'none';
    } else {
        markDone.style.display = 'inline-block';
    }

    // Always show delete btn and hide delete all
    deleteBtn.style.display = 'inline-block';
    deleteAllTasks.style.display = 'none';

    // Set modal header to be task's title
    document.querySelector('#taskTitle').innerHTML = 
        item.parentNode.firstChild.innerHTML;

    // Show modal
    modalClass.show();

    // Add Event listener to 'Mark Done' btn
    markDone.addEventListener('click', function() {

        // Parse JSON
        const tasks = JSON.parse(localStorage.tasks);

        tasks.tasksTodo.forEach((element, index, array) => {
            if (element.id === item_id) {

                // Add task to 'completedTasks'
                let completedTask = {
                    id: element.id,
                    task: element.task,
                    date: new Date()
                };
                tasks.completedTasks.unshift(completedTask);

                // Remove task from todo tasks
                array = array.filter(e => e.id !== element.id);
                tasks.tasksTodo = array;

                // Update local storage
                localStorage.tasks = JSON.stringify(tasks);

                // Reload Page
                loadData();

            }
        });

    })

    // Add Event listener to delete btn
    deleteBtn.addEventListener('click', function() {

        // Parse JSON
        const tasks = JSON.parse(localStorage.tasks);
        targetList = (tableId === 'completedTable') ? 'completedTasks'
                    : 'tasksTodo';

        // Loop through list
        tasks[targetList].forEach((element, index, array) => {

            if (element.id === item_id) {
                
                // Remove task
                array = array.filter(e => e.id !== element.id);
                tasks[targetList] = array;

                // Update local storage
                localStorage.tasks = JSON.stringify(tasks);

                // Reload Page
                loadData();

            }

        }) 

    })
}


function warn() {

    // Buttons
    const markDone = document.querySelector('#markDoneBtn');
    const deleteBtn = document.querySelector('#deleteTaskBtn');
    const deleteAllTasks = document.querySelector('#deleteAllTasksBtn');

    // Only Show deleteAllTask
    markDone.style.display = 'none';
    deleteBtn.style.display = 'none';
    deleteAllTasks.style.display = 'inline-block';

    // Change Modal title
    document.querySelector('#taskTitle').innerHTML = '<b>All data will be lost!</b>';

    // Add Event listener to deleteAll
    deleteAllTasks.onclick = deleteAll;
}


function deleteAll() {
    // Clear local storage
    localStorage.clear();

    // Reload page
    loadData();
}


function formatDate(dateString) {

    const days = [
        'Sun', 'Mon', 'Tue', 'Wed',
        'Thurs', 'Fri', 'Sat'
    ]

    let date = new Date(dateString);
    let today = new Date();

    // If date is the same as current month and year
    if (today.getMonth() === date.getMonth() 
        && today.getFullYear() === date.getFullYear()
    ) {
        switch(date.getDate()) {
            case today.getDate():
                return "Today";
            case today.getDate() - 1:
                return "Yesterday";
            case today.getDate() + 1:
                return "Tomorrow";
            default:
                return (`${days[date.getDay()]}, 
                        ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`);
        }
    }

    // Otherwise return:
    return (`${days[date.getDay()]}, 
    ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`);
}


function clearForm() {

    // Clear form fields
    const form = document.forms.newtaskform;
    form.elements['task'].value = '';
    form.elements['date'].value = '';
    form.elements['priority'].value = '2';

}


function clearTable(tableId) {
    document.querySelector(`#${tableId}>tbody`).innerHTML = '';
}