<<<<<<< HEAD
-- ═══════════════════════════════════════════════════════
-- Tour.In — Seed de Dados: Brasília, DF (Expandido)
-- ═══════════════════════════════════════════════════════

-- ── LUGARES ──────────────────────────────────────────────
INSERT OR IGNORE INTO places (name, description, category, address, lat, lon, image_url) VALUES

-- Turismo / Pontos Históricos
('Esplanada dos Ministérios', 'Conjunto monumental com os ministérios e o Congresso Nacional, coração do poder político brasileiro.', 'tourism', 'Esplanada dos Ministérios, Brasília - DF', -15.7998, -47.8645, NULL),
('Congresso Nacional', 'Sede do Poder Legislativo brasileiro, obra-prima de Oscar Niemeyer com as cúpulas icônicas.', 'tourism', 'Praça dos Três Poderes, Brasília - DF', -15.7998, -47.8615, NULL),
('Palácio do Planalto', 'Sede do governo federal brasileiro, projetado por Niemeyer com suas colunas sinuosas.', 'tourism', 'Praça dos Três Poderes, Brasília - DF', -15.7994, -47.8607, NULL),
('Catedral Metropolitana', 'Igreja em formato de coroa de espinhos projetada por Oscar Niemeyer, com vitrais de Marianne Peretti.', 'tourism', 'Esplanada dos Ministérios, Brasília - DF', -15.7986, -47.8753, NULL),
('Palácio da Alvorada', 'Residência oficial do Presidente da República, com arquitetura modernista às margens do Lago Paranoá.', 'tourism', 'Via N2, Brasília - DF', -15.7937, -47.8869, NULL),
('Memorial JK', 'Museu dedicado à memória do presidente Juscelino Kubitschek, fundador de Brasília.', 'tourism', 'Eixo Monumental, Brasília - DF', -15.7946, -47.8992, NULL),
('Torre de TV de Brasília', 'Mirante com vista panorâmica da cidade e feira de artesanato no pé da torre.', 'tourism', 'Eixo Monumental, Brasília - DF', -15.7908, -47.8914, NULL),
('Santuário Dom Bosco', 'Igreja com paredes de vidro azul que cria um efeito visual único e espiritual.', 'tourism', 'W3 Sul, Brasília - DF', -15.8025, -47.9092, NULL),
('Palácio Itamaraty', 'Sede do Ministério das Relações Exteriores, obra de Niemeyer com jardins de Burle Marx.', 'tourism', 'Esplanada dos Ministérios, Brasília - DF', -15.7992, -47.8775, NULL),
('Palácio da Justiça', 'Sede do Ministério da Justiça com cascatas d''água nas fachadas, projeto de Niemeyer.', 'tourism', 'Esplanada dos Ministérios, Brasília - DF', -15.7990, -47.8720, NULL),
('Supremo Tribunal Federal', 'Sede máxima do Judiciário brasileiro na Praça dos Três Poderes.', 'tourism', 'Praça dos Três Poderes, Brasília - DF', -15.8008, -47.8603, NULL),
('Praça dos Três Poderes', 'Coração político de Brasília, reunindo o Executivo, Legislativo e Judiciário.', 'tourism', 'Praça dos Três Poderes, Brasília - DF', -15.7999, -47.8610, NULL),
('Panteão da Pátria', 'Memorial dedicado aos heróis nacionais na Praça dos Três Poderes, com chama eterna.', 'tourism', 'Praça dos Três Poderes, Brasília - DF', -15.7994, -47.8618, NULL),
('Espaço Lúcio Costa', 'Memorial do urbanista que planejou Brasília, com maquete original da cidade.', 'tourism', 'Praça dos Três Poderes, Brasília - DF', -15.7995, -47.8625, NULL),
('Pontão do Lago Sul', 'Complexo de lazer à beira do Lago Paranoá com restaurantes, lojas e esportes aquáticos.', 'tourism', 'SHIS QI 10, Lago Sul, Brasília - DF', -15.8300, -47.8650, NULL),
('Catetinho', 'Primeira residência oficial do presidente no DF, construída em madeira em 1956.', 'tourism', 'BR-040 km 0, Brasília - DF', -15.8625, -47.9647, NULL),

