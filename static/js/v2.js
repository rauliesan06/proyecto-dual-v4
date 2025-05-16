let dni = localStorage.getItem("dni");

let usuario = document.getElementById('usuario');
usuario.innerHTML = dni;

function cerrarSesion() {
    localStorage.removeItem("dni");
    window.location.href = "login.html";
}

// Para mostrar los iban de la creación de los bizums y para la gestión de las cuentas
document.addEventListener('DOMContentLoaded', () => {
    cargarIBANes('ibanBizum');
    cargarIBANes('ibanCuenta');
});

// Función genérica para cargar IBANs en un <select>
function cargarIBANes(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    fetch('http://localhost:8000/cuentas/?dni='+dni)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener las cuentas');
            }
            return response.json();
        })
        .then(data => {
            select.innerHTML = '<option disabled selected>Selecciona un IBAN</option>'; // Limpia antes
            data.forEach(cuenta => {
                const option = document.createElement('option');
                option.value = cuenta.iban;
                option.textContent = cuenta.iban;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('No se pudieron cargar los IBANs para ' + selectId);
        });
}

function mostrarCuentas(){
    let tabla = document.getElementById('cuentas')
    tabla.innerHTML = "";

    fetch('http://localhost:8000/cuentas/?dni='+dni)
        .then(response => {
            if(!response.ok){
                throw new Error('Error al cargar las cuentas');
            }
            return response.json();
        })
        .then(data => {
            let fila = "";
            data.forEach(cuenta => {
                fila += '<tr><td>'+cuenta.iban+'</td>';
                fila += '<td>'+cuenta.saldo+'€</td></tr>';
            })
            tabla.innerHTML = fila;
        })
}

function mostrarBizums(){
    let tabla = document.getElementById('bizums');
    tabla.innerHTML = "";

    fetch('http://localhost:8000/bizums/?dni='+dni)
        .then(response => {
            if(!response.ok){
                throw new Error("Error al cargar los bizums")
            }
            return response.json();
        })
        .then(data => {
            let fila = "";
            data.forEach(bizum => {
                fila += '<tr><td>'+bizum.cuenta_id+'</td>';
                fila += '<td>'+bizum.tipo_operacion+'</td>';
                fila += '<td>'+bizum.monto+'€</td>';
                let fecha = new Date(bizum.fecha);
                let fechaFormateada = fecha.toLocaleString('es-ES')
                fila += '<td>'+fechaFormateada+'</td></tr>';
            })
            tabla.innerHTML = fila;
        })
}

document.getElementById('formBizum').addEventListener('submit', registrarBizum);
function registrarBizum(event) {
    
    let tipo = document.getElementById('tipo').value;
    let iban = document.getElementById('ibanBizum').value;
    let monto = document.getElementById('monto').value;
    
    event.preventDefault(); // Evita que el formulario se envíe
    

    // Llamar al la dirección de la función
    fetch('http://localhost:8000/crear_bizum/?cuenta_id='+iban+'&tipo_operacion='+tipo+'&monto='+monto, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok){
            document.getElementById('tipo').value = "";
            document.getElementById('ibanBizum').value = "";
            document.getElementById('monto').value = "";
        } else{
            alert("Algo salió mal");
            console.log("Error al registrar el bizum " + response.status);
        }
    })
    .catch(error => { // Salta cuando no hay conexión con el servidor
        alert("Error de red o conexión: " + error.message);
        console.error("Error:", error);
    });
}

function verSaldoCuenta(){
    let iban = document.getElementById('ibanCuenta').value;
    let tabla = document.getElementById('cuenta_saldo');
    

    fetch('http://localhost:8000/cuenta/?iban='+iban)
    .then(response => {
        if(!response.ok){
            throw new Error("Error al cargar el iban")
        }
        return response.json();
    })
    .then(cuenta => { // No hace falta hacer un forEach de data y después recorro cada cuenta porque daría error ya que
        let fila = ""; // el método en el backend solo devuelve un dato
        fila += '<tr><td>'+cuenta.iban+'</td>';
        fila += '<td>'+cuenta.saldo+'</td></tr>';
        
        tabla.innerHTML = fila;
    })
}

function eliminarCuenta(){
    let iban = document.getElementById('ibanCuenta').value;
    let tabla = document.getElementById('cuenta_saldo');

    fetch('http://localhost:8000/eliminar_cuenta/?iban='+iban, {
        method: 'POST'
    })
    .then(response => {
        if(response.ok){
            document.getElementById('ibanCuenta').value = "";
            alert("Cuenta Eliminada Correctamente");
            // Se actualizan los iban de los select
            cargarIBANes('ibanBizum');
            cargarIBANes('ibanCuenta');
            tabla.innerHTML = "";
        }
        else{
            alert("No se pudo eliminar la cuenta")
        }
    })
}