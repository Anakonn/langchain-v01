---
translated: true
---

# Archivo de Azure Blob Storage

>[Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction) ofrece recursos compartidos de archivos totalmente administrados en la nube que se pueden acceder a través del protocolo Server Message Block (`SMB`) estándar de la industria, el protocolo Network File System (`NFS`) y la `API REST de Azure Files`.

Esto cubre cómo cargar objetos de documento desde Azure Files.

```python
%pip install --upgrade --quiet  azure-storage-blob
```

```python
from langchain_community.document_loaders import AzureBlobStorageFileLoader
```

```python
loader = AzureBlobStorageFileLoader(
    conn_str="<connection string>",
    container="<container name>",
    blob_name="<blob name>",
)
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpxvave6wl/fake.docx'}, lookup_index=0)]
```