-- Natureza e Parques
('Parque Nacional de Brasília (Água Mineral)', 'Reserva natural com piscinas de água mineral, trilhas e mata nativa do Cerrado.', 'nature', 'Via EPIA Norte, Brasília - DF', -15.7197, -48.0108, NULL),
('Parque da Cidade Sarah Kubitschek', 'O maior parque urbano da América Latina, com lagos, ciclovia, quadras esportivas e lazer.', 'nature', 'Setor de Diversões Sul, Brasília - DF', -15.8192, -47.9256, NULL),
('Jardim Botânico de Brasília', 'Preserva espécies do Cerrado com trilhas ecológicas, herbário e jardim de sensações.', 'nature', 'Brasília - DF', -15.8728, -47.8467, NULL),
('Parque Olhos d''Água', 'Refúgio ecológico urbano com trilhas, lagos e nascentes, no coração da Asa Norte.', 'nature', 'Asa Norte, Brasília - DF', -15.7494, -47.8906, NULL),
('Lago Paranoá', 'Lago artificial de 40 km², com orla repleta de restaurantes, bares e esportes náuticos.', 'nature', 'Lago Paranoá, Brasília - DF', -15.7894, -47.8569, NULL),
('Chapada Imperial', 'Área natural com vistas incríveis do Cerrado, cachoeiras e trilhas para ecoturismo.', 'nature', 'Planaltina, DF', -15.6100, -47.6800, NULL),
('Parque Ecológico de Águas Claras', 'Parque com trilhas entre matas de galeria, ideal para caminhadas e observação de aves.', 'nature', 'Águas Claras, Brasília - DF', -15.8417, -48.0308, NULL),
('Parque do Guará', 'Área verde com campos de futebol, pistas de cooper e espaços para lazer familiar.', 'nature', 'Guará, Brasília - DF', -15.8228, -47.9908, NULL),
('Reservatório de Santa Maria', 'Represa que abastece Brasília com área de preservação ambiental e trilhas.', 'nature', 'Via EPIA Norte, DF', -15.7050, -47.9517, NULL),
('Parque Recreativo do Gama', 'Grande parque com lagos, ciclovia e espaços de lazer no Gama, DF.', 'nature', 'Gama, Brasília - DF', -16.0156, -48.0758, NULL),
('Cachoeira do Saia Velha', 'Bela cachoeira no entorno do DF com trilha de fácil acesso no Cerrado.', 'nature', 'Santa Maria, Brasília - DF', -16.0350, -47.9800, NULL),
('Vale do Amanhecer', 'Sítio religioso único com templos e esculturas na cidade de Planaltina.', 'nature', 'Planaltina, DF', -15.6392, -47.7244, NULL),

