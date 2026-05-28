
// state
function loadTasks() {
  try {
    const parsed = JSON.parse(localStorage.getItem('tasks'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

let tasks = loadTasks() // tasks needs to be an array
let filter = 'all'

// elements
const input = document.getElementById('task-input')
const addBtn = document.getElementById('add-btn')
const taskList = document.getElementById('task-list')
const footer = document.getElementById('footer')
const filterBtns = document.querySelectorAll('[data-filter]')

// save to localStorage
function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

// render list from tasks array
function render() {
  const filtered = tasks.filter(task => {
    if (filter === 'active') return !task.done
    if (filter === 'completed') return task.done
    return true
  })

  taskList.innerHTML = ''

  if (filtered.length === 0) {
    taskList.innerHTML = '<p class="empty">nothing here</p>'
  }

  filtered.forEach(task => {
    const li = document.createElement('li')
    li.className = 'task-item' + (task.done ? ' done' : '')

    const check = document.createElement('div')
    check.className = 'check'
    check.textContent = task.done ? '✓' : ''

    const text = document.createElement('span')
    text.className = 'task-text'
    text.textContent = task.text

    const del = document.createElement('button')
    del.className = 'delete-btn'
    del.textContent = 'delete'

    // toggle done on click
    li.addEventListener('click', () => {
      tasks = tasks.map(t =>
        t.id === task.id ? { ...t, done: !t.done } : t
      )
      save()
      render()
    })

    // delete — stop click from bubbling to li
    del.addEventListener('click', e => {
      e.stopPropagation()
      tasks = tasks.filter(t => t.id !== task.id)
      save()
      render()
    })

    li.appendChild(check)
    li.appendChild(text)
    li.appendChild(del)
    taskList.appendChild(li)
  })

  // footer count
  const remaining = tasks.filter(t => !t.done).length
  footer.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`
}

// add task
function addTask() {
  const text = input.value.trim()
  if (!text) return

  tasks.push({
    id: Date.now(),
    text,
    done: false
  })

  input.value = ''
  save()
  render()
}

addBtn.addEventListener('click', addTask)

// add on enter key
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask()
})

// filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter
    filterBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    render()
  })
})

// initial render
render()
