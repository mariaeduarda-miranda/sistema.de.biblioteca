from sqlalchemy.orm import Session
from models import Livro, Usuario, Emprestimo
from typing import List, Optional
from datetime import datetime


class LivroRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(self, livro: Livro) -> Livro:
        if self.buscar_por_isbn(livro.isbn):
            raise ValueError(f"ISBN {livro.isbn} já cadastrado")

        try:
            self.db.add(livro)
            self.db.commit()
            self.db.refresh(livro)
            return livro
        except IntegrityError as e:
            self.db.rollback()
            raise ValueError("Erro de integridade no banco de dados") from e
        
    def listar_todos(self) -> List[Livro]:
        """Lista todos os livros cadastrados"""
        return self.db.query(Livro).all()
        
    def buscar_por_isbn(self, isbn: str) -> Optional[Livro]:
        return self.db.query(Livro).filter(Livro.isbn == isbn).first()
    
    


class UsuarioRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(self, usuario: Usuario) -> Usuario:
        """Cria um novo usuário no banco de dados"""
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def buscar_por_id(self, usuario_id: int) -> Optional[Usuario]:
        """Busca um usuário pelo ID"""
        return self.db.query(Usuario).filter(Usuario.id == usuario_id).first()

    def buscar_por_email(self, email: str) -> Optional[Usuario]:
        """Busca um usuário pelo email"""
        return self.db.query(Usuario).filter(Usuario.email == email).first()

    def listar_todos(self) -> List[Usuario]:
        """Lista todos os usuários cadastrados"""
        return self.db.query(Usuario).all()

    def atualizar(self, usuario_id: int,
                  usuario_data: dict) -> Optional[Usuario]:
        """Atualiza os dados de um usuário"""
        usuario = self.buscar_por_id(usuario_id)
        if usuario:
            for key, value in usuario_data.items():
                setattr(usuario, key, value)
            self.db.commit()
            self.db.refresh(usuario)
        return usuario

    def remover(self, usuario_id: int) -> bool:
        """Remove um usuário do banco de dados"""
        usuario = self.buscar_por_id(usuario_id)
        if usuario:
            self.db.delete(usuario)
            self.db.commit()
            return True
        return False

    def desativar(self, usuario_id: int) -> Optional[Usuario]:
        """Desativa um usuário (soft delete)"""
        usuario = self.buscar_por_id(usuario_id)
        if usuario:
            usuario.ativo = False
            self.db.commit()
            self.db.refresh(usuario)
        return usuario

class EmprestimoRepository:
    def __init__(self, db: Session):
        self.db = db

    def emprestar(self, livro_id: int, usuario_id: int) -> Emprestimo:
        """Realiza um empréstimo de livro"""
        livro = self.db.query(Livro).filter(Livro.id == livro_id).first()
        if not livro or not livro.disponivel:
            raise ValueError("Livro indisponível")
        
        # Verificar se o usuário já pegou o mesmo livro
        emprestimos_usuario = self.buscar_por_idusuario(usuario_id)
        for emp in emprestimos_usuario:
            if emp.livro_id == livro_id and emp.data_devolucao is None:
                raise ValueError("Usuário já possui este livro emprestado.")

        # Verificar se o usuário já tem mais de dois livros emprestados
        emprestimos_ativos = [emp for emp in emprestimos_usuario if emp.data_devolucao is None]
        if len(emprestimos_ativos) >= 2:
            raise ValueError("Usuário já atingiu o limite de 2 empréstimos.")

        emprestimo = Emprestimo(
            livro_id=livro_id,
            usuario_id=usuario_id,
            data_emprestimo=datetime.now()
        )

        livro.quantidade -= 1

        if (livro.quantidade == 0):
            livro.disponivel = False
        
        self.db.add(emprestimo)
        self.db.commit()
        self.db.refresh(emprestimo)
        return emprestimo
    
    def buscar_por_idusuario(self, usuario_id: int) -> list[Emprestimo]:
        """Busca emprestimos pelo ID do usuario"""
        return self.db.query(Emprestimo).filter(Emprestimo.usuario_id == usuario_id).all()

    def devolver(self, emprestimo_id: int) -> Emprestimo:
        """Registra a devolução de um livro"""
        emprestimo = self.db.query(Emprestimo).filter(
            Emprestimo.id == emprestimo_id
        ).first()

        if not emprestimo:
            raise ValueError("Empréstimo não encontrado")

        livro = emprestimo.livro
        livro.disponivel = True
        emprestimo.devolvido = True
        emprestimo.data_devolucao = datetime.now()

        self.db.commit()
        self.db.refresh(emprestimo)
        return emprestimo
    