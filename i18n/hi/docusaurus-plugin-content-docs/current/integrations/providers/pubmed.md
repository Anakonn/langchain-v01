---
translated: true
---

# PubMed

>[PubMed®](https://pubmed.ncbi.nlm.nih.gov/) द्वारा `The National Center for Biotechnology Information, National Library of Medicine`
> 35 मिलियन से अधिक उद्धरण जीवविज्ञान साहित्य से `MEDLINE`, जीवविज्ञान पत्रिकाओं और ऑनलाइन पुस्तकों से संबंधित है।
> उद्धरण में `PubMed Central` और प्रकाशक वेबसाइटों से पूर्ण पाठ सामग्री के लिंक शामिल हो सकते हैं।

## सेटअप

आपको एक पायथन पैकेज स्थापित करने की आवश्यकता है।

```bash
pip install xmltodict
```

### Retriever

[उपयोग उदाहरण](/docs/integrations/retrievers/pubmed) देखें।

```python
<!--IMPORTS:[{"imported": "PubMedRetriever", "source": "langchain.retrievers", "docs": "https://api.python.langchain.com/en/latest/retrievers/langchain_community.retrievers.pubmed.PubMedRetriever.html", "title": "PubMed"}]-->
from langchain.retrievers import PubMedRetriever
```

### Document Loader

[उपयोग उदाहरण](/docs/integrations/document_loaders/pubmed) देखें।

```python
<!--IMPORTS:[{"imported": "PubMedLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.pubmed.PubMedLoader.html", "title": "PubMed"}]-->
from langchain_community.document_loaders import PubMedLoader
```
