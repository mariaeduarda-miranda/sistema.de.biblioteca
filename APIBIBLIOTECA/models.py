from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Livro(Base):
    __tablename__ = "livros"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(100), nullable=False)
    autor = Column(String(100), nullable=False)
    genero = Column(String(100))
    ano = Column(Integer)
    paginas = Column(Integer)
    capa = Column(String(500))
    descricao = Column(String(2000))
    isbn = Column(String(20), unique=True)
    rating = Column(Float)
    disponivel = Column(Boolean, default=True)
    data_cadastro = Column(DateTime, default=datetime.now)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    matricula = Column(String(8), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    senha = Column(String(20), nullable=False)
    ativo = Column(Boolean, default=True)


class Emprestimo(Base):
    __tablename__ = "emprestimos"

    id = Column(Integer, primary_key=True, index=True)
    livro_id = Column(Integer, ForeignKey("livros.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    data_emprestimo = Column(DateTime, default=datetime.now)
    data_devolucao = Column(DateTime, nullable=True)
    devolvido = Column(Boolean, default=False)

    livro = relationship("Livro")
    usuario = relationship("Usuario")
