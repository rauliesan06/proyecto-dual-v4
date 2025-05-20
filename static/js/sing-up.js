document.getElementById('formRegisUsuario').addEventListener('submit', registrarUsuario);
function registrarUsuario(event){
    let dni = document.getElementById('dni').value;
    let password = document.getElementById('password').value;

    event.preventDefault();

    if(dni.length !== 9){
        alert("El DNI debe tener 9 caracteres.")
        return;
    }

    fetch('http://localhost:8000/crear_usuario/?dni='+dni+'&password='+password, {
        method: 'POST'
    })
    .then(response =>{
        if(response.ok){
            alert('Usuario registrado correctamente.')
            document.getElementById('dni').value = "";
            document.getElementById('password').value = "";
        } else{
            alert('Ya existe un usuario con el mismo identificador.')
        }
    })
}