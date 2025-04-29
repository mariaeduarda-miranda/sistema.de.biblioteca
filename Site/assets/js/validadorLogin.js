async function verificarCookie(){
    let uri = "http://127.0.0.1:8000/me";
    const res = await fetch(uri);

    if (res){
        window.location.replace("inicio.html");
    }
}

//verificarCookie()

async function validadorLogin() {
    let matriculaInput = document.getElementById("matricula").value;
    let senhaInput = document.getElementById("senha").value;
    let matriculaClasse = document.getElementById("matricula").classList;
    let senhaClasse = document.getElementById("senha").classList;
    let erro = document.getElementById("error-message");
    let loadElement = document.getElementById("loading");
    let btn = document.getElementById("btn");

    const doc = {
        matricula: matriculaInput, 
        senha: senhaInput
    };

    loadElement.style.visibility = "visible";
    btn.setAttribute("disabled", "disabled");
    erro.innerHTML = ""; 
    matriculaClasse.remove("is-invalid");
    senhaClasse.remove("is-invalid");

    try {
        const response = await fetch('http://127.0.0.1:8000/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc),
        });

        loadElement.style.visibility = "hidden";
        btn.removeAttribute("disabled");

        if (response.ok) {
            window.location.replace("inicio.html");
        } else {
            const errorData = await response.json();
            console.error("Erro no login:", errorData);
            matriculaClasse.add("is-invalid");
            senhaClasse.add("is-invalid");
            erro.innerHTML = errorData.detail || "Erro ao fazer login. Por favor, tente novamente.";
        }

    } catch (error) {
        console.error("Erro ao comunicar com o servidor:", error);
        loadElement.style.visibility = "hidden";
        btn.removeAttribute("disabled");
        matriculaClasse.add("is-invalid");
        senhaClasse.add("is-invalid");
        erro.innerHTML = "Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.";
    }
}