-- Gastronomia
('Universal Diner', 'Bar e restaurante icônico no Lago Sul com culinária variada e vista para o Lago Paranoá.', 'gastronomy', 'SHIS QI 9, Lago Sul, Brasília - DF', -15.8270, -47.8614, NULL),
('Fogo de Chão Brasília', 'Churrascaria premium com cortes nobres e ambiente sofisticado na área central.', 'gastronomy', 'SHS Quadra 6, Asa Sul, Brasília - DF', -15.7972, -47.8961, NULL),
('Piantella', 'Restaurante italiano clássico de Brasília, um dos mais tradicionais da capital, no Setor Comercial.', 'gastronomy', 'SCS Quadra 2, Brasília - DF', -15.7972, -47.8929, NULL),
('Via Lago Restaurante', 'Gastronomia contemporânea à beira do Lago Paranoá, famoso pelo pôr do sol deslumbrante.', 'gastronomy', 'SHTN Trecho 1, Lago Norte, Brasília - DF', -15.7383, -47.8664, NULL),
('Beirute Asa Sul', 'Bar e restaurante árabe tradicional, ponto de encontro cultural da intelectualidade brasiliense.', 'gastronomy', 'CLS 109, Asa Sul, Brasília - DF', -15.8157, -47.9100, NULL),
('Mercado do Produtor de Sobradinho', 'Feira de produtos orgânicos e regionais do cerrado com comidas tradicionais do DF.', 'gastronomy', 'Sobradinho, DF', -15.6525, -47.7847, NULL),
('Mangai Brasília', 'Restaurante nordestino com enorme variedade de pratos típicos em ambiente temático.', 'gastronomy', 'SCN Quadra 2, Asa Norte, Brasília - DF', -15.7708, -47.8917, NULL),
('Restaurante do Lago', 'Culinária regional brasileira com vista privilegiada para o Lago Paranoá.', 'gastronomy', 'SHTN Trecho 1, Lago Norte, Brasília - DF', -15.7390, -47.8671, NULL),
('Dom Francisco', 'Alta gastronomia brasileira contemporânea em ambiente sofisticado no Sudoeste.', 'gastronomy', 'SQSW 301, Sudoeste, Brasília - DF', -15.8006, -47.9275, NULL),
('Baco Asa Norte', 'Bar de vinhos e petiscos no coração da Asa Norte com curadoria especial.', 'gastronomy', 'CLN 408, Asa Norte, Brasília - DF', -15.7564, -47.8878, NULL),
('Mercado Conjunto Nacional', 'Praça de alimentação e lojas no tradicional Conjunto Nacional no Plano Piloto.', 'gastronomy', 'SDN Lote 12, Asa Norte, Brasília - DF', -15.7894, -47.8928, NULL),
('La Chaumière', 'Clássico restaurante francês de Brasília funcionando desde 1965 no Setor Hoteleiro.', 'gastronomy', 'SHS Quadra 1, Asa Sul, Brasília - DF', -15.7989, -47.8994, NULL),
('Comida di Buteco Brasília', 'Festival gastronômico itinerante com petiscos criativos e muita cerveja artesanal.', 'gastronomy', 'Vários bairros, Brasília - DF', -15.7942, -47.8825, NULL),

-- Cultura
('Centro Cultural Banco do Brasil Brasília', 'Espaço cultural com exposições de arte, cinema, teatro e oficinas gratuitas.', 'culture', 'SCS Quadra 6, Brasília - DF', -15.7952, -47.8917, NULL),
('Complexo Cultural da República', 'Conjunto com o Museu Nacional e a Biblioteca Nacional de Brasília.', 'culture', 'Via N2, Setor Cultural Norte, Brasília - DF', -15.7920, -47.8780, NULL),
('Cine Brasília', 'Inaugurado em 1960, é um dos cinemas mais antigos em funcionamento no Brasil.', 'culture', 'SEPS EQ 712/912, Asa Sul, Brasília - DF', -15.8150, -47.8972, NULL),
('Espaço Cultural FUNARTE', 'Centro de artes cênicas com teatro, galeria e programação cultural diversificada.', 'culture', 'SDS Ed. Sede I, Brasília - DF', -15.7944, -47.8917, NULL),
('Museu Nacional Honestino Guimarães', 'O maior museu do Brasil, em formato de flor, com coleções históricas e exposições temporárias.', 'culture', 'Via N2, Setor Cultural Norte, Brasília - DF', -15.7920, -47.8802, NULL),
('Biblioteca Nacional de Brasília', 'Uma das maiores bibliotecas do país com acervo digital e espaços de leitura.', 'culture', 'Via N2, Setor Cultural Norte, Brasília - DF', -15.7925, -47.8790, NULL),
('Teatro Nacional Claudio Santoro', 'Principal teatro de Brasília com salas Villa-Lobos e Martins Pena para grandes espetáculos.', 'culture', 'Via N2, Setor Cultural Norte, Brasília - DF', -15.7906, -47.8806, NULL),
('Museu de Arte de Brasília (MAB)', 'Acervo com obras de artistas brasileiros do século XX às margens do Lago Paranoá.', 'culture', 'SHTN Trecho 01, Lago Norte, Brasília - DF', -15.7381, -47.8653, NULL),
('Museu Vivo da Memória Candanga', 'Museu ao ar livre com casas originais da época da construção de Brasília.', 'culture', 'BR-040 km 0, Brasília - DF', -15.8692, -47.9611, NULL),
('Centro de Excelência em Turismo UnB', 'Espaço acadêmico com exposições e eventos sobre turismo, cultura e patrimônio.', 'culture', 'UnB - Campus Darcy Ribeiro, Brasília - DF', -15.7641, -47.8722, NULL),
('Galeria de Arte da Caixa Brasília', 'Exposições de artes visuais de artistas emergentes e consolidados.', 'culture', 'SBS Quadra 4, Asa Sul, Brasília - DF', -15.7958, -47.8892, NULL),

