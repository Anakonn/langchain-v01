---
translated: true
---

# अनिर्मित फ़ाइल

यह नोटबुक `Unstructured` पैकेज का उपयोग करके कई प्रकार की फ़ाइलों को लोड करने के बारे में कवर करता है। `Unstructured` वर्तमान में पाठ फ़ाइलों, पावरपॉइंट, HTML, PDF, छवियों और अधिक को लोड करने का समर्थन करता है।

```python
# # Install package
%pip install --upgrade --quiet  "unstructured[all-docs]"
```

```python
# # Install other dependencies
# # https://github.com/Unstructured-IO/unstructured/blob/main/docs/source/installing.rst
# !brew install libmagic
# !brew install poppler
# !brew install tesseract
# # If parsing xml / html documents:
# !brew install libxml2
# !brew install libxslt
```

```python
# import nltk
# nltk.download('punkt')
```

```python
from langchain_community.document_loaders import UnstructuredFileLoader
```

```python
loader = UnstructuredFileLoader("./example_data/state_of_the_union.txt")
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:400]
```

```output
'Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.\n\nLast year COVID-19 kept us apart. This year we are finally together again.\n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.\n\nWith a duty to one another to the American people to the Constit'
```

### फ़ाइलों की सूची लोड करें

```python
files = ["./example_data/whatsapp_chat.txt", "./example_data/layout-parser-paper.pdf"]
```

```python
loader = UnstructuredFileLoader(files)
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:400]
```

## तत्वों को बरकरार रखें

अंतर्निहित रूप से, Unstructured विभिन्न "तत्वों" को पाठ के विभिन्न टुकड़ों के लिए बनाता है। डिफ़ॉल्ट रूप से हम उन्हें एक साथ जोड़ते हैं, लेकिन आप `mode="elements"` निर्दिष्ट करके इस अलगाव को आसानी से बनाए रख सकते हैं।

```python
loader = UnstructuredFileLoader(
    "./example_data/state_of_the_union.txt", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='Last year COVID-19 kept us apart. This year we are finally together again.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='With a duty to one another to the American people to the Constitution.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='And with an unwavering resolve that freedom will always triumph over tyranny.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0)]
```

## एक पार्टिशनिंग रणनीति परिभाषित करें

Unstructured दस्तावेज़ लोडर उपयोगकर्ताओं को `"strategy"` पैरामीटर पास करने की अनुमति देता है जो `unstructured` को दस्तावेज़ को कैसे विभाजित करना है। वर्तमान में समर्थित रणनीतियां `"hi_res"` (डिफ़ॉल्ट) और `"fast"` हैं। Hi res पार्टिशनिंग रणनीतियां अधिक सटीक हैं, लेकिन प्रक्रिया करने में अधिक समय लेती हैं। तेज़ रणनीतियां दस्तावेज़ को तेज़ी से विभाजित करती हैं, लेकिन सटीकता का समझौता करती हैं। सभी दस्तावेज़ प्रकारों में अलग-अलग hi res और तेज़ पार्टिशनिंग रणनीतियां नहीं हैं। उन दस्तावेज़ प्रकारों के लिए, `strategy` kwarg को अनदेखा कर दिया जाता है। कुछ मामलों में, उच्च रिज़ॉल्यूशन रणनीति तेज़ रणनीति पर फॉलबैक करेगी यदि कोई निर्भरता गायब है (यानी दस्तावेज़ विभाजन के लिए एक मॉडल)। नीचे दिए गए उदाहरण में आप देख सकते हैं कि `UnstructuredFileLoader` पर एक रणनीति कैसे लागू की जाती है।

```python
from langchain_community.document_loaders import UnstructuredFileLoader
```

```python
loader = UnstructuredFileLoader(
    "layout-parser-paper-fast.pdf", strategy="fast", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='1', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='2', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='0', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='2', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='n', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'Title'}, lookup_index=0)]
```

## PDF उदाहरण

PDF दस्तावेज़ों को प्रक्रिया करना एकदम वैसा ही काम करता है। Unstructured फ़ाइल प्रकार का पता लगाता है और समान प्रकार के तत्वों को निकालता है। संचालन के तरीके हैं
- `single` सभी तत्वों का सारा पाठ एक में संयुक्त है (डिफ़ॉल्ट)
- `elements` व्यक्तिगत तत्वों को बनाए रखता है
- `paged` प्रत्येक पृष्ठ से पाठ केवल संयुक्त किया जाता है

```python
!wget  https://raw.githubusercontent.com/Unstructured-IO/unstructured/main/example-docs/layout-parser-paper.pdf -P "../../"
```

