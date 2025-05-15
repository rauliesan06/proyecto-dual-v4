from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.v2.database import SessionLocal, engine
from app.v2.models import Base, Cuenta, Bizum

from fastapi.middleware.cors import CORSMiddleware



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

@app.post("/crear_cuenta/")
def crear_cuenta(iban: str, saldo: float = 0.0, db: Session = Depends(get_db)):
    cuenta = Cuenta(iban=iban, saldo=saldo)
    db.add(cuenta)
    db.commit()
    db.refresh(cuenta)
    return cuenta

@app.get("/cuentas/")
def listar_cuentas(db: Session = Depends(get_db)):
    return db.query(Cuenta).all()

@app.post("/crear_bizum/")
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
def listar_bizums(db: Session = Depends(get_db)):
    return db.query(Bizum).all()

@app.post("/eliminar_cuenta/")
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
    
@app.get("/cuenta/")
def mostrar_cuenta(iban: str, db: Session = Depends(get_db)):
    cuenta = db.query(Cuenta).filter(Cuenta.iban == iban).first()
    return cuenta

@app.post("/importar_csv/")
def importar_csv(db: Session = Depends(get_db)):
    f = open("app/data/cuentas.csv", "r")
    for line in f.readlines()[1:]:
        iban, saldo = line.strip().split(",")
        cuenta_existente = db.query(Cuenta).filter(Cuenta.iban == iban).first()
        if cuenta_existente:
            print(f"Cuenta {iban} ya existe, no se volverá a insertar")
            continue
        cuenta = Cuenta(iban=iban, saldo=float(saldo))
        db.add(cuenta)
    db.commit()
    return {"mensaje":"Importación completada"}