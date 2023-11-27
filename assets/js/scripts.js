const htmlElement = document.querySelector('html');
const themeToggleBtn = document.querySelector('#theme-toggle');
const prevBtn = document.querySelector('.previous');
const nextBtn = document.querySelector('.next');

const currentTheme = htmlElement.getAttribute('data-bs-theme');
if (sessionStorage.getItem('currentTheme')) {
    htmlElement.setAttribute(
        'data-bs-theme',
        sessionStorage.getItem('currentTheme')
    );
} else {
    sessionStorage.setItem('currentTheme', currentTheme);
}

if (sessionStorage.getItem('currentTheme') === 'dark') {
    prevBtn && (prevBtn.className = 'previous btn btn-light');
    nextBtn && (nextBtn.className = 'next btn btn-light ms-auto');
} else {
    prevBtn && (prevBtn.className = 'previous btn btn-dark');
    nextBtn && (nextBtn.className = 'next btn btn-dark ms-auto');
}

function toggleTheme() {
    const newTheme =
        sessionStorage.getItem('currentTheme') === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
        themeToggleBtn.className = 'bi bi-brightness-high text-warning';
        prevBtn && (prevBtn.className = 'previous btn btn-light');
        nextBtn && (nextBtn.className = 'next btn btn-light ms-auto');
    } else {
        themeToggleBtn.className = 'bi bi-brightness-high-fill text-warning';
        prevBtn && (prevBtn.className = 'previous btn btn-dark');
        nextBtn && (nextBtn.className = 'next btn btn-dark ms-auto');
    }
    htmlElement.setAttribute('data-bs-theme', newTheme);
    // sessionStorage.removeItem("currentTheme")
    sessionStorage.setItem('currentTheme', newTheme);
}
