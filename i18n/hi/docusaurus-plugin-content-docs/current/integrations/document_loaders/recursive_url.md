---
translated: true
---

यह एक अनुक्रमणिका URL है।

हम एक मूल निर्देशिका के तहत सभी URL को प्रोसेस करना चाह सकते हैं।

उदाहरण के लिए, [Python 3.9 Document](https://docs.python.org/3.9/) पर नज़र डालते हैं।

इसमें कई दिलचस्प बच्चे पृष्ठ हैं जिन्हें हम बल्क में पढ़ना चाह सकते हैं।

बेशक, `WebBaseLoader` एक पृष्ठों की सूची लोड कर सकता है।

लेकिन, बच्चे पृष्ठों के पेड़ को ट्रैवर्स करने और वास्तव में उस सूची को एकत्र करने की चुनौती है!

हम इसे `RecursiveUrlLoader` का उपयोग करके करते हैं।

यह हमें कुछ बच्चों को बाहर करने, एक्सट्रैक्टर को अनुकूलित करने और अधिक की लचीलापन भी देता है।

# पैरामीटर

- url: str, क्रॉल करने के लिए लक्ष्य url।
- exclude_dirs: Optional[str], बहिष्कृत वेबपृष्ठ निर्देशिकाएं।
- use_async: Optional[bool], क्या असिंक्रोनस अनुरोध का उपयोग करना है, बड़े कार्यों में असिंक्रोनस अनुरोध आमतौर पर तेज होते हैं। हालांकि, असिंक्रोनस लेज़ी लोडिंग सुविधा को अक्षम कर देगा (फ़ंक्शन अभी भी काम करता है, लेकिन यह लेज़ी नहीं है)। डिफ़ॉल्ट रूप से, यह False पर सेट है।
- extractor: Optional[Callable[[str], str]], वेबपृष्ठ से दस्तावेज़ का पाठ निकालने के लिए एक फ़ंक्शन, डिफ़ॉल्ट रूप से यह पृष्ठ को वैसा ही लौटाता है। goose3 और beautifulsoup जैसे उपकरणों का उपयोग करना अनुशंसित है। डिफ़ॉल्ट रूप से, यह पृष्ठ को वैसा ही लौटाता है।
- max_depth: Optional[int] = None, क्रॉल करने की अधिकतम गहराई। डिफ़ॉल्ट रूप से, यह 2 पर सेट है। यदि आप पूरी वेबसाइट को क्रॉल करना चाहते हैं, तो इसे पर्याप्त बड़ा नंबर सेट करें।
- timeout: Optional[int] = None, प्रत्येक अनुरोध के लिए टाइमआउट, सेकंड की इकाई में। डिफ़ॉल्ट रूप से, यह 10 पर सेट है।
- prevent_outside: Optional[bool] = None, क्या मूल url के बाहर क्रॉलिंग को रोकना है। डिफ़ॉल्ट रूप से, यह True पर सेट है।

```python
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
```

एक सरल उदाहरण आज़माते हैं।

```python
from bs4 import BeautifulSoup as Soup

url = "https://docs.python.org/3.9/"
loader = RecursiveUrlLoader(
    url=url, max_depth=2, extractor=lambda x: Soup(x, "html.parser").text
)
docs = loader.load()
```

```python
docs[0].page_content[:50]
```

```output
'\n\n\n\n\nPython Frequently Asked Questions — Python 3.'
```

```python
docs[-1].metadata
```

```output
{'source': 'https://docs.python.org/3.9/library/index.html',
 'title': 'The Python Standard Library — Python 3.9.17 documentation',
 'language': None}
```

हालांकि, एक पूर्ण फ़िल्टर करना मुश्किल होने के कारण, आप परिणामों में कुछ अप्रासंगिक परिणाम देख सकते हैं। यदि आवश्यक हो, तो आप खुद वापस दिए गए दस्तावेजों पर फ़िल्टर कर सकते हैं। अधिकांश समय, वापस दिए गए परिणाम काफी अच्छे होते हैं।

LangChain docs पर परीक्षण करना।

```python
url = "https://js.langchain.com/docs/modules/memory/integrations/"
loader = RecursiveUrlLoader(url=url)
docs = loader.load()
len(docs)
```

```output
8
```
