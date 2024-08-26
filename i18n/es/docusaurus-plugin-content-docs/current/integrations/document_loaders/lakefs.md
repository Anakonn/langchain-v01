---
translated: true
---

# lakeFS

>[lakeFS](https://docs.lakefs.io/) proporciona control de versiones escalable sobre el lago de datos y utiliza semántica similar a Git para crear y acceder a esas versiones.

Este cuaderno cubre cómo cargar objetos de documento desde una ruta `lakeFS` (ya sea un objeto o un prefijo).

## Inicializar el cargador de lakeFS

Reemplace los valores de `ENDPOINT`, `LAKEFS_ACCESS_KEY` y `LAKEFS_SECRET_KEY` con los suyos propios.

```python
from langchain_community.document_loaders import LakeFSLoader
```

```python
ENDPOINT = ""
LAKEFS_ACCESS_KEY = ""
LAKEFS_SECRET_KEY = ""

lakefs_loader = LakeFSLoader(
    lakefs_access_key=LAKEFS_ACCESS_KEY,
    lakefs_secret_key=LAKEFS_SECRET_KEY,
    lakefs_endpoint=ENDPOINT,
)
```

## Especificar una ruta

Puede especificar un prefijo o una ruta de objeto completa para controlar qué archivos cargar.

Especifique el repositorio, la referencia (rama, ID de confirmación o etiqueta) y la ruta en los correspondientes `REPO`, `REF` y `PATH` para cargar los documentos desde:

```python
REPO = ""
REF = ""
PATH = ""

lakefs_loader.set_repo(REPO)
lakefs_loader.set_ref(REF)
lakefs_loader.set_path(PATH)

docs = lakefs_loader.load()
docs
```
