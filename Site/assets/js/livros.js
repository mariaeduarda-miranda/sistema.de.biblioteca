document.addEventListener("DOMContentLoaded", async () => {
    const alunoLogado = JSON.parse(localStorage.getItem("alunoLogado"));
    if (!alunoLogado) {
      alert("Você precisa estar logado.");
      window.location.href = "login.html";
      return;
    }
  
    const res = await fetch("http://localhost:3000/livros");
    const livros = await res.json();
  
    const livrosAtuais = livros.filter(l => l.aluno_id === alunoLogado.id && l.status === "alugado");
    const livrosDevolvidos = livros.filter(l => l.aluno_id === alunoLogado.id && l.status === "devolvido");
  
    const atualDiv = document.getElementById("atual");
    const historicoDiv = document.getElementById("historico");
  
    atualDiv.innerHTML = livrosAtuais.map(livro => `
      <div class="card">
        <h5>${livro.titulo}</h5>
        <p>Status: Alugado</p>
      </div>
    `).join("");
  
    historicoDiv.innerHTML = livrosDevolvidos.map(livro => `
      <div class="card">
        <h5>${livro.titulo}</h5>
        <p>Status: Devolvido</p>
      </div>
    `).join("");
  });
  
  function mostrarPainel(painel) {
    document.getElementById("atual").style.display = painel === "atual" ? "block" : "none";
    document.getElementById("historico").style.display = painel === "historico" ? "block" : "none";
  }
  