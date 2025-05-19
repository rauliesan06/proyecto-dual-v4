# 🏦 GestBank
GestBank es una aplicación web de simulación bancaria que permite gestionar cuentas, realizar movimientos financieros y operaciones tipo Bizum.

# 📄 Descripción
Este proyecto es una aplicación web construida con FastAPI como backend, utilizando MySQL como base de datos para manejar los datos. La aplicación permite registrar e iniciar sesión, y a cada usuario realizar operaciones como crear cuentas, realizar pagos mediante Bizum, consultar transacciones, y eliminar cuentas. El frontend está construido con HTML, CSS y JavaScript.
El proyecto también incluye características como la validación de datos y la gestión de las bases de datos mediante SQLAlchemy. Se utiliza Uvicorn como servidor ASGI para ejecutar la aplicación en un entorno local y en la nube.

# 🧩 Funcionalidades

Gestión de cuentas de usuarios:
Crear usuarios
Iniciar sesión en una cuenta
Cerrar sesión

Gestión de cuentas bancarias:

Crear nuevas cuentas con IBAN y saldo inicial
Consultar saldo de cuentas existentes
Eliminar cuentas (incluyendo todas sus transacciones asociadas)


Operaciones Bizum:

Realizar pagos (incrementa el saldo)
Solicitar dinero (reduce el saldo)
Consultar historial de transacciones


Interfaz de usuario:

Versión 1 (gestión en memoria interna)
Versión 2 (almacenamiento en base de datos)
Versión 3 (carga de cuentas a la base de datos a partir de un csv)
Versión 4 (creación de usuarios, inicio de sesión, gestión de cuentas y bizums de cada usuario por separado, cerrar sesión)


# 🧰 Tecnologías utilizadas

Backend: FastAPI, SQLAlchemy
Base de datos: MySQL (con pymysql)
Frontend: HTML, CSS, JavaScript
Servidor: Uvicorn

# 🛠️ Instalación de dependencias
pip install -r requirements.txt

# 🚀 Comando para la inicialización del servidor backend en local
Versión v2:
python -m uvicorn app.v2.main:app --reload --port 8000

Versión v1:
python -m uvicorn app.v1.main:app --reload --port 8001
