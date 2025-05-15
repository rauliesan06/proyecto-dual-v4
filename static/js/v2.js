let dni = document.getElementById('dni');

// Hace que esté constantemente escuchando
document.addEventListener('DOMContentLoaded', () => {
    const ibanInput = document.getElementById('iban');
    if (ibanInput) { // ¡LA COMPROBACIÓN CLAVE!
        ibanInput.addEventListener('input', reviewIban);
    }

    const formCuentaElement = document.getElementById('formCuenta');
    if (formCuentaElement) { // ¡LA COMPROBACIÓN CLAVE!
        formCuentaElement.addEventListener('submit', validarFormulario);
    }

    // Para mostrar los iban de la creación de los bizums y para la gestión de las cuentas
    cargarIBANes('ibanBizum');
    cargarIBANes('ibanCuenta');
});

function reviewIban(){
    let iban = document.getElementById('iban').value
    let ibanError = document.getElementById('ibanError')
    if(!iban.startsWith('ES') || iban.length !== 24){
        ibanError.style.display = "block"
    } else{
        ibanError.style.display = "none"
    }
}

function validarFormulario(event) {
    let iban = document.getElementById('iban').value;
    let saldo = document.getElementById('saldo').value;
    let v1 = document.getElementById('v1');
    let v2 = document.getElementById('v2');

    event.preventDefault(); // Evita que el formulario se envíe
    
    if (!iban.startsWith('ES') || iban.length !== 24) {
        return;
    }

    let url = "";

    if(v1.checked){
        url = 'http://localhost:8001/registrar_cuenta/?iban='+iban+'&saldo='+saldo;
    } else if(v2.checked){
        url = 'http://localhost:8000/crear_cuenta/?iban='+encodeURIComponent(iban)+'&saldo='+saldo;
    }

    // Llamar al la dirección de la función
    fetch(url, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok){
            document.getElementById('iban').value = "";
            document.getElementById('saldo').value = "";
            alert("Cuenta registrada correctamente");
        } else{
            alert("Algo salió mal");
            console.log("Error al registrar la cuenta " + response.status);
        }
    })
    .catch(error => { // Salta cuando el iban está repetido o cuando no hay conexión con el servidor
        alert("Error de red o conexión: " + error.message);
        console.error("Error:", error);
    });
}

function cargarCuentas(){
    fetch('http://localhost:8000/importar_csv/', {
        method: 'POST'
    })
    .then(response => {
        if(response.ok){
            alert("Cuentas cargadas correctamente en la base de datos")
        } else{
            alert("Error al cargar las cuentas en la base de datos")
        }
    })
    .catch(error => { // Salta cuando el iban está repetido o cuando no hay conexión con el servidor
        alert("Error de red o conexión: " + error.message);
        console.error("Error:", error);
    });
}



// Función genérica para cargar IBANs en un <select>
function cargarIBANes(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    fetch('http://localhost:8000/cuentas/')
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

    fetch('http://localhost:8000/cuentas/')
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

    fetch('http://localhost:8000/bizums/')
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