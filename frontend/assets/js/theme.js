const themeButton = document.getElementById('theme-toggle');

// =========================
// CARREGAR TEMA SALVO
// =========================
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
    document.body.classList.add('light-mode');

    if (themeButton) {
        themeButton.innerHTML = '☀️';
    }
}

// =========================
// ALTERNAR TEMA
// =========================
if (themeButton) {
    themeButton.addEventListener('click', () => {

        document.body.classList.toggle('light-mode');

        const isLight = document.body.classList.contains('light-mode');

        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        themeButton.innerHTML = isLight ? '☀️' : '🌙';
    });
}