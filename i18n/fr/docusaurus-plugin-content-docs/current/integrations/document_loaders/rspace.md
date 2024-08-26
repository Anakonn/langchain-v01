---
translated: true
---

Ce cahier montre comment utiliser le chargeur de documents RSpace pour importer des notes de recherche et des documents à partir du cahier de laboratoire électronique RSpace dans les pipelines Langchain.

Pour commencer, vous aurez besoin d'un compte RSpace et d'une clé API.

Vous pouvez configurer un compte gratuit sur [https://community.researchspace.com](https://community.researchspace.com) ou utiliser votre RSpace institutionnel.

Vous pouvez obtenir un jeton API RSpace à partir de la page de profil de votre compte.

```python
%pip install --upgrade --quiet  rspace_client
```

Il est préférable de stocker votre clé API RSpace en tant que variable d'environnement.

    RSPACE_API_KEY=<YOUR_KEY>

Vous devrez également définir l'URL de votre installation RSpace, par exemple :

    RSPACE_URL=https://community.researchspace.com

Si vous utilisez ces noms exacts de variables d'environnement, elles seront détectées automatiquement.

```python
from langchain_community.document_loaders.rspace import RSpaceLoader
```

Vous pouvez importer divers éléments de RSpace :

* Un seul document structuré ou de base RSpace. Cela correspondra 1-1 à un document Langchain.
* Un dossier ou un cahier. Tous les documents à l'intérieur du cahier ou du dossier sont importés en tant que documents Langchain.
* Si vous avez des fichiers PDF dans la galerie RSpace, ceux-ci peuvent également être importés individuellement. En interne, le chargeur PDF de Langchain sera utilisé et cela créera un document Langchain par page PDF.

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

Si vous ne voulez pas utiliser les variables d'environnement comme ci-dessus, vous pouvez les transmettre à RSpaceLoader.

```python
loader = RSpaceLoader(
    global_id=rs_id, api_key="MY_API_KEY", url="https://my.researchspace.com"
)
```
