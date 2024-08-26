---
translated: true
---

# PubMed

>[PubMed®](https://pubmed.ncbi.nlm.nih.gov/) by `The National Center for Biotechnology Information, National Library of Medicine`
> は、`MEDLINE`、生命科学ジャーナル、オンラインブックから35百万件を超える文献引用を含んでいます。
> 引用には、`PubMed Central`およびパブリッシャーのウェブサイトからのフルテキストコンテンツへのリンクが含まれる場合があります。

## セットアップ

Pythonパッケージをインストールする必要があります。

```bash
pip install xmltodict
```

### Retriever

[使用例](/docs/integrations/retrievers/pubmed)を参照してください。

```python
<!--IMPORTS:[{"imported": "PubMedRetriever", "source": "langchain.retrievers", "docs": "https://api.python.langchain.com/en/latest/retrievers/langchain_community.retrievers.pubmed.PubMedRetriever.html", "title": "PubMed"}]-->
from langchain.retrievers import PubMedRetriever
```

### Document Loader

[使用例](/docs/integrations/document_loaders/pubmed)を参照してください。

```python
<!--IMPORTS:[{"imported": "PubMedLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.pubmed.PubMedLoader.html", "title": "PubMed"}]-->
from langchain_community.document_loaders import PubMedLoader
```
