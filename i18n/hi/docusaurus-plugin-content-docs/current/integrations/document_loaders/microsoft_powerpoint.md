---
translated: true
---

# माइक्रोसॉफ्ट पावरपॉइंट

>[माइक्रोसॉफ्ट पावरपॉइंट](https://en.wikipedia.org/wiki/Microsoft_PowerPoint) माइक्रोसॉफ्ट द्वारा विकसित एक प्रस्तुति कार्यक्रम है।

यह कवर करता है कि कैसे `माइक्रोसॉफ्ट पावरपॉइंट` दस्तावेज़ों को एक दस्तावेज़ प्रारूप में लोड किया जा सकता है जिसका हम आगे उपयोग कर सकते हैं।

```python
from langchain_community.document_loaders import UnstructuredPowerPointLoader
```

```python
loader = UnstructuredPowerPointLoader("example_data/fake-power-point.pptx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Adding a Bullet Slide\n\nFind the bullet slide layout\n\nUse _TextFrame.text for first bullet\n\nUse _TextFrame.add_paragraph() for subsequent bullets\n\nHere is a lot of text!\n\nHere is some text in a text box!', metadata={'source': 'example_data/fake-power-point.pptx'})]
```

### तत्वों को बरकरार रखना

मूल रूप से, `Unstructured` विभिन्न "तत्वों" के लिए अलग-अलग टेक्स्ट के टुकड़े बनाता है। डिफ़ॉल्ट रूप से हम उन्हें एक साथ जोड़ देते हैं, लेकिन आप `mode="elements"` निर्दिष्ट करके इस अलगाव को आसानी से बरकरार रख सकते हैं।

```python
loader = UnstructuredPowerPointLoader(
    "example_data/fake-power-point.pptx", mode="elements"
)
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='Adding a Bullet Slide', lookup_str='', metadata={'source': 'example_data/fake-power-point.pptx'}, lookup_index=0)
```

## Azure AI Document Intelligence का उपयोग करना

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (पहले `Azure Form Recognizer` के रूप में जाना जाता था) एक मशीन-लर्निंग आधारित सेवा है जो डिजिटल या स्कैन किए गए PDF, छवि, Office और HTML फ़ाइलों से पाठ (हस्तलिखित सहित), तालिकाएं, दस्तावेज़ संरचनाएं (जैसे शीर्षक, अनुभाग शीर्षक आदि) और कुंजी-मूल्य-युग्मों को निकालती है।
>
>Document Intelligence `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` और `HTML` का समर्थन करता है।

`Document Intelligence` का यह वर्तमान कार्यान्वयन पृष्ठ-वार सामग्री को शामिल कर सकता है और इसे LangChain दस्तावेज़ों में बदल सकता है। डिफ़ॉल्ट आउटपुट प्रारूप मार्कडाउन है, जिसे `MarkdownHeaderTextSplitter` के साथ आसानी से सेमांटिक दस्तावेज़ चंकिंग के लिए श्रृंखलित किया जा सकता है। आप `mode="single"` या `mode="page"` का भी उपयोग कर सकते हैं ताकि एक पृष्ठ या दस्तावेज़ में विभाजित शुद्ध पाठ वापस मिल सके।

## पूर्वापेक्षा

**पूर्व**, **पश्चिम यूएस2**, **पश्चिम यूरोप** में से किसी एक प्रीव्यू क्षेत्र में एक Azure AI Document Intelligence संसाधन - [इस दस्तावेज़](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) का पालन करके एक बनाएं यदि आपके पास नहीं है। आप `<endpoint>` और `<key>` को लोडर के पैरामीटर के रूप में पास करेंगे।

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

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
