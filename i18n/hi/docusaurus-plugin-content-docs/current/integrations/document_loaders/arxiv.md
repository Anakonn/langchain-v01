---
translated: true
---

# Arxiv

>[Arxiv](https://arxiv.org/) एक खुले पहुंच संग्रह है जहां भौतिकी, गणित, कंप्यूटर विज्ञान, मात्रात्मक जीवविज्ञान, मात्रात्मक वित्त, सांख्यिकी, विद्युत अभियांत्रिकी और प्रणाली विज्ञान, और अर्थशास्त्र के क्षेत्रों में 2 मिलियन से अधिक शोध लेख हैं।

यह नोटबुक दिखाता है कि `Arxiv.org` से वैज्ञानिक लेख कैसे लोड किए जाते हैं जिसका हम आगे उपयोग कर सकते हैं।

## स्थापना

पहले, आपको `arxiv` पायथन पैकेज स्थापित करना होगा।

```python
%pip install --upgrade --quiet  arxiv
```

दूसरा, आपको `PyMuPDF` पायथन पैकेज भी स्थापित करना होगा जो `arxiv.org` साइट से डाउनलोड किए गए PDF फ़ाइलों को पाठ प्रारूप में बदलता है।

```python
%pip install --upgrade --quiet  pymupdf
```

## उदाहरण

`ArxivLoader` में ये तर्क हैं:
- `query`: जिसका उपयोग Arxiv में दस्तावेज़ों को खोजने के लिए किया जाता है
- वैकल्पिक `load_max_docs`: डिफ़ॉल्ट=100। इसका उपयोग डाउनलोड किए जाने वाले दस्तावेजों की संख्या को सीमित करने के लिए किया जाता है। सभी 100 दस्तावेज़ डाउनलोड करने में समय लगता है, इसलिए प्रयोगों के लिए एक छोटा नंबर का उपयोग करें।
- वैकल्पिक `load_all_available_meta`: डिफ़ॉल्ट=False। डिफ़ॉल्ट रूप से केवल सबसे महत्वपूर्ण फ़ील्ड डाउनलोड किए जाते हैं: `Published` (जब दस्तावेज़ प्रकाशित/अंतिम बार अपडेट किया गया था), `Title`, `Authors`, `Summary`। यदि True है, तो अन्य फ़ील्ड भी डाउनलोड किए जाते हैं।

```python
from langchain_community.document_loaders import ArxivLoader
```

```python
docs = ArxivLoader(query="1605.08386", load_max_docs=2).load()
len(docs)
```

```python
docs[0].metadata  # meta-information of the Document
```

```output
{'Published': '2016-05-26',
 'Title': 'Heat-bath random walks with Markov bases',
 'Authors': 'Caprice Stanley, Tobias Windisch',
 'Summary': 'Graphs on lattice points are studied whose edges come from a finite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on\nfibers of a fixed integer matrix can be bounded from above by a constant. We\nthen study the mixing behaviour of heat-bath random walks on these graphs. We\nalso state explicit conditions on the set of moves so that the heat-bath random\nwalk, a generalization of the Glauber dynamics, is an expander in fixed\ndimension.'}
```

```python
docs[0].page_content[:400]  # all pages of the Document content
```

```output
'arXiv:1605.08386v1  [math.CO]  26 May 2016\nHEAT-BATH RANDOM WALKS WITH MARKOV BASES\nCAPRICE STANLEY AND TOBIAS WINDISCH\nAbstract. Graphs on lattice points are studied whose edges come from a ﬁnite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on ﬁbers of a\nﬁxed integer matrix can be bounded from above by a constant. We then study the mixing\nbehaviour of heat-b'
```
