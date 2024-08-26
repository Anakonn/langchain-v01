---
translated: true
---

# टाइपसेंस

> [टाइपसेंस](https://typesense.org) एक ओपन-सोर्स, मेमोरी में चलने वाला सर्च इंजन है, जिसे आप या तो [स्वयं होस्ट](https://typesense.org/docs/guide/install-typesense#option-2-local-machine-self-hosting) कर सकते हैं या [टाइपसेंस क्लाउड](https://cloud.typesense.org/) पर चला सकते हैं।
>
> टाइपसेंस प्रदर्शन पर ध्यान केंद्रित करता है क्योंकि यह पूरा इंडेक्स RAM में स्टोर करता है (डिस्क पर बैकअप के साथ) और साथ ही उपलब्ध विकल्पों को सरल बनाकर और अच्छे डिफ़ॉल्ट सेट करके डेवलपर अनुभव को सरल बनाने पर भी ध्यान केंद्रित करता है।
>
> यह आपको विशेषता-आधारित फ़िल्टरिंग को वेक्टर क्वेरी के साथ संयोजित करने की भी अनुमति देता है, ताकि सबसे प्रासंगिक दस्तावेज़ प्राप्त किए जा सकें।

यह नोटबुक आपको दिखाता है कि आप अपने VectorStore के रूप में टाइपसेंस का उपयोग कैसे कर सकते हैं।

पहले आइए अपनी निर्भरताओं को स्थापित करें:

```python
%pip install --upgrade --quiet  typesense openapi-schema-pydantic langchain-openai tiktoken
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Typesense
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

आइए अपने परीक्षण डेटासेट को आयात करें:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
docsearch = Typesense.from_documents(
    docs,
    embeddings,
    typesense_client_params={
        "host": "localhost",  # Use xxx.a1.typesense.net for Typesense Cloud
        "port": "8108",  # Use 443 for Typesense Cloud
        "protocol": "http",  # Use https for Typesense Cloud
        "typesense_api_key": "xyz",
        "typesense_collection_name": "lang-chain",
    },
)
```

## समानता खोज

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = docsearch.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

## एक पुनर्प्राप्तकर्ता के रूप में टाइपसेंस

टाइपसेंस, अन्य सभी वेक्टर स्टोर की तरह, कोसाइन समानता का उपयोग करके एक LangChain पुनर्प्राप्तकर्ता है।

```python
retriever = docsearch.as_retriever()
retriever
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```
