---
translated: true
---

# Grobid

GROBID एक मशीन लर्निंग लाइब्रेरी है जो कच्चे दस्तावेजों को निकालने, पार्स करने और पुनर्गठित करने के लिए डिज़ाइन की गई है।

यह विशेष रूप से अकादमिक पेपरों को पार्स करने के लिए डिज़ाइन और उम्मीद किया जाता है। ध्यान दें: यदि Grobid को प्रदान किए गए लेख बड़े दस्तावेज़ (जैसे शोध प्रबंध) हैं जो एक निश्चित संख्या से अधिक तत्वों से अधिक हैं, तो वे संसाधित नहीं किए जा सकते हैं।

यह लोडर Grobid का उपयोग करके पीडीएफ को `Documents` में पार्स करता है जो पाठ के अनुभाग से संबंधित मेटाडेटा को बरकरार रखते हैं।

---
सर्वश्रेष्ठ दृष्टिकोण है कि आप डॉकर के माध्यम से Grobid को स्थापित करें, देखें https://grobid.readthedocs.io/en/latest/Grobid-docker/।

(ध्यान दें: अतिरिक्त निर्देश [यहां](/docs/integrations/providers/grobid) पाए जा सकते हैं।)

एक बार जब Grobid चालू हो जाता है, तो आप नीचे वर्णित तरीके से इंटरैक्ट कर सकते हैं।

अब, हम डेटा लोडर का उपयोग कर सकते हैं।

```python
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import GrobidParser
```

```python
loader = GenericLoader.from_filesystem(
    "../Papers/",
    glob="*",
    suffixes=[".pdf"],
    parser=GrobidParser(segment_sentences=False),
)
docs = loader.load()
```

```python
docs[3].page_content
```

```output
'Unlike Chinchilla, PaLM, or GPT-3, we only use publicly available data, making our work compatible with open-sourcing, while most existing models rely on data which is either not publicly available or undocumented (e.g."Books -2TB" or "Social media conversations").There exist some exceptions, notably OPT (Zhang et al., 2022), GPT-NeoX (Black et al., 2022), BLOOM (Scao et al., 2022) and GLM (Zeng et al., 2022), but none that are competitive with PaLM-62B or Chinchilla.'
```

```python
docs[3].metadata
```

```output
{'text': 'Unlike Chinchilla, PaLM, or GPT-3, we only use publicly available data, making our work compatible with open-sourcing, while most existing models rely on data which is either not publicly available or undocumented (e.g."Books -2TB" or "Social media conversations").There exist some exceptions, notably OPT (Zhang et al., 2022), GPT-NeoX (Black et al., 2022), BLOOM (Scao et al., 2022) and GLM (Zeng et al., 2022), but none that are competitive with PaLM-62B or Chinchilla.',
 'para': '2',
 'bboxes': "[[{'page': '1', 'x': '317.05', 'y': '509.17', 'h': '207.73', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '522.72', 'h': '220.08', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '536.27', 'h': '218.27', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '549.82', 'h': '218.65', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '563.37', 'h': '136.98', 'w': '9.46'}], [{'page': '1', 'x': '446.49', 'y': '563.37', 'h': '78.11', 'w': '9.46'}, {'page': '1', 'x': '304.69', 'y': '576.92', 'h': '138.32', 'w': '9.46'}], [{'page': '1', 'x': '447.75', 'y': '576.92', 'h': '76.66', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '590.47', 'h': '219.63', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '604.02', 'h': '218.27', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '617.56', 'h': '218.27', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '631.11', 'h': '220.18', 'w': '9.46'}]]",
 'pages': "('1', '1')",
 'section_title': 'Introduction',
 'section_number': '1',
 'paper_title': 'LLaMA: Open and Efficient Foundation Language Models',
 'file_path': '/Users/31treehaus/Desktop/Papers/2302.13971.pdf'}
```
