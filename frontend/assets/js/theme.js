// ── Aplica o tema IMEDIATAMENTE para evitar flash de tema escuro ──────────
(function () {
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light-mode');
        document.body && document.body.classList.add('light-mode');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Garante que o body também receba a classe (caso o IIFE rodou antes do body existir)
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    const themeButton = document.getElementById('theme-toggle');
    const isLight = () => document.body.classList.contains('light-mode');

    function applyTheme(light) {
        document.body.classList.toggle('light-mode', light);
        document.documentElement.classList.toggle('light-mode', light);
        localStorage.setItem('theme', light ? 'light' : 'dark');
        if (themeButton) {
            themeButton.innerHTML = light ? '☀️' : '🌙';
            themeButton.setAttribute('aria-label',
                light ? 'Mudar para tema escuro' : 'Mudar para tema claro');
        }
    }

    // Sincroniza ícone com estado atual
    if (themeButton) {
        themeButton.innerHTML = isLight() ? '☀️' : '🌙';
        themeButton.setAttribute('aria-label',
            isLight() ? 'Mudar para tema escuro' : 'Mudar para tema claro');

        themeButton.addEventListener('click', () => applyTheme(!isLight()));
    }
});
