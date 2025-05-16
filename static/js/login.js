let dni = localStorage.getItem("dni");

document.getElementById('formUsuario').addEventListener('submit', iniciarSesion);
function iniciarSesion(event){
    let dni = document.getElementById('dni').value;
    let password = document.getElementById('password').value;

    event.preventDefault();

    fetch('http://localhost:8000/iniciar_sesion/?dni='+dni+'&password='+password)
    .then(response =>{
        if(response.ok){
            localStorage.setItem("dni", dni)
            window.location.href = "index.html";
        } else{
            alert('Usuario o Contraseña Incorrecta.')
        }
    })
}