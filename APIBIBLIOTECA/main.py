from fastapi import FastAPI, Depends, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, Base, engine
from models import Livro, Usuario, Emprestimo
from schemas import LivroSchema, UsuarioSchema, EmprestimoSchema, UsuarioLogin
from repositories import LivroRepository, EmprestimoRepository, UsuarioRepository
from typing import List, Optional

# Cria as tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

# -----------------------------------------------------------------------------------------------------------
# Rotas para Livros
@app.post("/livros", response_model=LivroSchema)
def criar_livro(livro: LivroSchema, db: Session = Depends(get_db)):
    repo = LivroRepository(db)
    livro_db = Livro(**livro.model_dump())

    try:
        return repo.criar(livro_db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except sqlalchemy.exc.IntegrityError as e:
        if "UNIQUE constraint failed: livros.isbn" in str(e):
            raise HTTPException(
                status_code=400,
                detail=f"Já existe um livro com o ISBN {livro.isbn}"
            )
        raise HTTPException(status_code=500, detail="Erro no banco de dados")

@app.get("/livros", response_model=List[LivroSchema])
def listar_livros(db: Session = Depends(get_db)):
    repo = LivroRepository(db)
    return repo.listar_todos()


@app.get("/livros/{isbn}", response_model=LivroSchema)
def buscar_livro(isbn: str, db: Session = Depends(get_db)):
    repo = LivroRepository(db)
    livro = repo.buscar_por_isbn(isbn)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return livro

@app.get("/livros/verificar-isbn/{isbn}")
def verificar_isbn(isbn: str, db: Session = Depends(get_db)):
    repo = LivroRepository(db)
    if repo.buscar_por_isbn(isbn):
        return {"disponivel": False}
    return {"disponivel": True}
    
# -----------------------------------------------------------------------------------------------------------
# Rotas para Empréstimos
@app.post("/emprestimos", response_model=EmprestimoSchema)
def emprestar_livro(emprestimo: EmprestimoSchema, db: Session = Depends(get_db)):
    repo = EmprestimoRepository(db)
    try:
        return repo.emprestar(emprestimo.livro_id, emprestimo.usuario_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/emprestimos/pendentes", response_model=List[EmprestimoSchema])
def listar_emprestimos_pendentes(db: Session = Depends(get_db)):
    repo = EmprestimoRepository(db)
    try:
        return repo.listar_todos_pendentes()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/emprestimos/{usuario_id}", response_model=List[EmprestimoSchema])
def listar_emprestimos_por_idusuario(usuario_id: int, db: Session = Depends(get_db)):
    repo = EmprestimoRepository(db)
    try:
        return repo.buscar_por_idusuario(usuario_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        return e
    
@app.post("/emprestimos/{emprestimo_id}/devolver", response_model=EmprestimoSchema)
def devolver_livro(emprestimo_id: int, db: Session = Depends(get_db)):
    repo = EmprestimoRepository(db)
    try:
        return repo.devolver(emprestimo_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# -----------------------------------------------------------------------------------------------------------
# Rotas para Usuários
@app.post("/usuarios", response_model=UsuarioSchema)
def criar_usuario(usuario: UsuarioSchema, db: Session = Depends(get_db)):
    repo = UsuarioRepository(db)
    usuario_db = Usuario(**usuario.model_dump())
    return repo.criar(usuario_db)


@app.get("/usuarios/{usuario_id}", response_model=UsuarioSchema)
def buscar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    repo = UsuarioRepository(db)
    usuario = repo.buscar_por_id(usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario


@app.get("/usuarios", response_model=List[UsuarioSchema])
def listar_usuarios(db: Session = Depends(get_db)):
    repo = UsuarioRepository(db)
    return repo.listar_todos()


@app.put("/usuarios/{usuario_id}", response_model=UsuarioSchema)
def atualizar_usuario(usuario_id: int,
                      usuario_data: UsuarioSchema,
                      db: Session = Depends(get_db)):
    repo = UsuarioRepository(db)
    usuario_atualizado = repo.atualizar(usuario_id, usuario_data.model_dump())
    if not usuario_atualizado:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario_atualizado


@app.delete("/usuarios/{usuario_id}")
def remover_usuario(usuario_id: int, db: Session = Depends(get_db)):
    repo = UsuarioRepository(db)
    if not repo.remover(usuario_id):
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário removido com sucesso"}

@app.post("/login")
async def login(response: Response, user_credentials: UsuarioLogin, db: Session = Depends(get_db)):
    repo = UsuarioRepository(db)
    usuario = repo.login(user_credentials.matricula, user_credentials.senha)

    if not usuario:
        raise HTTPException(status_code=401, detail="Matricula ou senha incorretos. Por favor, tente novamente")

    response.set_cookie(key="user_id", value=str(usuario.id), httponly=True, samesite="lax", path="/", secure=False) 
    return {"message": "Login bem-sucedido", "user_id": usuario.id}

@app.get("/me")
async def pegar_id_do_usuario(request: Request):
    id_usuario_cookie = request.cookies.get("user_id")
    if not id_usuario_cookie:
        raise HTTPException(status_code=401, detail="Não autenticado")
    return {"user_id": int(id_usuario_cookie)}

@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="user_id")
    return {"message": "Logout bem-sucedido"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
