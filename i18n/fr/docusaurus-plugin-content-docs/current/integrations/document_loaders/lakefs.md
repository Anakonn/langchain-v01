---
translated: true
---

# lakeFS

>[lakeFS](https://docs.lakefs.io/) fournit un contrôle de version évolutif sur le data lake et utilise une sémantique similaire à Git pour créer et accéder à ces versions.

Ce notebook couvre comment charger des objets de document à partir d'un chemin `lakeFS` (qu'il s'agisse d'un objet ou d'un préfixe).

## Initialisation du chargeur lakeFS

Remplacez les valeurs `ENDPOINT`, `LAKEFS_ACCESS_KEY` et `LAKEFS_SECRET_KEY` par les vôtres.

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

## Spécification d'un chemin

Vous pouvez spécifier un préfixe ou un chemin d'objet complet pour contrôler les fichiers à charger.

Spécifiez le référentiel, la référence (branche, ID de validation ou étiquette) et le chemin dans les champs `REPO`, `REF` et `PATH` correspondants pour charger les documents :

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
