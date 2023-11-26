const htmlElement = document.querySelector('html');
const themeToggleBtn = document.querySelector('#theme-toggle');

const currentTheme = htmlElement.getAttribute('data-bs-theme');
if (sessionStorage.getItem('currentTheme')) {
    htmlElement.setAttribute(
        'data-bs-theme',
        sessionStorage.getItem('currentTheme')
    );
} else {
    sessionStorage.setItem('currentTheme', currentTheme);
}

function toggleTheme() {
    const newTheme =
        sessionStorage.getItem('currentTheme') === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
        themeToggleBtn.className = 'bi bi-brightness-high text-warning';
    } else {
        themeToggleBtn.className = 'bi bi-brightness-high-fill text-warning';
    }
    htmlElement.setAttribute('data-bs-theme', newTheme);
    // sessionStorage.removeItem("currentTheme")
    sessionStorage.setItem('currentTheme', newTheme);
}
