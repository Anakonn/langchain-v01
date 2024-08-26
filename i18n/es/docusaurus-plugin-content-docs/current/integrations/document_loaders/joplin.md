---
translated: true
---

# Joplin

>[Joplin](https://joplinapp.org/) es una aplicación de toma de notas de código abierto. Captura tus pensamientos y accede a ellos de forma segura desde cualquier dispositivo.

Este cuaderno cubre cómo cargar documentos desde una base de datos `Joplin`.

`Joplin` tiene una [API REST](https://joplinapp.org/api/references/rest_api/) para acceder a su base de datos local. Este cargador utiliza la API para recuperar todas las notas de la base de datos y sus metadatos. Esto requiere un token de acceso que se puede obtener de la aplicación siguiendo estos pasos:

1. Abre la aplicación `Joplin`. La aplicación debe permanecer abierta mientras se cargan los documentos.
2. Ve a la configuración / opciones y selecciona "Web Clipper".
3. Asegúrate de que el servicio Web Clipper esté habilitado.
4. En "Opciones avanzadas", copia el token de autorización.

Puede inicializar el cargador directamente con el token de acceso o almacenarlo en la variable de entorno JOPLIN_ACCESS_TOKEN.

Una alternativa a este enfoque es exportar la base de datos de notas de `Joplin` a archivos Markdown (opcionalmente, con metadatos de Front Matter) y utilizar un cargador de Markdown, como ObsidianLoader, para cargarlos.

```python
from langchain_community.document_loaders import JoplinLoader
```

```python
loader = JoplinLoader(access_token="<access-token>")
```

```python
docs = loader.load()
```