```python
loader = UnstructuredFileLoader(
    "./example_data/layout-parser-paper.pdf", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='LayoutParser : A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Zejiang Shen 1 ( (ea)\n ), Ruochen Zhang 2 , Melissa Dell 3 , Benjamin Charles Germain Lee 4 , Jacob Carlson 3 , and Weining Li 5', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Allen Institute for AI shannons@allenai.org', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Brown University ruochen zhang@brown.edu', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Harvard University { melissadell,jacob carlson } @fas.harvard.edu', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0)]
```

यदि आपको `unstructured` तत्वों पर पोस्ट प्रक्रिया करने की आवश्यकता है, तो आप `post_processors` kwarg में `str` -> `str` फ़ंक्शनों की एक सूची पास कर सकते हैं जब आप `UnstructuredFileLoader` को इंस्टैंशिएट करते हैं। यह अन्य Unstructured लोडर्स पर भी लागू होता है। नीचे एक उदाहरण दिया गया है।

```python
from langchain_community.document_loaders import UnstructuredFileLoader
from unstructured.cleaners.core import clean_extra_whitespace
```

```python
loader = UnstructuredFileLoader(
    "./example_data/layout-parser-paper.pdf",
    mode="elements",
    post_processors=[clean_extra_whitespace],
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='LayoutParser: A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((157.62199999999999, 114.23496279999995), (157.62199999999999, 146.5141628), (457.7358962799999, 146.5141628), (457.7358962799999, 114.23496279999995)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'Title'}),
 Document(page_content='Zejiang Shen1 ((cid:0)), Ruochen Zhang2, Melissa Dell3, Benjamin Charles Germain Lee4, Jacob Carlson3, and Weining Li5', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((134.809, 168.64029940800003), (134.809, 192.2517444), (480.5464199080001, 192.2517444), (480.5464199080001, 168.64029940800003)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='1 Allen Institute for AI shannons@allenai.org 2 Brown University ruochen zhang@brown.edu 3 Harvard University {melissadell,jacob carlson}@fas.harvard.edu 4 University of Washington bcgl@cs.washington.edu 5 University of Waterloo w422li@uwaterloo.ca', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((207.23000000000002, 202.57205439999996), (207.23000000000002, 311.8195408), (408.12676, 311.8195408), (408.12676, 202.57205439999996)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='1 2 0 2', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 213.36), (16.34, 253.36), (36.34, 253.36), (36.34, 213.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='n u J', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 258.36), (16.34, 286.14), (36.34, 286.14), (36.34, 258.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'Title'})]
```

## Unstructured API

यदि आप कम सेटअप के साथ तेज़ी से चालू होना चाहते हैं, तो आप सिर्फ `pip install unstructured` चला सकते हैं और `UnstructuredAPIFileLoader` या `UnstructuredAPIFileIOLoader` का उपयोग कर सकते हैं। यह आपके दस्तावेज़ को होस्ट किए गए Unstructured API का उपयोग करके प्रक्रिया करेगा। आप एक मुफ़्त Unstructured API कुंजी [यहाँ](https://www.unstructured.io/api-key/) पर जनरेट कर सकते हैं। [Unstructured दस्तावेज़ीकरण](https://unstructured-io.github.io/unstructured/) पृष्ठ पर एक बार उपलब्ध होने पर एक API कुंजी कैसे जनरेट करने के बारे में निर्देश होंगे। यदि आप Unstructured API को स्वयं होस्ट करना या इसे स्थानीय रूप से चलाना चाहते हैं, तो [यहाँ](https://github.com/Unstructured-IO/unstructured-api#dizzy-instructions-for-using-the-docker-image) दिए गए निर्देशों का पालन करें।

```python
from langchain_community.document_loaders import UnstructuredAPIFileLoader
```

```python
filenames = ["example_data/fake.docx", "example_data/fake-email.eml"]
```

```python
loader = UnstructuredAPIFileLoader(
    file_path=filenames[0],
    api_key="FAKE_API_KEY",
)
```

```python
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.docx'})
```

आप `UnstructuredAPIFileLoader` का उपयोग करके एक ही API में एक से अधिक फ़ाइलों को बैच कर भी सकते हैं।

```python
loader = UnstructuredAPIFileLoader(
    file_path=filenames,
    api_key="FAKE_API_KEY",
)
```

```python
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.\n\nThis is a test email to use for unit tests.\n\nImportant points:\n\nRoses are red\n\nViolets are blue', metadata={'source': ['example_data/fake.docx', 'example_data/fake-email.eml']})
```
