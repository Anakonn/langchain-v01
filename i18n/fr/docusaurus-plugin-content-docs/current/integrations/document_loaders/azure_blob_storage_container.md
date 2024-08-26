---
translated: true
---

# Conteneur de stockage d'objets Azure Blob

>[Stockage d'objets Azure](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction) est la solution de stockage d'objets de Microsoft pour le cloud. Le stockage d'objets Blob est optimisé pour stocker de très grandes quantités de données non structurées. Les données non structurées sont des données qui ne respectent pas un modèle de données ou une définition particulière, comme les données textuelles ou binaires.

`Stockage d'objets Azure Blob` est conçu pour :
- Servir des images ou des documents directement à un navigateur.
- Stocker des fichiers pour un accès distribué.
- Diffuser des vidéos et de l'audio.
- Écrire dans des fichiers journaux.
- Stocker des données pour la sauvegarde et la restauration, la récupération d'urgence et l'archivage.
- Stocker des données pour une analyse par un service hébergé sur site ou dans Azure.

Ce notebook couvre comment charger des objets de document à partir d'un conteneur sur `Stockage d'objets Azure Blob`.

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

## Spécification d'un préfixe

Vous pouvez également spécifier un préfixe pour un contrôle plus fin sur les fichiers à charger.

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
