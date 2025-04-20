from pydantic import BaseModel
from datetime import datetime


class LivroSchema(BaseModel):
    id: int
    titulo: str
    autor: str
    genero: str
    ano: int
    paginas: int
    capa: str
    descricao: str
    rating: float
    isbn: str

    class Config:
        from_attributes = True


class UsuarioSchema(BaseModel):
    id: int
    nome: str
    matricula: str
    email: str
    senha: str

    class Config:
        from_attributes = True


class EmprestimoSchema(BaseModel):
    livro_id: int
    usuario_id: int

    class Config:
        from_attributes = True
