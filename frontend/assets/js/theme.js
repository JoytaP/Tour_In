const themeButton = document.getElementById('theme-toggle');

// =========================
// CARREGAR TEMA SALVO
// =========================
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
<<<<<<< HEAD
    if (themeButton) {
        themeButton.innerHTML = '☀️';
        themeButton.setAttribute('aria-label', 'Mudar para tema escuro');
=======

    if (themeButton) {
        themeButton.innerHTML = '☀️';
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
    }
}

// =========================
// ALTERNAR TEMA
// =========================
if (themeButton) {
    themeButton.addEventListener('click', () => {
<<<<<<< HEAD
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeButton.innerHTML = isLight ? '☀️' : '🌙';
        themeButton.setAttribute('aria-label', isLight ? 'Mudar para tema escuro' : 'Mudar para tema claro');
    });
}
=======

        document.body.classList.toggle('light-mode');

        const isLight = document.body.classList.contains('light-mode');

        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        themeButton.innerHTML = isLight ? '☀️' : '🌙';
    });
}
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
