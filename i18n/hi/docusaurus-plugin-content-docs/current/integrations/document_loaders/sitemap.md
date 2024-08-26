---
translated: true
---

# साइटमैप

`WebBaseLoader` से विस्तारित, `SitemapLoader` दिए गए URL से एक साइटमैप लोड करता है, और फिर सभी पृष्ठों को स्क्रैप और लोड करता है, प्रत्येक पृष्ठ को एक दस्तावेज़ के रूप में वापस करता है।

स्क्रैपिंग समानांतर रूप से की जाती है। अनुरोधों की समानांतर संख्या के लिए उचित सीमाएं हैं, जो डिफ़ॉल्ट रूप से प्रति सेकंड 2 हैं। यदि आप एक अच्छे नागरिक होने के बारे में चिंतित नहीं हैं, या आप स्क्रैप किए गए सर्वर को नियंत्रित करते हैं, या लोड के बारे में नहीं चिंतित हैं। ध्यान दें, यह स्क्रैपिंग प्रक्रिया को तेज़ कर देगा, लेकिन यह सर्वर को आपको ब्लॉक करने के लिए प्रेरित कर सकता है। सावधान रहें!

```python
%pip install --upgrade --quiet  nest_asyncio
```

```python
# fixes a bug with asyncio and jupyter
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders.sitemap import SitemapLoader
```

```python
sitemap_loader = SitemapLoader(web_path="https://api.python.langchain.com/sitemap.xml")

docs = sitemap_loader.load()
```

आप `requests_per_second` पैरामीटर को बढ़ाकर अधिकतम समानांतर अनुरोधों को बढ़ा सकते हैं। और `requests_kwargs` का उपयोग करके अनुरोध भेजने के लिए kwargs पास कर सकते हैं।

```python
sitemap_loader.requests_per_second = 2
# Optional: avoid `[SSL: CERTIFICATE_VERIFY_FAILED]` issue
sitemap_loader.requests_kwargs = {"verify": False}
```

```python
docs[0]
```

```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/stable/', 'loc': 'https://api.python.langchain.com/en/stable/', 'lastmod': '2024-02-09T01:10:49.422114+00:00', 'changefreq': 'weekly', 'priority': '1'})
```

## साइटमैप URL फ़िल्टर करना

साइटमैप विशाल फ़ाइलें हो सकती हैं, हज़ारों URL के साथ। अक्सर आपको उनमें से प्रत्येक की आवश्यकता नहीं होती है। आप `filter_urls` पैरामीटर में स्ट्रिंग या regex पैटर्न की सूची पास करके URL फ़िल्टर कर सकते हैं। केवल वे URL लोड किए जाएंगे जो इनमें से किसी एक पैटर्न से मेल खाते हैं।

```python
loader = SitemapLoader(
    web_path="https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest"],
)
documents = loader.load()
```

```python
documents[0]
```

```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/latest/', 'loc': 'https://api.python.langchain.com/en/latest/', 'lastmod': '2024-02-12T05:26:10.971077+00:00', 'changefreq': 'daily', 'priority': '0.9'})
```

## कस्टम स्क्रैपिंग नियम जोड़ें

`SitemapLoader` `beautifulsoup4` का उपयोग करता है स्क्रैपिंग प्रक्रिया के लिए, और यह डिफ़ॉल्ट रूप से पृष्ठ पर प्रत्येक तत्व को स्क्रैप करता है। `SitemapLoader` निर्माता एक कस्टम स्क्रैपिंग फ़ंक्शन स्वीकार करता है। यह सुविधा आपकी विशिष्ट आवश्यकताओं के अनुसार स्क्रैपिंग प्रक्रिया को अनुकूलित करने में मदद कर सकती है; उदाहरण के लिए, आप शीर्षलेख या नेविगेशन तत्वों को स्क्रैप करना टालना चाह सकते हैं।

 निम्नलिखित उदाहरण में, नेविगेशन और शीर्षलेख तत्वों को टालने के लिए एक कस्टम फ़ंक्शन विकसित और उपयोग करने का तरीका दिखाया गया है।

`beautifulsoup4` लाइब्रेरी आयात करें और कस्टम फ़ंक्शन को परिभाषित करें।

```python
pip install beautifulsoup4
```

```python
from bs4 import BeautifulSoup


def remove_nav_and_header_elements(content: BeautifulSoup) -> str:
    # Find all 'nav' and 'header' elements in the BeautifulSoup object
    nav_elements = content.find_all("nav")
    header_elements = content.find_all("header")

    # Remove each 'nav' and 'header' element from the BeautifulSoup object
    for element in nav_elements + header_elements:
        element.decompose()

    return str(content.get_text())
```

अपने कस्टम फ़ंक्शन को `SitemapLoader` ऑब्जेक्ट में जोड़ें।

```python
loader = SitemapLoader(
    "https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest/"],
    parsing_function=remove_nav_and_header_elements,
)
```

## स्थानीय साइटमैप

साइटमैप लोडर स्थानीय फ़ाइलें लोड करने के लिए भी उपयोग किया जा सकता है।

```python
sitemap_loader = SitemapLoader(web_path="example_data/sitemap.xml", is_local=True)

docs = sitemap_loader.load()
```
