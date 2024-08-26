---
translated: true
---

# PubMed

>[PubMed®](https://pubmed.ncbi.nlm.nih.gov/)는 `The National Center for Biotechnology Information, National Library of Medicine`에서 제공합니다.
> 35백만 건 이상의 생물의학 문헌 인용문을 포함하고 있으며, `MEDLINE`, 생명과학 저널, 온라인 도서에서 인용된 것들입니다.
> 인용문에는 `PubMed Central` 및 출판사 웹사이트의 전문 콘텐츠에 대한 링크가 포함될 수 있습니다.

## 설정

Python 패키지를 설치해야 합니다.

```bash
pip install xmltodict
```

### Retriever

[사용 예시](/docs/integrations/retrievers/pubmed)를 참고하세요.

```python
<!--IMPORTS:[{"imported": "PubMedRetriever", "source": "langchain.retrievers", "docs": "https://api.python.langchain.com/en/latest/retrievers/langchain_community.retrievers.pubmed.PubMedRetriever.html", "title": "PubMed"}]-->
from langchain.retrievers import PubMedRetriever
```

### Document Loader

[사용 예시](/docs/integrations/document_loaders/pubmed)를 참고하세요.

```python
<!--IMPORTS:[{"imported": "PubMedLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.pubmed.PubMedLoader.html", "title": "PubMed"}]-->
from langchain_community.document_loaders import PubMedLoader
```