-- Vida Noturna
('Clube do Choro de Brasília', 'Espaço dedicado ao choro com shows ao vivo às sextas-feiras e bom ambiente.', 'nightlife', 'SEPS EQ 712/912, Asa Sul, Brasília - DF', -15.8136, -47.8986, NULL),
('Brasília Palace Hotel Bar', 'Bar histórico no hotel de Niemeyer às margens do Lago Paranoá com drinks sofisticados.', 'nightlife', 'Setor de Hotéis e Turismo Norte, Brasília - DF', -15.7389, -47.8578, NULL),
('Calaf Restaurante e Bar', 'Bares e vida noturna no Setor de Hotéis, com música ao vivo e cozinha contemporânea.', 'nightlife', 'SHS Quadra 1, Brasília - DF', -15.7983, -47.8983, NULL),
('Bar Beirute Asa Norte', 'Versão norte da tradicional casa árabe, com petiscos e chopeira sempre cheia.', 'nightlife', 'CLN 211, Asa Norte, Brasília - DF', -15.7578, -47.8856, NULL),
('Hangar 110', 'Casa noturna referência em música eletrônica e shows nacionais no Lago Norte.', 'nightlife', 'Lago Norte, Brasília - DF', -15.7328, -47.8711, NULL),
('Bar do Museu', 'Bar cultural no Complexo Cultural da República com drinks criativos e vista.', 'nightlife', 'Setor Cultural Norte, Brasília - DF', -15.7918, -47.8797, NULL),
('Bardana', 'Bar com menu descomplicado e cerveja artesanal na W3 Sul.', 'nightlife', 'W3 Sul, Asa Sul, Brasília - DF', -15.8089, -47.9017, NULL),
('D.A. Bier', 'Boteco moderno com grande seleção de cervejas artesanais nacionais e importadas.', 'nightlife', 'CLN 305, Asa Norte, Brasília - DF', -15.7586, -47.8844, NULL),

-- Compras e Shoppings
('Shopping Conjunto Nacional', 'Um dos mais tradicionais da capital, no Plano Piloto, com lojas âncora e praça de alimentação.', 'tourism', 'SDN Lote 12, Asa Norte, Brasília - DF', -15.7894, -47.8928, NULL),
('Pátio Brasil Shopping', 'Shopping moderno com mix de lojas, restaurantes e cinema no coração do Plano Piloto.', 'tourism', 'SCS Quadra 7/8, Asa Sul, Brasília - DF', -15.7936, -47.8978, NULL),
('Brasília Shopping', 'Grande centro comercial com lojas nacionais e internacionais no Setor Noroeste.', 'tourism', 'SCN Quadra 5, Asa Norte, Brasília - DF', -15.7711, -47.8906, NULL),
('ParkShopping Brasília', 'Shopping amplo com teatro, restaurantes e lojas no Guará/Park Way.', 'tourism', 'Estr. Parque Indústria e Abastecimento, Brasília - DF', -15.8489, -48.0081, NULL),
('Feira da Torre de TV', 'Tradicional feira de artesanato brasiliense com cerâmica, couro e produtos do Cerrado.', 'culture', 'Eixo Monumental, Brasília - DF', -15.7908, -47.8922, NULL);

-- ── EVENTOS ──────────────────────────────────────────────
INSERT OR IGNORE INTO events (title, description, date, location, category, lat, lon, image_url, company_id) VALUES

