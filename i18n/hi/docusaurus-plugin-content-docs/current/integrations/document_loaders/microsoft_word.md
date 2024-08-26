---
translated: true
---

# माइक्रोसॉफ्ट वर्ड

>[माइक्रोसॉफ्ट वर्ड](https://www.microsoft.com/en-us/microsoft-365/word) माइक्रोसॉफ्ट द्वारा विकसित एक वर्ड प्रोसेसर है।

यह कवर करता है कि कैसे वर्ड दस्तावेज़ों को एक दस्तावेज़ प्रारूप में लोड किया जाए जिसका हम आगे उपयोग कर सकते हैं।

## Docx2txt का उपयोग करना

`.docx` फ़ाइलों को `Docx2txt` का उपयोग करके एक दस्तावेज़ में लोड करें।

```python
%pip install --upgrade --quiet  docx2txt
```

```python
from langchain_community.document_loaders import Docx2txtLoader
```

```python
loader = Docx2txtLoader("example_data/fake.docx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.docx'})]
```

## अव्यवस्थित का उपयोग करना

```python
from langchain_community.document_loaders import UnstructuredWordDocumentLoader
```

```python
loader = UnstructuredWordDocumentLoader("example_data/fake.docx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 'fake.docx'}, lookup_index=0)]
```

### तत्वों को बरकरार रखना

अंदर की बात, अव्यवस्थित विभिन्न "तत्वों" को पाठ के विभिन्न टुकड़ों के लिए बनाता है। डिफ़ॉल्ट रूप से हम उन्हें एक साथ जोड़ देते हैं, लेकिन आप `mode="elements"` निर्दिष्ट करके इस अलगाव को आसानी से बरकरार रख सकते हैं।

```python
loader = UnstructuredWordDocumentLoader("example_data/fake.docx", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 'fake.docx', 'filename': 'fake.docx', 'category': 'Title'}, lookup_index=0)
```

## Azure AI Document Intelligence का उपयोग करना

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (पहले `Azure Form Recognizer` के रूप में जाना जाता था) एक मशीन-लर्निंग
>आधारित सेवा है जो पाठ (हस्तलिखित सहित), तालिकाएं, दस्तावेज़ संरचनाएं (जैसे शीर्षक, अनुभाग शीर्षक आदि) और कुंजी-मूल्य-युग्मों को डिजिटल या स्कैन किए गए PDF, छवि, Office और HTML फ़ाइलों से निकालती है।
>
>Document Intelligence `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` और `HTML` का समर्थन करता है।

`Document Intelligence` का उपयोग करके एक लोडर का यह वर्तमान कार्यान्वयन सामग्री को पृष्ठवार शामिल कर सकता है और इसे LangChain दस्तावेज़ों में बदल सकता है। डिफ़ॉल्ट आउटपुट प्रारूप मार्कडाउन है, जिसे `MarkdownHeaderTextSplitter` के साथ आसानी से शब्दार्थिक दस्तावेज़ चंकिंग के लिए श्रृंखलित किया जा सकता है। आप `mode="single"` या `mode="page"` का भी उपयोग कर सकते हैं ताकि एक पृष्ठ या दस्तावेज़ में विभाजित शुद्ध पाठ वापस मिले।

## पूर्वापेक्षा

**पूर्व**, **पश्चिम यूएस2**, **पश्चिम यूरोप** में से किसी एक प्रीव्यू क्षेत्र में एक Azure AI Document Intelligence संसाधन - [इस दस्तावेज़](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) का पालन करके एक बनाएं यदि आपके पास नहीं है। आप लोडर के लिए `<endpoint>` और `<key>` पैरामीटर के रूप में पारित करेंगे।

%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, file_path=file_path, api_model="prebuilt-layout"
)

documents = loader.load()
```
