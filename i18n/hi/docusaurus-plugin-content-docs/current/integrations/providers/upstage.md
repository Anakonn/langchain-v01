---
translated: true
---

# अभिनय

[अभिनय](https://upstage.ai) एक अग्रणी कृत्रिम बुद्धिमत्ता (AI) कंपनी है जो उच्च-मानव-ग्रेड प्रदर्शन एलएलएम घटकों की डिलीवरी में विशेषज्ञता रखती है।

## सौर एलएलएम

**सौर मिनी चैट** एक तेज़ लेकिन शक्तिशाली उन्नत बड़ी भाषा मॉडल है जो अंग्रेज़ी और कोरियाई पर केंद्रित है। इसे विशेष रूप से बहु-दौर वार्तालाप उद्देश्यों के लिए अनुकूलित किया गया है, जो कि अन्य समान आकार के मॉडलों की तुलना में व्यापक प्राकृतिक भाषा प्रसंस्करण कार्यों, जैसे बहु-दौर वार्तालाप या लंबे संदर्भों को समझने की आवश्यकता वाले कार्यों, जैसे RAG (पुनर्प्राप्ति-सहायता उत्पादन), में बेहतर प्रदर्शन दिखाता है। इस अनुकूलन ने इसे लंबी वार्तालापों को और प्रभावी ढंग से संभालने की क्षमता प्रदान की है, जिससे यह इंटरैक्टिव अनुप्रयोगों के लिए विशेष रूप से कुशल बन गया है।

सौर के अलावा, अभिनय वास्तविक दुनिया के RAG (पुनर्प्राप्ति-सहायता उत्पादन) के लिए भी सुविधाएं प्रदान करता है, जैसे **ग्राउंडेडनेस चेक** और **लेआउट विश्लेषण**।

## स्थापना और सेटअप

`langchain-upstage` पैकेज स्थापित करें:

```bash
pip install -qU langchain-core langchain-upstage
```

[API कुंजियां](https://console.upstage.ai) प्राप्त करें और `UPSTAGE_API_KEY` पर्यावरण चर सेट करें।

## अभिनय LangChain एकीकरण

| API | विवरण | आयात | उदाहरण उपयोग |
| --- | --- | --- | --- |
| चैट | सौर मिनी चैट का उपयोग करके सहायकों का निर्माण करें | `from langchain_upstage import ChatUpstage` | [जाएं](../../chat/upstage) |
| पाठ एम्बेडिंग | स्ट्रिंग्स को量量में एम्बेड करें | `from langchain_upstage import UpstageEmbeddings` | [जाएं](../../text_embedding/upstage) |
| ग्राउंडेडनेस चेक | सहायक के प्रतिक्रिया की ग्राउंडेडनेस की पुष्टि करें | `from langchain_upstage import UpstageGroundednessCheck` | [जाएं](../../tools/upstage_groundedness_check) |
| लेआउट विश्लेषण | तालिकाओं और चित्रों के साथ दस्तावेज़ों को सीरियलाइज़ करें | `from langchain_upstage import UpstageLayoutAnalysisLoader` | [जाएं](../../document_loaders/upstage) |

अधिक जानकारी के लिए [दस्तावेज़ीकरण](https://developers.upstage.ai/) देखें।

## त्वरित उदाहरण

### वातावरण सेटअप

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

### चैट

```python
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
response = chat.invoke("Hello, how are you?")
print(response)
```

### पाठ एम्बेडिंग

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)

query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

### ग्राउंडेडनेस चेक

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()

request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawaii. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}
response = groundedness_check.invoke(request_input)
print(response)
```

### लेआउट विश्लेषण

```python
from langchain_upstage import UpstageLayoutAnalysisLoader

file_path = "/PATH/TO/YOUR/FILE.pdf"
layzer = UpstageLayoutAnalysisLoader(file_path, split="page")

# For improved memory efficiency, consider using the lazy_load method to load documents page by page.
docs = layzer.load()  # or layzer.lazy_load()

for doc in docs[:3]:
    print(doc)
```