-- Gastronomia
('Festival Gastronômico de Brasília', 'Os melhores chefs da capital apresentam pratos típicos do cerrado e releituras da culinária brasileira. Entrada franca.', '2025-09-15 11:00:00', 'Parque da Cidade, Brasília - DF', 'gastronomy', -15.8192, -47.9256, NULL, NULL),
('Brasília Beer Week', 'Semana dedicada à cerveja artesanal com mais de 30 produtores locais e gastronomia harmonizada.', '2025-10-10 12:00:00', 'Complexo Beira Lago, Lago Norte, Brasília - DF', 'gastronomy', -15.7383, -47.8664, NULL, NULL),
('Comida di Buteco BSB', 'Festival de petiscos criativos em bares selecionados da capital com votação popular.', '2025-09-01 17:00:00', 'Vários bares, Brasília - DF', 'gastronomy', -15.7972, -47.8929, NULL, NULL),
('Festival Cerrado Gourmet', 'Degustação de produtos e pratos com ingredientes nativos do Cerrado como pequi, baru e cagaita.', '2025-08-16 10:00:00', 'Mercado do Produtor, Sobradinho - DF', 'gastronomy', -15.6525, -47.7847, NULL, NULL),
('Noite de Vinhos do DF', 'Evento com rótulos nacionais e internacionais, harmonizações guiadas e música ao vivo.', '2025-11-15 19:00:00', 'CCBB Brasília, Brasília - DF', 'gastronomy', -15.7952, -47.8917, NULL, NULL),

-- Cultura
('Exposição Niemeyer - 50 anos de Brasília', 'Mostra fotográfica e documental sobre a arquitetura modernista de Oscar Niemeyer na capital federal.', '2025-08-20 10:00:00', 'Museu Nacional, Brasília - DF', 'culture', -15.7920, -47.8802, NULL, NULL),
('Feira do Livro de Brasília', 'Maior evento literário do DF com lançamentos, bate-papos com autores e atividades para crianças.', '2025-11-01 10:00:00', 'Pátio Brasil Shopping, Brasília - DF', 'culture', -15.7936, -47.8978, NULL, NULL),
('Noite dos Museus de Brasília', 'Uma noite especial com os museus da capital abertos gratuitamente até meia-noite.', '2025-10-18 18:00:00', 'Complexo Cultural da República, Brasília - DF', 'culture', -15.7920, -47.8780, NULL, NULL),
('Circuito de Arte Urbana BSB', 'Festival de grafite e arte urbana que transforma murais do DF em obras de arte contemporâneas.', '2025-09-01 10:00:00', 'Setor Comercial Sul, Brasília - DF', 'culture', -15.7972, -47.8929, NULL, NULL),
('Festival Folclórico do DF', 'Apresentações de danças e músicas folclóricas de diversas regiões do Brasil no coração de Brasília.', '2025-09-08 15:00:00', 'Espaço Cultural FUNARTE, Brasília - DF', 'culture', -15.7944, -47.8917, NULL, NULL),
('Feira de Artesanato da Torre de TV', 'Tradicional feira semanal com artesanato local, bijuterias, cerâmica e produtos do cerrado.', '2025-08-10 09:00:00', 'Torre de TV, Eixo Monumental, Brasília - DF', 'culture', -15.7908, -47.8914, NULL, NULL),
('Mostra de Cinema de Brasília', 'Festival de cinema nacional com sessões gratuitas e debates com diretores e atores.', '2025-10-25 14:00:00', 'Cine Brasília, Asa Sul - DF', 'culture', -15.8150, -47.8972, NULL, NULL),
('Semana Nacional de Ciência e Tecnologia', 'Palestras, workshops e exposições abertas ao público sobre inovação, ciência e tecnologia.', '2025-10-20 09:00:00', 'UnB - Universidade de Brasília, Brasília - DF', 'education', -15.7641, -47.8722, NULL, NULL),
('Semana dos Museus BSB', 'Programação especial em todos os museus de Brasília com atividades educativas e visitas guiadas.', '2025-05-18 09:00:00', 'Complexo Cultural da República, Brasília - DF', 'culture', -15.7920, -47.8780, NULL, NULL),
('Carnaval Fora de Época BSB', 'Blocos de rua e shows especiais espalhados pela cidade durante o mês de agosto.', '2025-08-02 15:00:00', 'Setor de Diversões Sul, Brasília - DF', 'culture', -15.8140, -47.9172, NULL, NULL),

