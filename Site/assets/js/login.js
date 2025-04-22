async function validadorLogin() {
    const matricula = document.getElementById("matricula").value;
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("error-message");
  
    const res = await fetch("http://localhost:3000/alunos");
    const alunos = await res.json();
  
    const aluno = alunos.find(a => a.matricula === matricula && a.senha === senha);
  
    if (aluno) {
      localStorage.setItem("alunoLogado", JSON.stringify({
        id: aluno.id,
        nome: aluno.nome
      }));
      window.location.href = "livros-alugados.html";
    } else {
      erro.textContent = "Matrícula ou senha inválida.";
    }
  }
  