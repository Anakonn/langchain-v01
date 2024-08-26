---
translated: true
---

# Azure AI डॉक्यूमेंट इंटेलिजेंस

>[Azure AI डॉक्यूमेंट इंटेलिजेंस](https://aka.ms/doc-intelligence) (पहले `Azure Form Recognizer` के रूप में जाना जाता था) एक मशीन-लर्निंग आधारित सेवा है जो डिजिटल या स्कैन किए गए PDF, छवि, Office और HTML फ़ाइलों से पाठ (हस्तलिखित सहित), तालिकाएं, दस्तावेज़ संरचनाएं (जैसे शीर्षक, अनुभाग शीर्षक आदि) और कुंजी-मूल्य-युग्मों को निकालती है।

डॉक्यूमेंट इंटेलिजेंस `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` और `HTML` का समर्थन करता है।

`डॉक्यूमेंट इंटेलिजेंस` का वर्तमान कार्यान्वयन `LangChain` दस्तावेजों में सामग्री को पृष्ठ-वार शामिल कर सकता है। डिफ़ॉल्ट आउटपुट प्रारूप मार्कडाउन है, जिसे `MarkdownHeaderTextSplitter` के साथ सेमांटिक दस्तावेज़ चंकिंग के लिए आसानी से श्रृंखलित किया जा सकता है। आप `mode="single"` या `mode="page"` का भी उपयोग कर सकते हैं ताकि एक पृष्ठ या दस्तावेज़ द्वारा विभाजित शुद्ध पाठ वापस मिल सके।

## पूर्वापेक्षा

**पूर्व-प्रीव्यू क्षेत्रों** में से किसी एक में एक Azure AI डॉक्यूमेंट इंटेलिजेंस संसाधन: **पूर्वी संयुक्त राज्य अमेरिका**, **पश्चिमी संयुक्त राज्य अमेरिका 2**, **पश्चिमी यूरोप** - यदि आपके पास नहीं है, तो [इस दस्तावेज़](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) का पालन करके एक बनाएं। आप `<endpoint>` और `<key>` को लोडर के पैरामीटर के रूप में पास करेंगे।

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

## उदाहरण 1

पहला उदाहरण एक स्थानीय फ़ाइल का उपयोग करता है जिसे Azure AI डॉक्यूमेंट इंटेलिजेंस को भेजा जाएगा।

दस्तावेज़ विश्लेषण क्लाइंट को प्रारंभ करने के बाद, हम `DocumentIntelligenceLoader` का एक उदाहरण बना सकते हैं:

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

डिफ़ॉल्ट आउटपुट में मार्कडाउन प्रारूप सामग्री के साथ एक `LangChain` दस्तावेज़ होता है:

```python
documents
```

## उदाहरण 2

इनपुट फ़ाइल एक सार्वजनिक URL पथ भी हो सकती है। उदाहरण के लिए, https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/rest-api/layout.png।

```python
url_path = "<url>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, url_path=url_path, api_model="prebuilt-layout"
)

documents = loader.load()
```

```python
documents
```

## उदाहरण 3

आप `mode="page"` भी निर्दिष्ट कर सकते हैं ताकि पृष्ठों द्वारा दस्तावेज़ लोड किया जा सके।

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    mode="page",
)

documents = loader.load()
```

आउटपुट में सूची में अलग-अलग दस्तावेज़ के रूप में संग्रहीत प्रत्येक पृष्ठ होगा:

```python
for document in documents:
    print(f"Page Content: {document.page_content}")
    print(f"Metadata: {document.metadata}")
```

## उदाहरण 4

आप `analysis_feature=["ocrHighResolution"]` भी निर्दिष्ट कर सकते हैं ताकि एड-ऑन क्षमताएं सक्षम हो जाएं। अधिक जानकारी के लिए, देखें: https://aka.ms/azsdk/python/documentintelligence/analysisfeature।

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
analysis_features = ["ocrHighResolution"]
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    analysis_features=analysis_features,
)

documents = loader.load()
```

आउटपुट में उच्च रिज़ॉल्यूशन एड-ऑन क्षमता के साथ पहचाना गया `LangChain` दस्तावेज़ शामिल है:

```python
documents
```
