(async () => {
     // Base de dados de livros
        let uri = "http://127.0.0.1:8000/livros";
        const res = await fetch(uri);
        const livros = await res.json();
        

        // Variáveis de estado
        let currentFilter = 'all';
        let currentSort = 'title-asc';
        let currentView = 'grid';
        let currentPage = 1;
        const booksPerPage = 8;

        // Inicialização
        renderBooks();
        setupEventListeners();


        // Configura os listeners de eventos
        function setupEventListeners() {
            // Filtros
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.dataset.filter;
                    renderBooks();
                });
            });

            // Ordenação
            document.querySelectorAll('.sort-option').forEach(option => {
                option.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentSort = this.dataset.sort;
                    renderBooks();
                });
            });

            // Visualização (grid/list)
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentView = this.dataset.view;
                    document.getElementById('livros-container').className = `row ${getViewClass()}`;
                });
            });

            // Busca
            document.getElementById('searchForm').addEventListener('submit', function(e) {
                e.preventDefault();
                renderBooks();
            });

            // Filtros do dropdown
            document.querySelectorAll('.dropdown-item[data-filter]').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentFilter = this.dataset.filter;
                    renderBooks();
                });
            });
        }

        // Renderiza os livros com base nos filtros e ordenação
        function renderBooks() {
            const container = document.getElementById('livros-container');
            container.innerHTML = '';
            
            // Filtra os livros
            let filteredBooks = livros.filter(book => {
                const matchesFilter = currentFilter === 'all' || book.genero === currentFilter;
                const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                const matchesSearch = 
                    book.titulo.toLowerCase().includes(searchTerm) || 
                    book.autor.toLowerCase().includes(searchTerm);
                
                return matchesFilter && matchesSearch;
            });

            
            filteredBooks = sortBooks(filteredBooks);

            // Paginação
            const startIndex = (currentPage - 1) * booksPerPage;
            const paginatedBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

            // Renderiza cada livro
            paginatedBooks.forEach(book => {
                const col = document.createElement('div');
                col.className = getColumnClass();
                
                col.innerHTML = `
                    <div class="card livro-card h-100">
                        <img src="${book.capa}" class="card-img-top" alt="${book.titulo}">
                        <div class="card-body">
                            <h5 class="card-title">${book.titulo}</h5>
                            <p class="card-text text-muted">${book.autor}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-primary">${getGenreName(book.genero)}</span>
                                <small class="text-muted">${book.ano}</small>
                        </div>
                    <div class="d-flex justify-content-between">
                         <button class="btn btn-sm btn-outline-primary" onclick="showBookDetails(${book.id})">
                             <i class="bi bi-info-circle"></i> Detalhes
                         </button>
                        <button class="btn btn-sm btn-primary" onclick="reserveBook(${book.id}, 1)">
                 <i class="bi bi-cart-plus"></i> Reservar
                        </button>
                        </div>
                    </div>
                </div>
                `;
                
                container.appendChild(col);
            });

            // Atualiza a paginação
            updatePagination(filteredBooks.length);
        }

        // Retorna a classe de coluna baseada na visualização atual
        function getColumnClass() {
            if (currentView === 'list') return 'col-12';
            return 'col-md-6 col-lg-4 col-xl-3';
        }

        // Retorna a classe de visualização para o container
        function getViewClass() {
            if (currentView === 'list') return 'row-cols-1 g-4 list-view';
            return 'row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4';
        }

        // Ordena os livros baseado no critério atual
        function sortBooks(books) {
            switch(currentSort) {
                case 'title-asc':
                    return books.sort((a, b) => a.titulo.localeCompare(b.titulo));
                case 'title-desc':
                    return books.sort((a, b) => b.titulo.localeCompare(a.titulo));
                case 'year-asc':
                    return books.sort((a, b) => a.ano - b.ano);
                case 'year-desc':
                    return books.sort((a, b) => b.ano - a.ano);
                default:
                    return books;
            }
        }

        // Atualiza os controles de paginação
        function updatePagination(totalBooks) {
            const totalPages = Math.ceil(totalBooks / booksPerPage);
            const pagination = document.querySelector('.pagination');
            
            if (totalPages <= 1) {
                pagination.style.display = 'none';
                return;
            }
            
            pagination.style.display = 'flex';
            let paginationHTML = `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Anterior</a>
                </li>
            `;
            
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                    </li>
                `;
            }
            
            paginationHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Próxima</a>
                </li>
            `;
            
            pagination.innerHTML = paginationHTML;
        }

        // Muda de página
        function changePage(page) {
            if (page < 1 || page > Math.ceil(livros.length / booksPerPage)) return;
            currentPage = page;
            renderBooks();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Mostra os detalhes do livro em um modal
        function showBookDetails(bookId) {
            const book = livros.find(b => b.id === bookId);
            if (!book) return;
        
            const modalContent = document.getElementById('modalBodyContent');
            modalContent.innerHTML = `
                <div class="row">
                    <div class="col-md-5">
                        <img src="${book.capa}" class="img-fluid rounded" alt="${book.titulo}">
                        <div class="mt-3">
                            <h5>Informações</h5>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item"><strong>ISBN:</strong> ${book.isbn}</li>
                                <li class="list-group-item"><strong>Páginas:</strong> ${book.paginas}</li>
                                <li class="list-group-item"><strong>Ano:</strong> ${book.ano}</li>
                                <li class="list-group-item"><strong>Gênero:</strong> ${getGenreName(book.genero)}</li>
                                <li class="list-group-item">
                                    <strong>Avaliação:</strong> 
                                    ${renderRatingStars(book.rating)}
                                    <span class="ms-2">${book.rating}/5.0</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <h3>${book.titulo}</h3>
                        <p class="lead">${book.autor}</p>
                        <hr>
                        <h5>Sinopse</h5>
                        <p>${book.descricao}</p>
                    </div>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('livroModal'));
            modal.show();
        }

        // Faz o emprestimo do livro
        async function reserveBook(bookId, usuarioId){
            const book = livros.find(b => b.id === bookId);
            const usuario = usuarioId;
            if (!book) return;
            
            const doc = {
                usuario_id: usuario,
                livro_id: bookId,
                devolvido: false
            }
            
            response = await fetch('http://127.0.0.1:8000/emprestimos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                  },
                body: JSON.stringify(doc),
            });

            erro = response.json()
            console.log(erro)
        }

        // Retorna o nome do gênero formatado
        function getGenreName(genreKey) {
            const genres = {
                'ficcao': 'Ficção',
                'tecnico': 'Técnico',
                'biografia': 'Biografia'
            };
            return genres[genreKey] || genreKey;
        }

        // Renderiza estrelas de avaliação
        function renderRatingStars(rating) {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let stars = '';
            
            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                    stars += '<i class="bi bi-star-fill text-warning"></i>';
                } else if (i === fullStars + 1 && hasHalfStar) {
                    stars += '<i class="bi bi-star-half text-warning"></i>';
                } else {
                    stars += '<i class="bi bi-star text-warning"></i>';
                }
            }
            
            return stars;
        }

        // Funções globais para chamadas no HTML

        // Fim
        window.changePage = changePage;
        window.showBookDetails = showBookDetails;
        window.reserveBook = reserveBook;

    })();
