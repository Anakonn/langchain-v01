---
translated: true
---

# Azure AI Search

[Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) (पूर्व में `Azure Cognitive Search` के नाम से जाना जाता था) एक Microsoft क्लाउड सर्च सेवा है जो डेवलपर्स को वृहद स्तर पर वेक्टर, कीवर्ड, और हाइब्रिड क्वेरीज़ के लिए इंफ्रास्ट्रक्चर, APIs, और उपकरण प्रदान करती है।

`AzureAISearchRetriever` एक इंटीग्रेशन मॉड्यूल है जो एक असंरचित क्वेरी से दस्तावेज़ लौटाता है। यह BaseRetriever क्लास पर आधारित है और Azure AI Search के 2023-11-01 स्थिर REST API संस्करण को लक्षित करता है, जिसका मतलब है कि यह वेक्टर इंडेक्सिंग और क्वेरीज़ को समर्थन करता है।

इस मॉड्यूल का उपयोग करने के लिए, आपको आवश्यकता होगी:

+ एक Azure AI Search सेवा। आप Azure ट्रायल के लिए साइन अप करके [एक बना सकते हैं](https://learn.microsoft.com/azure/search/search-create-service-portal) मुफ्त में। एक मुफ्त सेवा के पास निम्न कोटा होते हैं, लेकिन यह इस नोटबुक में कोड चलाने के लिए पर्याप्त है।

+ मौजूदा वेक्टर फील्ड्स के साथ एक इंडेक्स। इसे बनाने के कई तरीके हैं, जिसमें [वेक्टर स्टोर मॉड्यूल](../vectorstores/azuresearch.md) का उपयोग करना शामिल है। या, [Azure AI Search REST APIs आज़माएं](https://learn.microsoft.com/azure/search/search-get-started-vector)।

+ एक API कुंजी। API कुंजियाँ तब उत्पन्न होती हैं जब आप सर्च सेवा बनाते हैं। यदि आप केवल एक इंडेक्स क्वेरी कर रहे हैं, तो आप क्वेरी API कुंजी का उपयोग कर सकते हैं, अन्यथा एक एडमिन API कुंजी का उपयोग करें। विवरण के लिए [अपनी API कुंजियाँ खोजें](https://learn.microsoft.com/azure/search/search-security-api-keys?tabs=rest-use%2Cportal-find%2Cportal-query#find-existing-keys) देखें।

`AzureAISearchRetriever` `AzureCognitiveSearchRetriever` को प्रतिस्थापित करता है, जिसे जल्द ही अप्रचलित कर दिया जाएगा। हम सुझाव देते हैं कि आप सर्च APIs के सबसे हाल के स्थिर संस्करण पर आधारित नए संस्करण पर स्विच करें।

## पैकेज इंस्टॉल करें

azure-documents-search पैकेज 11.4 या बाद का उपयोग करें।

```python
%pip install --upgrade --quiet langchain
%pip install --upgrade --quiet langchain-openai
%pip install --upgrade --quiet  azure-search-documents
%pip install --upgrade --quiet  azure-identity
```

## आवश्यक पुस्तकालय आयात करें

```python
import os

from langchain_community.retrievers import (
    AzureAISearchRetriever,
)
```

## सर्च सेटिंग्स कॉन्फ़िगर करें

सर्च सेवा नाम, इंडेक्स नाम, और API कुंजी को पर्यावरणीय चर के रूप में सेट करें (वैकल्पिक रूप से, आप इन्हें `AzureAISearchRetriever` को तर्क के रूप में भी पास कर सकते हैं)। सर्च इंडेक्स खोजने योग्य सामग्री प्रदान करता है।

```python
os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "<YOUR_SEARCH_INDEX_NAME>"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_API_KEY>"
```

## रिट्रीवर बनाएं

`AzureAISearchRetriever` के लिए, एक `index_name`, `content_key`, और `top_k` प्रदान करें और परिणामों की संख्या सेट करें जिसे आप पुनः प्राप्त करना चाहते हैं। `top_k` को शून्य (डिफ़ॉल्ट) पर सेट करने से सभी परिणाम लौटते हैं।

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

अब आप इसे Azure AI Search से दस्तावेज़ पुनः प्राप्त करने के लिए उपयोग कर सकते हैं। यह वह विधि है जिसे आप ऐसा करने के लिए कॉल करेंगे। यह क्वेरी से संबंधित सभी दस्तावेज़ लौटाएगा।

```python
retriever.invoke("here is my unstructured query string")
```

## उदाहरण

यह अनुभाग निर्मित नमूना डेटा पर रिट्रीवर का उपयोग करने का प्रदर्शन करता है। यदि आपके पास पहले से ही आपकी सर्च सेवा पर एक वेक्टर इंडेक्स है, तो आप इस चरण को छोड़ सकते हैं।

एंडपॉइंट्स और कुंजियों को प्रदान करके प्रारंभ करें। चूंकि हम इस चरण में एक वेक्टर इंडेक्स बना रहे हैं, एक पाठ एम्बेडिंग मॉडल निर्दिष्ट करें ताकि पाठ का वेक्टर प्रतिनिधित्व प्राप्त हो सके। यह उदाहरण Azure OpenAI को text-embedding-ada-002 के एक डिप्लॉयमेंट के साथ मानता है। क्योंकि यह चरण एक इंडेक्स बनाता है, सुनिश्चित करें कि आप अपनी सर्च सेवा के लिए एक एडमिन API कुंजी का उपयोग करें।

```python
import os

from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import TokenTextSplitter
from langchain.vectorstores import AzureSearch
from langchain_community.retrievers import AzureAISearchRetriever
from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings

os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "langchain-vector-demo"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_SEARCH_SERVICE_ADMIN_API_KEY>"
azure_endpoint: str = "<YOUR_AZURE_OPENAI_ENDPOINT>"
azure_openai_api_key: str = "<YOUR_AZURE_OPENAI_API_KEY>"
azure_openai_api_version: str = "2023-05-15"
azure_deployment: str = "text-embedding-ada-002"
```

हम अपने दस्तावेज़ों को Azure AI Search वेक्टर स्टोर में संग्रहीत एम्बेडिंग में बदलने के लिए Azure OpenAI से एक एम्बेडिंग मॉडल का उपयोग करेंगे। हम इंडेक्स नाम को `langchain-vector-demo` पर सेट करेंगे। यह उस इंडेक्स नाम के साथ एक नया वेक्टर स्टोर बनाएगा।

```python
embeddings = AzureOpenAIEmbeddings(
    model=azure_deployment,
    azure_endpoint=azure_endpoint,
    openai_api_key=azure_openai_api_key,
)

vector_store: AzureSearch = AzureSearch(
    embedding_function=embeddings.embed_query,
    azure_search_endpoint=os.getenv("AZURE_AI_SEARCH_SERVICE_NAME"),
    azure_search_key=os.getenv("AZURE_AI_SEARCH_API_KEY"),
    index_name="langchain-vector-demo",
)
```

अगले, हम अपने नए बनाए गए वेक्टर स्टोर में डेटा लोड करेंगे। इस उदाहरण के लिए, हम `state_of_the_union.txt` फ़ाइल लोड करेंगे। हम 400 टोकन खंडों में पाठ को विभाजित करेंगे जिसका कोई ओवरलैप नहीं होगा। अंत में, दस्तावेज़ों को हमारे वेक्टर स्टोर में एम्बेडिंग के रूप में जोड़ा जाता है।

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt", encoding="utf-8")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

vector_store.add_documents(documents=docs)
```

अगले, हम एक रिट्रीवर बनाएंगे। वर्तमान `index_name` वेरिएबल पिछले चरण से `langchain-vector-demo` है। यदि आपने वेक्टर स्टोर निर्माण को छोड़ दिया है, तो पैरामीटर में अपना इंडेक्स नाम प्रदान करें। इस क्वेरी में, शीर्ष परिणाम लौटाया जाता है।

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

अब हम उन दस्तावेज़ों से संबंधित डेटा को पुनः प्राप्त कर सकते हैं जो हमने अपलोड किए हैं।

```python
retriever.invoke("does the president have a plan for covid-19?")
```
