---
translated: true
---

# Apify डेटासेट

>[Apify डेटासेट](https://docs.apify.com/platform/storage/dataset) एक पैमाने योग्य केवल-अपेंड स्टोरेज है जिसमें क्रमिक पहुंच है और यह संरचित वेब स्क्रैपिंग परिणामों, जैसे उत्पादों या Google SERP की सूची, को संग्रहित करने और उन्हें JSON, CSV या Excel जैसे विभिन्न प्रारूपों में निर्यात करने के लिए बनाया गया है। डेटासेट मुख्य रूप से विभिन्न वेब स्क्रैपिंग, क्रॉलिंग और डेटा निकालने के उपयोग मामलों के लिए [Apify एक्टर](https://apify.com/store) - सर्वरलेस क्लाउड कार्यक्रमों के परिणामों को सहेजने के लिए उपयोग किए जाते हैं।

यह नोटबुक दिखाता है कि LangChain में Apify डेटासेट कैसे लोड किए जाएं।

## पूर्वापेक्षाएं

आपके पास Apify प्लेटफ़ॉर्म पर मौजूद एक मौजूदा डेटासेट होना चाहिए। यदि आपके पास कोई नहीं है, तो कृपया पहले [इस नोटबुक](/docs/integrations/tools/apify) को देखें कि दस्तावेज़ीकरण, नॉलेज बेस, हेल्प सेंटर या ब्लॉग से सामग्री को कैसे निकाला जाए।

```python
%pip install --upgrade --quiet  apify-client
```

सबसे पहले, अपने स्रोत कोड में `ApifyDatasetLoader` को आयात करें:

```python
from langchain_community.document_loaders import ApifyDatasetLoader
from langchain_core.documents import Document
```

फिर एक ऐसा फ़ंक्शन प्रदान करें जो Apify डेटासेट रिकॉर्ड फ़ील्ड को LangChain `Document` प्रारूप में मैप करता है।

उदाहरण के लिए, यदि आपके डेटासेट आइटम इस तरह से संरचित हैं:

```json
{
    "url": "https://apify.com",
    "text": "Apify is the best web scraping and automation platform."
}
```

नीचे दिए गए कोड में मैपिंग फ़ंक्शन उन्हें LangChain `Document` प्रारूप में रूपांतरित करेगा, ताकि आप किसी भी LLM मॉडल (जैसे प्रश्न-उत्तर के लिए) के साथ उन्हें आगे उपयोग कर सकें।

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda dataset_item: Document(
        page_content=dataset_item["text"], metadata={"source": dataset_item["url"]}
    ),
)
```

```python
data = loader.load()
```

## प्रश्न-उत्तर के साथ एक उदाहरण

इस उदाहरण में, हम एक प्रश्न का उत्तर देने के लिए एक डेटासेट से डेटा का उपयोग करते हैं।

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import ApifyDatasetLoader
```

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

```python
query = "What is Apify?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 Apify is a platform for developing, running, and sharing serverless cloud programs. It enables users to create web scraping and automation tools and publish them on the Apify platform.

https://docs.apify.com/platform/actors, https://docs.apify.com/platform/actors/running/actors-in-store, https://docs.apify.com/platform/security, https://docs.apify.com/platform/actors/examples
```
