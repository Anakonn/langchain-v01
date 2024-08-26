---
translated: true
---

# Contenedor de Azure Blob Storage

>[Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction) es la solución de almacenamiento de objetos de Microsoft para la nube. Blob Storage está optimizado para almacenar grandes cantidades de datos no estructurados. Los datos no estructurados son datos que no se adhieren a un modelo de datos o definición en particular, como datos de texto o binarios.

`Azure Blob Storage` está diseñado para:
- Servir imágenes o documentos directamente a un navegador.
- Almacenar archivos para acceso distribuido.
- Transmitir video y audio.
- Escribir en archivos de registro.
- Almacenar datos para copia de seguridad y restauración, recuperación ante desastres y archivado.
- Almacenar datos para su análisis por un servicio hospedado en las instalaciones o en Azure.

Este cuaderno abarca cómo cargar objetos de documento desde un contenedor en `Azure Blob Storage`.

```python
%pip install --upgrade --quiet  azure-storage-blob
```

```python
from langchain_community.document_loaders import AzureBlobStorageContainerLoader
```

```python
loader = AzureBlobStorageContainerLoader(conn_str="<conn_str>", container="<container>")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpaa9xl6ch/fake.docx'}, lookup_index=0)]
```

## Especificar un prefijo

También puede especificar un prefijo para un control más detallado sobre qué archivos cargar.

```python
loader = AzureBlobStorageContainerLoader(
    conn_str="<conn_str>", container="<container>", prefix="<prefix>"
)
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```
