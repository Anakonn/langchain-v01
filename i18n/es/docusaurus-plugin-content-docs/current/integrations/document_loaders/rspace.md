---
translated: true
---

Este cuaderno muestra cómo usar el cargador de documentos RSpace para importar notas de investigación y documentos desde el Cuaderno de laboratorio electrónico RSpace a las canalizaciones de Langchain.

Para comenzar, necesitarás una cuenta de RSpace y una clave API.

Puedes configurar una cuenta gratuita en [https://community.researchspace.com](https://community.researchspace.com) o usar tu RSpace institucional.

Puedes obtener un token de API de RSpace desde la página de perfil de tu cuenta.

```python
%pip install --upgrade --quiet  rspace_client
```

Es mejor almacenar tu clave API de RSpace como una variable de entorno.

    RSPACE_API_KEY=<TU_CLAVE>

También deberás establecer la URL de tu instalación de RSpace, por ejemplo:

    RSPACE_URL=https://community.researchspace.com

Si usas estos nombres exactos de variables de entorno, se detectarán automáticamente.

```python
from langchain_community.document_loaders.rspace import RSpaceLoader
```

Puedes importar varios elementos de RSpace:

* Un solo documento estructurado o básico de RSpace. Esto se asignará 1-1 a un documento de Langchain.
* Una carpeta o cuaderno. Todos los documentos dentro del cuaderno o carpeta se importan como documentos de Langchain.
* Si tienes archivos PDF en la Galería de RSpace, también se pueden importar individualmente. Debajo del capó, se utilizará el cargador de PDF de Langchain y esto crea un documento de Langchain por cada página de PDF.

```python
## replace these ids with some from your own research notes.
## Make sure to use  global ids (with the 2 character prefix). This helps the loader know which API calls to make
## to RSpace API.

rspace_ids = ["NB1932027", "FL1921314", "SD1932029", "GL1932384"]
for rs_id in rspace_ids:
    loader = RSpaceLoader(global_id=rs_id)
    docs = loader.load()
    for doc in docs:
        ## the name and ID are added to the 'source' metadata property.
        print(doc.metadata)
        print(doc.page_content[:500])
```

Si no quieres usar las variables de entorno como se indicó anteriormente, puedes pasar estos valores al RSpaceLoader

```python
loader = RSpaceLoader(
    global_id=rs_id, api_key="MY_API_KEY", url="https://my.researchspace.com"
)
```
