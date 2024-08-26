---
translated: true
---

# PubMed

>[PubMed®](https://pubmed.ncbi.nlm.nih.gov/) por `The National Center for Biotechnology Information, National Library of Medicine`
> comprende más de 35 millones de citas de literatura biomédica de `MEDLINE`, revistas de ciencias de la vida y libros en línea.
> Las citas pueden incluir enlaces a contenido de texto completo de `PubMed Central` y sitios web de editoriales.

## Configuración

Necesitas instalar un paquete de python.

```bash
pip install xmltodict
```

### Recuperador

Consulta un [ejemplo de uso](/docs/integrations/retrievers/pubmed).

```python
<!--IMPORTS:[{"imported": "PubMedRetriever", "source": "langchain.retrievers", "docs": "https://api.python.langchain.com/en/latest/retrievers/langchain_community.retrievers.pubmed.PubMedRetriever.html", "title": "PubMed"}]-->
from langchain.retrievers import PubMedRetriever
```

### Cargador de documentos

Consulta un [ejemplo de uso](/docs/integrations/document_loaders/pubmed).

```python
<!--IMPORTS:[{"imported": "PubMedLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.pubmed.PubMedLoader.html", "title": "PubMed"}]-->
from langchain_community.document_loaders import PubMedLoader
```
