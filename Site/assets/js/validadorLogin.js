async function validadorLogin(){

let uri = "http://localhost:3000/alunos";

let matricula = document.getElementById("matricula").value;
let senha = document.getElementById("senha").value;
let matriculaClasse = document.getElementById("matricula").classList;
let senhaClasse = document.getElementById("senha").classList;
let erro = document.getElementById("error-message");
let load = document.getElementById("loading").style.visibility;
let btn = document.getElementById("btn");

const res = await fetch(uri);
const alunos = await res.json();

load = "visible";
btn.setAttribute("disabled","disabled");

console.log(erro);

await alunos.forEach(aluno => {
    
    if (aluno.matricula == matricula && aluno.senha == senha){
        console.log(":))))))")
        //window.location.replace("login.html")
    } 

});

matriculaClasse.add("is-invalid");
senhaClasse.add("is-invalid");
erro.innerHTML = "Matricula ou senha incorretos. Por favor, tente novamente";
btn.removeAttribute("disabled");
}
