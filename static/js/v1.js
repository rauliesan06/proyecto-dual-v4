document.addEventListener('DOMContentLoaded', () => {
    cargarIBANes('iban');
});
function cargarIBANes(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    fetch('http://localhost:8001/mostrar_cuentas/')
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
    let tabla = document.getElementById('cuentas');
    tabla.innerHTML = "";

    fetch('http://localhost:8001/mostrar_cuentas/')
    .then(response => {
        if(!response.ok){
            throw new Error('Error al cargar las cuentas');
        }
        return response.json();
    })
    .then(data => {
        let fila = "";
        data.forEach(cuenta => {
            fila += "<tr><td>"+cuenta.iban+"</td>";
            fila += "<td>"+cuenta.saldo+"€</td></tr>"
        })
        tabla.innerHTML = fila;
    })
}

function mostrarMovimientos(){
    let tabla = document.getElementById('movimientos');
    tabla.innerHTML = "";
    fetch('http://localhost:8001/mostrar_movimientos/')
    .then(response => {
        if(!response.ok){
            throw new Error('Error al cargar los movimientos')
        }
        return response.json();
    })
    .then(data => {
        let fila = "";
        data.forEach(movimiento => {
            fila += "<tr><td>"+movimiento.iban+"</td>";
            fila += "<td>"+movimiento.tipo+"</td>";
            fila += "<td>"+movimiento.cantidad+"€</td></tr>"
        })
        tabla.innerHTML = fila;
    })
}

document.getElementById('formMovimiento').addEventListener('submit', crearMovimiento);
function crearMovimiento(event){
    let tipo = document.getElementById('tipo').value;
    let iban = document.getElementById('iban').value;
    let cantidad = document.getElementById('cantidad').value;

    event.preventDefault();

    fetch('http://localhost:8001/registrar_movimiento/?iban='+iban+'&tipo='+tipo+'&cantidad='+cantidad, {
        method: 'POST'
    })
    .then(response => {
        if(response.ok){
            document.getElementById('tipo').value = "";
            document.getElementById('iban').value = "";
            document.getElementById('cantidad').value = "";
            alert("Movimiento registrado correctamente.")
        } else{
            alert("Algo salió mal");
        }
    })
}