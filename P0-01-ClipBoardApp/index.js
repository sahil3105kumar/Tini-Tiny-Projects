const input = document.getElementById('text-input')
const btn = document.getElementById('copy-btn')
const counter = document.getElementById('counter')

let count = 0

btn.addEventListener('click', async () => {
    const text = input.value

    try {
        await navigator.clipboard.writeText(text)
        count++
        counter.innerHTML = `copied ${count} times`
    } catch(err) {
        console.error('clipboard failed',err)
    }
})