---
canonical: https://python.langchain.com/v0.1/docs/integrations/providers/pubmed
translated: false
---

# PubMed

>[PubMed®](https://pubmed.ncbi.nlm.nih.gov/) by `The National Center for Biotechnology Information, National Library of Medicine`
> comprises more than 35 million citations for biomedical literature from `MEDLINE`, life science journals, and online books.
> Citations may include links to full text content from `PubMed Central` and publisher web sites.

## Setup

You need to install a python package.

```bash
pip install xmltodict
```

### Retriever

See a [usage example](/docs/integrations/retrievers/pubmed).

```python
<!--IMPORTS:[{"imported": "PubMedRetriever", "source": "langchain.retrievers", "docs": "https://api.python.langchain.com/en/latest/retrievers/langchain_community.retrievers.pubmed.PubMedRetriever.html", "title": "PubMed"}]-->
from langchain.retrievers import PubMedRetriever
```

### Document Loader

See a [usage example](/docs/integrations/document_loaders/pubmed).

```python
<!--IMPORTS:[{"imported": "PubMedLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.pubmed.PubMedLoader.html", "title": "PubMed"}]-->
from langchain_community.document_loaders import PubMedLoader
```