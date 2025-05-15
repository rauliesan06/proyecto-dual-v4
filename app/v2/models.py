from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.v2.database import Base

class Usuario(Base):
    __tablename__ = 'usuario'
    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(9), unique=True, nullable=False)
    password = Column(String(50), nullable=False)

    cuentas = relationship("Cuenta", back_populates="usuario")

class Cuenta(Base):
    __tablename__ = 'cuenta'
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(String(9), ForeignKey("usuario.dni"), nullable=False)
    iban = Column(String(24), unique=True, nullable=False)
    saldo = Column(Float, default=0.0)

    usuario = relationship("Usuario", back_populates="cuentas")
    bizums = relationship("Bizum", back_populates="cuenta") # Crea la relación entre los dos objetos por una clave foránea

class Bizum(Base):
    __tablename__ = 'bizum'
    id = Column(Integer, primary_key=True, index=True)
    cuenta_id = Column(String(24), ForeignKey("cuenta.iban"), nullable=False)
    tipo_operacion = Column(String(10))
    monto = Column(Float)
    fecha = Column(DateTime, default=datetime.utcnow)

    cuenta = relationship("Cuenta", back_populates="bizums") # Crea la relación entre los dos objetos por una clave foránea