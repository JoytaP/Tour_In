document.addEventListener('DOMContentLoaded', () => {
    const companyRegisterForm = document.getElementById('company-register-form');
    
    // Elementos de Upload de Foto
    const uploadTrigger = document.getElementById('upload-trigger');
    const fileInput = document.getElementById('comp-photos');
    const previewContainer = document.getElementById('photos-preview');

    // 1. Lógica Visual do Upload (Clique na caixa abre o seletor)
    if (uploadTrigger && fileInput) {
        uploadTrigger.addEventListener('click', () => {
            fileInput.click();
        });

        // Quando o usuário seleciona arquivos
        fileInput.addEventListener('change', (e) => {
            previewContainer.innerHTML = ''; // Limpa previews anteriores
            const files = Array.from(e.target.files); // Converte FileList para Array

            if (files.length > 0) {
                // Loop para mostrar TODAS as imagens selecionadas
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                            const img = document.createElement('img');
                            img.src = readerEvent.target.result;
                            img.className = 'preview-img';
                            previewContainer.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                });
                uploadTrigger.querySelector('p').textContent = `${files.length} foto(s) selecionada(s)`;
            } else {
                uploadTrigger.querySelector('p').textContent = 'Clique para adicionar fotos';
            }
        });
    }

    // 2. Envio do Formulário
    if (companyRegisterForm) {
        companyRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('comp-password').value;
            const confirmPassword = document.getElementById('comp-confirm-password').value;

            // Validação de Senha
            if (password !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }

            const btn = companyRegisterForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            try {
                btn.innerText = 'Enviando cadastro...';
                btn.disabled = true;

                // Coleta dos dados usando FormData
                const formData = new FormData();
                
                // Dados de texto
                formData.append('name', document.getElementById('comp-name').value);
                formData.append('cnpj', document.getElementById('comp-cnpj').value);
                formData.append('category', document.getElementById('comp-category').value);
                formData.append('phone', document.getElementById('comp-phone').value);
                formData.append('address', document.getElementById('comp-address').value);
                formData.append('website', document.getElementById('comp-website').value);
                formData.append('description', document.getElementById('comp-desc').value);
                formData.append('email', document.getElementById('comp-email').value);
                formData.append('password', password);
                formData.append('role', 'company');

                // --- AQUI ESTÁ A CORREÇÃO PRINCIPAL ---
                // Adiciona CADA arquivo selecionado ao FormData
                if (fileInput.files.length > 0) {
                    for (let i = 0; i < fileInput.files.length; i++) {
                        // 'photos' é a chave que o backend vai ler (deve ser a mesma configurada no Multer)
                        formData.append('photos', fileInput.files[i]);
                    }
                }

                // Envio para o Backend
                const response = await fetch(`${API_URL}/companies/register`, {
                    method: 'POST',
                    body: formData 
                    // Nota: Não definimos 'Content-Type' aqui, o navegador faz isso automaticamente para multipart/form-data
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Empresa cadastrada com sucesso! Bem-vindo ao Tour.In Business.');
                    window.location.href = 'login.html'; 
                } else {
                    alert('Erro: ' + (data.message || 'Não foi possível cadastrar a empresa.'));
                }
            } catch (error) {
                console.error('Erro de rede:', error);
                alert('Erro de conexão com o servidor.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});