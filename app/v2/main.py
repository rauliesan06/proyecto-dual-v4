from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.v2.database import SessionLocal, engine
from app.v2.models import Base, Usuario, Cuenta, Bizum
from sqlalchemy.exc import SQLAlchemyError
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from fastapi.responses import FileResponse

Base.metadata.create_all(bind=engine)

app = FastAPI()

## Habilita CORS en FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
##


# Función para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/crear_usuario/")
def crear_usuario(dni: str, password: str, db: Session = Depends(get_db)):
    try:
        if len(dni) == 9:
            usuario = Usuario(dni=dni, password=password)
            db.add(usuario)
            db.commit()
            db.refresh(usuario)
            return usuario
        else:
            return {"mensaje":"Error el dni del usuario no es válido"}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error con la base de datos")

@app.get("/iniciar_sesion/")
def iniciar_sesion(dni: str, password:str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.dni == dni, Usuario.password == password).first()
    if usuario:
        return usuario
    else:
        raise HTTPException(status_code=401, detail="Error al iniciar sesión")

@app.post("/crear_cuenta/")
def crear_cuenta(dni: str, iban: str, saldo: float = 0.0, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.dni==dni).first()
    if usuario:
        cuenta = Cuenta(iban=iban, usuario_id=dni, saldo=saldo)
        db.add(cuenta)
        db.commit()
        db.refresh(cuenta)
        return cuenta
    else:
        return "Error el usuario no existe"

@app.get("/cuentas/")
def listar_cuentas(dni: str, db: Session = Depends(get_db)):
    return db.query(Cuenta).filter(Cuenta.usuario_id == dni).all()

@app.post("/crear_bizum/") # No hace falta insertar el dni ya que en la aplicación solo se mostrarán las cuentas del usuario
def crear_bizum(cuenta_id: str, tipo_operacion: str, monto: float, db: Session = Depends(get_db)):
    cuenta = db.query(Cuenta).filter(Cuenta.iban == cuenta_id).first()
    if not cuenta:
        return "Error: la cuenta no existe"
    if tipo_operacion == "pagar":
        cuenta.saldo += monto
    elif tipo_operacion == "solicitar":
        cuenta.saldo -= monto
    else:
        return "Error: tipo de operación inválida"
    bizum = Bizum(cuenta_id=cuenta_id, tipo_operacion=tipo_operacion, monto=monto)
    db.add(bizum)
    db.commit()
    db.refresh(bizum)
    return bizum

@app.get("/bizums/")
def listar_bizums(dni: str, db: Session = Depends(get_db)):
    cuentas = db.query(Cuenta).filter(Cuenta.usuario_id == dni).all()
    ibans = []
    for cuenta in cuentas:
        ibans.append(cuenta.iban)
    return db.query(Bizum).filter(Bizum.cuenta_id.in_(ibans)).all()

@app.get("/bizums_cuenta/")
def listar_bizums_cuenta(iban: str, db: Session = Depends(get_db)):
    return db.query(Bizum).filter(Bizum.cuenta_id == iban).all()

@app.post("/eliminar_cuenta/") # No hace falta insertar el dni ya que en la aplicación solo se mostrarán las cuentas del usuario
def eliminar_cuenta(iban: str, db: Session = Depends(get_db)):
    cuenta = db.query(Cuenta).filter(Cuenta.iban == iban).first()
    bizums = db.query(Bizum).filter(Bizum.cuenta_id == iban).all()
    try:
        # Recorrer la lista de bizums con el mismo iban para eliminarlos uno a uno(ya que no se puede eliminar una lista)
        for bizum in bizums:
            db.delete(bizum)
            db.commit()
        db.delete(cuenta)
        db.commit()
        return cuenta
    except Exception as e:
        return "Error inesperado: " + e
    
@app.get("/cuenta/") # No hace falta insertar el dni ya que en la aplicación solo se mostrarán las cuentas del usuario
def mostrar_cuenta(iban: str, db: Session = Depends(get_db)):
    cuenta = db.query(Cuenta).filter(Cuenta.iban == iban).first()
    return cuenta

@app.post("/importar_csv/")
def importar_csv(dni: str, db: Session = Depends(get_db)):
    f = open("app/data/cuentas.csv", "r")
    for line in f.readlines()[1:]:
        iban, saldo = line.strip().split(",")
        cuenta_existente = db.query(Cuenta).filter(Cuenta.iban == iban).first()
        if cuenta_existente:
            print(f"Cuenta {iban} ya existe, no se volverá a insertar")
            continue
        cuenta = Cuenta(iban=iban, usuario_id=dni, saldo=saldo)
        db.add(cuenta)
        db.add(cuenta)
    db.commit()
    return {"mensaje":"Importación completada"}

class BizumBase(BaseModel):
    cuenta_id: str
    tipo_operacion: str
    monto: float
    fecha: str

@app.post("/descargar_movimientos/")
def descargar_movimientos(bizums: List[BizumBase]):
    nombre_archivo = "bizums.csv"
    f = open(nombre_archivo, "w")
    f.write("Cuenta, Tipo, Monto, Fecha\n")
    for bizum in bizums:
        f.write(f"{bizum.cuenta_id}, {bizum.tipo_operacion}, {bizum.monto}, {bizum.fecha}\n")
    return FileResponse(nombre_archivo, media_type="text/csv", filename="bizums.csv")