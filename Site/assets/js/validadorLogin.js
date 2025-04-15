async function validadorLogin(){

let uri = "http://localhost:3000/alunos";

let matriculaInput = document.getElementById("matricula").value;
let senhaInput = document.getElementById("senha").value;
let matriculaClasse = document.getElementById("matricula").classList;
let senhaClasse = document.getElementById("senha").classList;
let erro = document.getElementById("error-message");
let load = document.getElementById("loading").style.visibility;
let btn = document.getElementById("btn");

const res = await fetch(uri);
const alunos = await res.json();

load = "visible";
btn.setAttribute("disabled","disabled");

await alunos.forEach(aluno => {
    
    if (aluno.matricula == matriculaInput && aluno.senha == senhaInput){
        //window.location.replace("login.html")
    } 

});

matriculaClasse.add("is-invalid");
senhaClasse.add("is-invalid");
erro.innerHTML = "Matricula ou senha incorretos. Por favor, tente novamente";
btn.removeAttribute("disabled");
}
