document.addEventListener("DOMContentLoaded", function() {
    function OTPInput() {
        const inputs = document.querySelectorAll('#otp > input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('input', function() {
                if (this.value.length > 1) {
                    this.value = this.value[0]; //    
                }
                if (this.value !== '' && i < inputs.length - 1) {
                    inputs[i + 1].focus(); //   
                }
            });

            inputs[i].addEventListener('keydown', function(event) {
                if (event.key === 'Backspace') {
                    this.value = '';
                    if (i > 0) {
                        inputs[i - 1].focus();   
                    }
                }
            });
        }
    }

    OTPInput();
});

const emailSection = document.getElementById("email-section");
const otpSection = document.getElementById("otp-section");
const senhaSection = document.getElementById("senha-section");
let load = document.getElementById("loading");
let btn = document.getElementById('btn');

async function verificarEmail (){
    let uri = "http://localhost:3000/alunos";
    let inputEmail = document.getElementById("email").value;
    let inputBorder = document.getElementById("email").classList;
    const res = await fetch(uri);
    const alunos = await res.json();
    
    load.style.visibility = "visible";
    btn.setAttribute("disabled","disabled");

    await alunos.forEach(aluno => {
        
        if (aluno.email == inputEmail){
            alunoAtual = aluno;
            emailSection.style.display = "none";
            otpSection.style.display = "block";
            document.getElementById("email-enviado").innerHTML = "Um código foi enviado para o seu email " + aluno.email.slice(0, 8) + "********";
            return;
        }

    });
    
    document.getElementById("error-message").innerHTML = "Não encontramos esse e-mail em nossos registros"
    load.style.visibility = "hidden";
    btn.removeAttribute("disabled");
    inputBorder.add("is-invalid");

}

let otpValidador = "000000";

async function verificarOTP(){
    let otp = '';
    document.querySelectorAll('#otp > input').forEach(input => otp += input.value);
    let load = document.getElementById("loading-otp");

    load.style.visibility = "visible";
    document.getElementById("btn-otp").setAttribute("disabled","disabled");

    
    if (otp == otpValidador){
        otpSection.style.display = "none";
        senhaSection.style.display = "block";
        return;
    } else {

    document.getElementById("error-message-otp").innerHTML = "Código incorreto. Verifique o código enviado ao seu e-mail e tente novamente."
    load.style.visibility = "hidden";
    document.getElementById("btn-otp").removeAttribute("disabled");
    }

}

async function verificarSenha(){
    let senha = document.getElementById('nova-senha');
    let senhaC = document.getElementById('nova-senha-confirmar');
    const validador = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]{8,}$/;


    if (!validador.test(senha.value) || !validador.test(senhaC.value)){

        senha.classList.add("is-invalid");
        senhaC.classList.add("is-invalid");
        document.getElementById("error-message-senha").innerHTML = " Sua senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma minúscula, um número e um símbolo especial (como @, #, $, etc)"
        load.style.visibility = "hidden";
        document.getElementById("btn-otp").removeAttribute("disabled");

    } else if (senha.value != senhaC.value){

        senha.classList.add("is-invalid");
        senhaC.classList.add("is-invalid");
        document.getElementById("error-message-senha").innerHTML = "As senhas não coincidem. Verifique e digite a mesma senha nos dois campos."
        load.style.visibility = "hidden";
        document.getElementById("btn-otp").removeAttribute("disabled");

    } else {

        const doc = {
            id: alunoAtual.id,
            nome: alunoAtual.nome,
            matricula: alunoAtual.matricula,
            email: alunoAtual.email,
            senha: senha.value
        }
        
        await fetch('http://localhost:3000/alunos/' + alunoAtual.id, {
            method: 'PUT',
            body: JSON.stringify(doc)
        })
        window.location.replace("login.html");
    }
}