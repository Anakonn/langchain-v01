---
translated: true
---

# बिबटेक्स

>[बिबटेक्स](https://www.ctan.org/pkg/bibtex) एक फ़ाइल प्रारूप और संदर्भ प्रबंधन प्रणाली है जो आमतौर पर `LaTeX` टाइपसेटिंग के साथ उपयोग किया जाता है। यह शैक्षिक और अनुसंधान दस्तावेजों के लिए बिबलियोग्राफिक जानकारी को संगठित और संग्रहीत करने का एक तरीका है।

`बिबटेक्स` फ़ाइलों में `.bib` एक्सटेंशन होता है और इनमें पुस्तकों, लेखों, सम्मेलन पत्रों, थीसिस और अधिक जैसी विभिन्न प्रकाशनों के संदर्भों को दर्शाने वाले सादे पाठ प्रविष्टियां होती हैं। प्रत्येक `बिबटेक्स` प्रविष्टि एक विशिष्ट संरचना का पालन करती है और लेखक के नाम, प्रकाशन शीर्षक, जर्नल या पुस्तक शीर्षक, प्रकाशन वर्ष, पृष्ठ संख्या और अधिक जैसे बिबलियोग्राफिक विवरण के क्षेत्रों को शामिल करती है।

बिबटेक्स फ़ाइलों में `.pdf` फ़ाइलों जैसे दस्तावेजों का पथ भी संग्रहीत किया जा सकता है।

## स्थापना

पहले, आपको `bibtexparser` और `PyMuPDF` स्थापित करना होगा।

```python
%pip install --upgrade --quiet  bibtexparser pymupdf
```

## उदाहरण

`BibtexLoader` के पास ये तर्क हैं:
- `file_path`: `.bib` बिबटेक्स फ़ाइल का पथ
- वैकल्पिक `max_docs`: डिफ़ॉल्ट=None, यानी कोई सीमा नहीं। इसका उपयोग प्राप्त किए जाने वाले दस्तावेजों की संख्या को सीमित करने के लिए करें।
- वैकल्पिक `max_content_chars`: डिफ़ॉल्ट=4000। इसका उपयोग एक दस्तावेज में अक्षरों की संख्या को सीमित करने के लिए करें।
- वैकल्पिक `load_extra_meta`: डिफ़ॉल्ट=False। डिफ़ॉल्ट रूप से केवल बिबटेक्स प्रविष्टियों से महत्वपूर्ण क्षेत्र: `प्रकाशित` (प्रकाशन वर्ष), `शीर्षक`, `लेखक`, `सारांश`, `जर्नल`, `कीवर्ड`, और `URL` लोड किए जाते हैं। यदि True है, तो यह `entry_id`, `note`, `doi`, और `links` क्षेत्रों को भी लोड करने का प्रयास करेगा।
- वैकल्पिक `file_pattern`: डिफ़ॉल्ट=`r'[^:]+\.pdf'`। `file` प्रविष्टि में फ़ाइलों को खोजने के लिए रेगेक्स पैटर्न। डिफ़ॉल्ट पैटर्न `Zotero` स्वाद बिबटेक्स शैली और बेयर फ़ाइल पथ का समर्थन करता है।

```python
from langchain_community.document_loaders import BibtexLoader
```

```python
# Create a dummy bibtex file and download a pdf.
import urllib.request

urllib.request.urlretrieve(
    "https://www.fourmilab.ch/etexts/einstein/specrel/specrel.pdf", "einstein1905.pdf"
)

bibtex_text = """
    @article{einstein1915,
        title={Die Feldgleichungen der Gravitation},
        abstract={Die Grundgleichungen der Gravitation, die ich hier entwickeln werde, wurden von mir in einer Abhandlung: ,,Die formale Grundlage der allgemeinen Relativit{\"a}tstheorie`` in den Sitzungsberichten der Preu{\ss}ischen Akademie der Wissenschaften 1915 ver{\"o}ffentlicht.},
        author={Einstein, Albert},
        journal={Sitzungsberichte der K{\"o}niglich Preu{\ss}ischen Akademie der Wissenschaften},
        volume={1915},
        number={1},
        pages={844--847},
        year={1915},
        doi={10.1002/andp.19163540702},
        link={https://onlinelibrary.wiley.com/doi/abs/10.1002/andp.19163540702},
        file={einstein1905.pdf}
    }
    """
# save bibtex_text to biblio.bib file
with open("./biblio.bib", "w") as file:
    file.write(bibtex_text)
```

```python
docs = BibtexLoader("./biblio.bib").load()
```

```python
docs[0].metadata
```

```output
{'id': 'einstein1915',
 'published_year': '1915',
 'title': 'Die Feldgleichungen der Gravitation',
 'publication': 'Sitzungsberichte der K{"o}niglich Preu{\\ss}ischen Akademie der Wissenschaften',
 'authors': 'Einstein, Albert',
 'abstract': 'Die Grundgleichungen der Gravitation, die ich hier entwickeln werde, wurden von mir in einer Abhandlung: ,,Die formale Grundlage der allgemeinen Relativit{"a}tstheorie`` in den Sitzungsberichten der Preu{\\ss}ischen Akademie der Wissenschaften 1915 ver{"o}ffentlicht.',
 'url': 'https://doi.org/10.1002/andp.19163540702'}
```

```python
print(docs[0].page_content[:400])  # all pages of the pdf content
```

```output
ON THE ELECTRODYNAMICS OF MOVING
BODIES
By A. EINSTEIN
June 30, 1905
It is known that Maxwell’s electrodynamics—as usually understood at the
present time—when applied to moving bodies, leads to asymmetries which do
not appear to be inherent in the phenomena. Take, for example, the recipro-
cal electrodynamic action of a magnet and a conductor. The observable phe-
nomenon here depends only on the r
```
