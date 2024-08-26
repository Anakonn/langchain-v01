---
translated: true
---

यह उदाहरण बताता है कि कैसे `HTML` दस्तावेज़ों को एक `URLs` की सूची से `Document` प्रारूप में लोड किया जा सकता है जिसका हम आगे उपयोग कर सकते हैं।

## अव्यवस्थित URL लोडर

आपको `unstructured` लाइब्रेरी इंस्टॉल करनी होगी:

```python
!pip install -U unstructured
```

```python
from langchain_community.document_loaders import UnstructuredURLLoader
```

```python
urls = [
    "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-february-8-2023",
    "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-february-9-2023",
]
```

`ssl_verify=False` के साथ `headers=headers` पास करें ताकि `ssl_verification` त्रुटि से बचा जा सके।

```python
loader = UnstructuredURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Selenium URL लोडर

यह बताता है कि कैसे `SeleniumURLLoader` का उपयोग करके एक URL सूची से HTML दस्तावेज़ लोड किए जा सकते हैं।

`Selenium` का उपयोग करने से हमें JavaScript को रेंडर करने वाले पेज लोड करने में मदद मिलती है।

`SeleniumURLLoader` का उपयोग करने के लिए, आपको `selenium` और `unstructured` इंस्टॉल करना होगा।

```python
!pip install -U selenium unstructured
```

```python
from langchain_community.document_loaders import SeleniumURLLoader
```

```python
urls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://goo.gl/maps/NDSHwePEyaHMFGwh8",
]
```

```python
loader = SeleniumURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Playwright URL लोडर

यह बताता है कि कैसे `PlaywrightURLLoader` का उपयोग करके एक URL सूची से HTML दस्तावेज़ लोड किए जा सकते हैं।

[Playwright](https://playwright.dev/) आधुनिक वेब ऐप्स के लिए विश्वसनीय एंड-टू-एंड परीक्षण सक्षम बनाता है।

Selenium के मामले की तरह, `Playwright` हमें JavaScript पेज लोड और रेंडर करने में मदद करता है।

`PlaywrightURLLoader` का उपयोग करने के लिए, आपको `playwright` और `unstructured` इंस्टॉल करना होगा। इसके अलावा, आपको `Playwright Chromium` ब्राउज़र भी इंस्टॉल करना होगा:

```python
!pip install -U playwright unstructured
```

```python
!playwright install
```

```python
from langchain_community.document_loaders import PlaywrightURLLoader
```

```python
urls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://goo.gl/maps/NDSHwePEyaHMFGwh8",
]
```

```python
loader = PlaywrightURLLoader(urls=urls, remove_selectors=["header", "footer"])
```

```python
data = loader.load()
```
