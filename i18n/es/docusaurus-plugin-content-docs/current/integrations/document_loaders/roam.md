---
translated: true
---

# Roam

>[ROAM](https://roamresearch.com/) es una herramienta de toma de notas para el pensamiento en red, diseñada para crear una base de conocimientos personal.

Este cuaderno cubre cómo cargar documentos desde una base de datos de Roam. Esto toma mucha inspiración del repositorio de ejemplo [aquí](https://github.com/JimmyLv/roam-qa).

## 🧑 Instrucciones para ingerir su propio conjunto de datos

Exporte su conjunto de datos desde Roam Research. Puede hacer esto haciendo clic en los tres puntos de la esquina superior derecha y luego haciendo clic en `Exportar`.

Al exportar, asegúrese de seleccionar la opción de formato `Markdown y CSV`.

Esto producirá un archivo `.zip` en su carpeta de Descargas. Mueva el archivo `.zip` a este repositorio.

Ejecute el siguiente comando para descomprimir el archivo zip (reemplace `Export...` con el nombre de su propio archivo según sea necesario).

```shell
unzip Roam-Export-1675782732639.zip -d Roam_DB
```

```python
from langchain_community.document_loaders import RoamLoader
```

```python
loader = RoamLoader("Roam_DB")
```

```python
docs = loader.load()
```