-- Música
('Rock in Brasília', 'Festival de rock nacional com bandas consagradas e revelações do cenário alternativo brasileiro.', '2025-10-05 16:00:00', 'Estádio Nacional Mané Garrincha, Brasília - DF', 'music', -15.7835, -47.8997, NULL, NULL),
('Brasília Jazz Festival', 'Festival de jazz e MPB com artistas nacionais e internacionais no coração da cidade.', '2025-11-08 19:00:00', 'Anfiteatro Simón Bolivar, Brasília - DF', 'music', -15.7956, -47.8903, NULL, NULL),
('Festival de Música do Cerrado', 'Celebração da música popular brasileira com artistas da região centro-oeste.', '2025-09-20 16:00:00', 'Parque da Cidade, Brasília - DF', 'music', -15.8192, -47.9256, NULL, NULL),
('Noite de MPB na Torre', 'Apresentações de música popular brasileira ao pé da Torre de TV com entrada gratuita.', '2025-08-08 19:00:00', 'Torre de TV, Eixo Monumental, Brasília - DF', 'music', -15.7908, -47.8914, NULL, NULL),
('Show de Réveillon de Brasília', 'Grande show com queima de fogos na Esplanada dos Ministérios para receber o Ano Novo.', '2025-12-31 22:00:00', 'Esplanada dos Ministérios, Brasília - DF', 'nightlife', -15.7998, -47.8645, NULL, NULL),
('Festival Eletrônico do Lago', 'Festa com DJs nacionais e internacionais às margens do Lago Paranoá.', '2025-10-12 20:00:00', 'Orla do Lago Norte, Brasília - DF', 'music', -15.7350, -47.8700, NULL, NULL),
('Concerto Sinfônico ao Ar Livre', 'A Orquestra Sinfônica do Teatro Nacional se apresenta gratuitamente na Esplanada.', '2025-09-28 19:30:00', 'Esplanada dos Ministérios, Brasília - DF', 'music', -15.7998, -47.8645, NULL, NULL),

-- Esportes
('Corrida da Primavera do DF', 'Corrida de rua de 10km e 5km pela orla do Lago Paranoá, para todos os níveis.', '2025-09-22 06:30:00', 'Orla do Lago Paranoá, Brasília - DF', 'sports', -15.7894, -47.8569, NULL, NULL),
('Maratona de Brasília', 'Tradicional maratona que percorre os principais pontos turísticos da capital com 42km de percurso.', '2025-08-31 05:30:00', 'Esplanada dos Ministérios, Brasília - DF', 'sports', -15.7998, -47.8645, NULL, NULL),
('Campeonato de Stand Up Paddle Lago Paranoá', 'Disputa entre praticantes de SUP no Lago Paranoá com categorias amador e profissional.', '2025-09-14 07:00:00', 'Pontão do Lago Sul, Brasília - DF', 'sports', -15.8300, -47.8650, NULL, NULL),
('Torneio de Vôlei de Praia BSB', 'Torneio aberto de vôlei de praia nas areias do Lago Paranoá.', '2025-08-23 08:00:00', 'Orla Gratuita Lago Norte, Brasília - DF', 'sports', -15.7380, -47.8680, NULL, NULL),
('Corrida pela Natureza no Parque Nacional', 'Trail run no Parque Nacional de Brasília entre matas do Cerrado.', '2025-09-06 06:00:00', 'Parque Nacional de Brasília, DF', 'sports', -15.7197, -48.0108, NULL, NULL),
('Torneio Escolar de Xadrez do DF', 'Competição entre estudantes das escolas públicas e privadas do Distrito Federal.', '2025-10-04 09:00:00', 'Biblioteca Nacional, Brasília - DF', 'sports', -15.7925, -47.8790, NULL, NULL),

