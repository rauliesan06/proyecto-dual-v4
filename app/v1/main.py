from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List

app = FastAPI()

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Movimiento(BaseModel):
    iban: str
    tipo: str
    cantidad: float

class Cuenta(BaseModel):
    iban: str
    saldo: float

movimientos: List[Movimiento] = []
cuentas: Dict[str, Cuenta] = {}

@app.post("/registrar_cuenta/")
def registrar_cuenta(iban: str, saldo: float):
    if iban in cuentas:
        raise HTTPException(status_code=400, detail="Cuenta ya existe")
    cuentas[iban] = Cuenta(iban=iban, saldo=saldo)
    return {"mensaje": "Cuenta registrada correctamente"}

@app.get("/mostrar_cuentas/")
def mostrar_cuentas():
    return list(cuentas.values())

@app.post("/registrar_movimiento/")
def registrar_movimiento(iban: str, tipo: str, cantidad: float):
    if iban not in cuentas:
        raise HTTPException(status_code=400, detail="No existe una cuenta con ese iban")
    movimiento = Movimiento(iban=iban, tipo=tipo, cantidad=cantidad)
    cuenta = cuentas[iban]
    if tipo == "ingreso":
        cuenta.saldo += cantidad
    elif tipo == "gasto":
        cuenta.saldo -= cantidad
    movimientos.append(movimiento)
    return {"mensaje":"Movimiento registrado correctamente"}
#@app.post("/registrar_movimiento/")
#def registrar_movimiento(iban: str, movimiento: Movimiento):
#    if iban not in cuentas:
#        raise HTTPException(status_code=400, detail="No existe una cuenta con ese iban")
#    cuentas[iban].movimientos.append(movimiento)
#    return {"mensaje":"Movimiento registrado correctamente"}

@app.get("/mostrar_movimientos/")
def mostrar_movimientos_cuenta():
    return movimientos