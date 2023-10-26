const htmlElement = document.querySelector('html');
const themeToggleBtn = document.querySelector('#theme-toggle');

function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-bs-theme');
    console.log('Current Theme: ', currentTheme);
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
        themeToggleBtn.className = 'bi bi-brightness-high';
    } else {
        themeToggleBtn.className = 'bi bi-brightness-high-fill';
    }
    htmlElement.setAttribute('data-bs-theme', newTheme);
}