-- Natureza / Ecoturismo
('Caminhada Ecológica no Parque Nacional', 'Trilha guiada pelo Parque Nacional de Brasília com biólogos explicando a fauna e flora do Cerrado.', '2025-08-24 07:00:00', 'Parque Nacional de Brasília, DF', 'nature', -15.7197, -48.0108, NULL, NULL),
('Tour pelo Jardim Botânico', 'Visita guiada ao Jardim Botânico de Brasília com foco nas espécies ameaçadas do Cerrado.', '2025-09-27 08:00:00', 'Jardim Botânico de Brasília, DF', 'nature', -15.8728, -47.8467, NULL, NULL),
('Observação de Aves no Cerrado', 'Saída de campo matinal para observação de aves nativas do Cerrado com ornitólogos.', '2025-08-17 05:30:00', 'Parque Olhos d''Água, Asa Norte - DF', 'nature', -15.7494, -47.8906, NULL, NULL),
('Foto Safari no Cerrado', 'Passeio fotográfico ao amanhecer pela Chapada Imperial para registrar a fauna e flora.', '2025-09-13 05:00:00', 'Chapada Imperial, Planaltina - DF', 'nature', -15.6100, -47.6800, NULL, NULL),
('Piquenique Cultural no Parque da Cidade', 'Evento ao ar livre com música, teatro de rua e gastronomia no Parque da Cidade.', '2025-10-19 10:00:00', 'Parque da Cidade Sarah Kubitschek, Brasília - DF', 'nature', -15.8192, -47.9256, NULL, NULL),

-- Educação / Negócios
('Forum de Inovação de Brasília', 'Evento com startups, investidores e palestrantes sobre tecnologia e empreendedorismo no DF.', '2025-11-05 09:00:00', 'Centro de Convenções Ulysses Guimarães, Brasília - DF', 'education', -15.7864, -47.8953, NULL, NULL),
('Workshop de Fotografia Urbana BSB', 'Oficina de fotografia pelas ruas e monumentos de Brasília com instrutores profissionais.', '2025-09-13 08:00:00', 'Esplanada dos Ministérios, Brasília - DF', 'education', -15.7998, -47.8645, NULL, NULL),
('Encontro de Turismo Sustentável', 'Debate sobre turismo responsável e desenvolvimento sustentável no Cerrado.', '2025-10-17 09:00:00', 'UnB - Universidade de Brasília, DF', 'education', -15.7641, -47.8722, NULL, NULL),

-- Vida Noturna / Especiais
('Festa Junina da Esplanada', 'A maior festa junina do Centro-Oeste na Esplanada com forró, quadrilha e comidas típicas.', '2025-06-14 16:00:00', 'Esplanada dos Ministérios, Brasília - DF', 'nightlife', -15.7998, -47.8645, NULL, NULL),
('Halloween BSB', 'Festa temática de Halloween com decoração especial e concurso de fantasias no Lago Norte.', '2025-10-31 20:00:00', 'Pontão do Lago Sul, Brasília - DF', 'nightlife', -15.8300, -47.8650, NULL, NULL),
('Virada Cultural de Brasília', 'Maratona cultural de 24 horas com shows, exposições e performances gratuitas pela cidade.', '2025-11-22 18:00:00', 'Plano Piloto, Brasília - DF', 'culture', -15.7942, -47.8825, NULL, NULL);
=======
INSERT INTO places (name, description, category, latitude, longitude, rating) VALUES 
('Museu de Arte Moderna', 'Exposições de arte contemporânea e arquitetura icônica.', 'culture', -23.587416, -46.657634, 4.8),
('Bistrô Sabor & Arte', 'Gastronomia francesa com toques brasileiros.', 'gastronomy', -23.550520, -46.633309, 4.5),
('Parque Ibirapuera', 'O maior parque urbano da cidade, ideal para esportes.', 'nature', -23.58741, -46.65763, 4.9),
('Bar do Jazz', 'Música ao vivo e ótimos drinks.', 'nightlife', -23.56141, -46.65588, 4.2);
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
