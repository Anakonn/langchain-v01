---
translated: true
---

# PubMed

>[PubMed®](https://pubmed.ncbi.nlm.nih.gov/) par `Le Centre national d'information biotechnologique, Bibliothèque nationale de médecine`
> comprend plus de 35 millions de citations de la littérature biomédicale de `MEDLINE`, des revues de sciences de la vie et des livres en ligne.
> Les citations peuvent inclure des liens vers le contenu en texte intégral de `PubMed Central` et des sites Web d'éditeurs.

## Configuration

Vous devez installer un package python.

```bash
pip install xmltodict
```

### Récupérateur

Voir un [exemple d'utilisation](/docs/integrations/retrievers/pubmed).

```python
<!--IMPORTS:[{"imported": "PubMedRetriever", "source": "langchain.retrievers", "docs": "https://api.python.langchain.com/en/latest/retrievers/langchain_community.retrievers.pubmed.PubMedRetriever.html", "title": "PubMed"}]-->
from langchain.retrievers import PubMedRetriever
```

### Chargeur de documents

Voir un [exemple d'utilisation](/docs/integrations/document_loaders/pubmed).

```python
<!--IMPORTS:[{"imported": "PubMedLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.pubmed.PubMedLoader.html", "title": "PubMed"}]-->
from langchain_community.document_loaders import PubMedLoader
```
