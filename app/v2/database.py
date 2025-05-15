from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_USER = "root"
DB_PASSWORD = "usuario"
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "gestbank"

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL) # Es la conexión central entre SQLAlchemy y la base de datos
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False) # La sesión local ni se guarda automaticamente y se sincroniza automaticamente

Base = declarative_base() # Es la clase Base de la que heredan los modelos para que SQLAlchemy los reconozca