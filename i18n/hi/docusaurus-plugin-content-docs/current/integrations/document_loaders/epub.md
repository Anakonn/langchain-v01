---
translated: true
---

# EPub

>[EPUB](https://en.wikipedia.org/wiki/EPUB) एक ई-बुक फ़ाइल प्रारूप है जो ".epub" फ़ाइल एक्सटेंशन का उपयोग करता है। इस शब्द का अर्थ इलेक्ट्रॉनिक प्रकाशन है और कभी-कभी ePub के रूप में लिखा जाता है। `EPUB` कई ई-रीडर द्वारा समर्थित है, और अधिकांश स्मार्टफोन, टैबलेट और कंप्यूटरों के लिए संगत सॉफ़्टवेयर उपलब्ध है।

यह कवर करता है कि `.epub` दस्तावेज़ों को कैसे लोड किया जाए Document प्रारूप में जिसका हम आगे उपयोग कर सकते हैं। इस लोडर को काम करने के लिए आपको [`pandoc`](https://pandoc.org/installing.html) पैकेज इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet  pandoc
```

```python
from langchain_community.document_loaders import UnstructuredEPubLoader
```

```python
loader = UnstructuredEPubLoader("winter-sports.epub")
```

```python
data = loader.load()
```

## Retain Elements

अंदर की बात, Unstructured विभिन्न "तत्वों" के लिए अलग-अलग पाठ के टुकड़ों बनाता है। डिफ़ॉल्ट रूप से हम उन्हें एक साथ मिला देते हैं, लेकिन आप `mode="elements"` निर्दिष्ट करके इस अलगाव को आसानी से बनाए रख सकते हैं।

```python
loader = UnstructuredEPubLoader("winter-sports.epub", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='The Project Gutenberg eBook of Winter Sports in\nSwitzerland, by E. F. Benson', lookup_str='', metadata={'source': 'winter-sports.epub', 'page_number': 1, 'category': 'Title'}, lookup_index=0)
```
