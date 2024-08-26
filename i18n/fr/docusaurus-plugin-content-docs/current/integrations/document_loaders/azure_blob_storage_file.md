---
translated: true
---

# Stockage d'objets blob Azure

>[Fichiers Azure](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction) offre des partages de fichiers entièrement gérés dans le cloud, accessibles via le protocole Server Message Block (`SMB`), le protocole Network File System (`NFS`) et l'API REST des fichiers Azure.

Cela couvre comment charger des objets de document à partir de Fichiers Azure.

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
