---
translated: true
---

# Iugu

>[Iugu](https://www.iugu.com/) es una empresa brasileña de servicios y software como servicio (SaaS). Ofrece software de procesamiento de pagos e interfaces de programación de aplicaciones (API) para sitios web de comercio electrónico y aplicaciones móviles.

Este cuaderno abarca cómo cargar datos desde la `API REST de Iugu` en un formato que se pueda ingerir en LangChain, junto con un ejemplo de uso para la vectorización.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import IuguLoader
```

La API de Iugu requiere un token de acceso, que se puede encontrar dentro del panel de Iugu.

Este cargador de documentos también requiere una opción `resource` que define qué datos desea cargar.

Los siguientes recursos están disponibles:

`Documentation` [Documentación](https://dev.iugu.com/reference/metadados)

```python
iugu_loader = IuguLoader("charges")
```

```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([iugu_loader])
iugu_doc_retriever = index.vectorstore.as_retriever()
```
