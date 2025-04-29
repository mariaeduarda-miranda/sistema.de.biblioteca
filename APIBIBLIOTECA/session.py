from fastapi import FastAPI, Depends, HTTPException
from starlette.requests import Request
from starlette.responses import Response
from fastapi_sessions.session_middleware import SessionMiddleware
from fastapi_sessions.backends.in_memory import InMemoryBackend
from uuid import UUID
from typing import Optional
from models import Usuario
from repositories import UsuarioRepository

app = FastAPI()

SECRET_KEY = "super-secret-key-for-sessions"

backend = InMemoryBackend[UUID](secret_key=SECRET_KEY)

app.add_middleware(SessionMiddleware, backend=backend, cookie_https_only=True)

class SessionData:
    user_id: Optional[int] = None
    username: Optional[str] = None

async def get_session_id(request: Request) -> Optional[UUID]:
    return UUID(request.session.get("session_id")) if request.session.get("session_id") else None

async def get_session_data(session_id: Optional[UUID] = Depends(get_session_id), request: Request = None) -> Optional[SessionData]:
    if session_id:
        data = await backend.read(session_id)
        if data:
            return SessionData(**data)
    return None

@app.post("/login/")
async def login(username: str, password: str, response: Response, db: Session = Depends(get_db)):

    repo = UsuarioRepository(db)
    

    repo
    session_id = UUID(str(user_id))
    session_data = SessionData(user_id=user_id, username=username)
    await backend.create(session_id, session_data.dict())
    request.session["session_id"] = str(session_id)
    return {"message": f"Login realizado para o usuário {username}", "session_id": session_id}

@app.get("/me")
async def get_me(session_data: Optional[SessionData] = Depends(get_session_data)):
    if session_data:
        return session_data
    raise HTTPException(status_code=401, detail="Não autenticado")