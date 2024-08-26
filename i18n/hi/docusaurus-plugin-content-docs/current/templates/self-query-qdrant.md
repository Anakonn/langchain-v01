---
translated: true
---

यह टेम्पलेट [self-querying](https://python.langchain.com/docs/modules/data_connection/retrievers/self_query/) का उपयोग करता है, जो Qdrant और OpenAI का उपयोग करता है। डिफ़ॉल्ट रूप से, यह 10 दस्तावेजों का एक कृत्रिम डेटासेट का उपयोग करता है, लेकिन आप इसे अपने स्वयं के डेटासेट से बदल सकते हैं।

## वातावरण सेटअप

`OPENAI_API_KEY` पर्यावरण चर को OpenAI मॉडल्स तक पहुंच प्राप्त करने के लिए सेट करें।

`QDRANT_URL` को अपने Qdrant इंस्टेंस के URL पर सेट करें। यदि आप [Qdrant Cloud](https://cloud.qdrant.io) का उपयोग करते हैं, तो आपको `QDRANT_API_KEY` पर्यावरण चर भी सेट करना होगा। यदि आप इनमें से कोई भी नहीं सेट करते हैं, तो टेम्पलेट `http://localhost:6333` पर एक स्थानीय Qdrant इंस्टेंस से कनेक्ट करने का प्रयास करेगा।

```shell
export QDRANT_URL=
export QDRANT_API_KEY=

export OPENAI_API_KEY=
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, पहले LangChain CLI स्थापित करें:

```shell
pip install -U "langchain-cli[serve]"
```

एक नया LangChain प्रोजेक्ट बनाएं और इस पैकेज को इकलौता पैकेज के रूप में स्थापित करें:

```shell
langchain app new my-app --package self-query-qdrant
```

किसी मौजूदा प्रोजेक्ट में जोड़ने के लिए, निम्नलिखित कमांड चलाएं:

```shell
langchain app add self-query-qdrant
```

### डिफ़ॉल्ट

सर्वर लॉन्च करने से पहले, आपको एक Qdrant संग्रह बनाना और दस्तावेजों को सूचीबद्ध करना होगा। निम्नलिखित कमांड चलाकर यह किया जा सकता है:

```python
from self_query_qdrant.chain import initialize

initialize()
```

अपने `app/server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from self_query_qdrant.chain import chain

add_routes(app, chain, path="/self-query-qdrant")
```

डिफ़ॉल्ट डेटासेट में 10 दस्तावेज शामिल हैं जो व्यंजनों, उनकी कीमत और रेस्तरां की जानकारी के बारे में हैं। आप दस्तावेजों को `packages/self-query-qdrant/self_query_qdrant/defaults.py` फ़ाइल में पा सकते हैं। यहां एक दस्तावेज है:

```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html", "title": "self-query-qdrant"}]-->
from langchain_core.documents import Document

Document(
    page_content="Spaghetti with meatballs and tomato sauce",
    metadata={
        "price": 12.99,
        "restaurant": {
            "name": "Olive Garden",
            "location": ["New York", "Chicago", "Los Angeles"],
        },
    },
)
```

self-querying दस्तावेजों पर语义搜索करने की अनुमति देता है, साथ ही मेटाडेटा पर आधारित कुछ अतिरिक्त फ़िल्टरिंग भी। उदाहरण के लिए, आप $15 से कम कीमत वाले और न्यूयॉर्क में परोसे जाने वाले व्यंजनों के लिए खोज कर सकते हैं।

### अनुकूलन

उपरोक्त सभी उदाहरण मान लेते हैं कि आप केवल डिफ़ॉल्ट के साथ टेम्पलेट लॉन्च करना चाहते हैं। यदि आप टेम्पलेट को अनुकूलित करना चाहते हैं, तो आप `app/server.py` फ़ाइल में `create_chain` फ़ंक्शन में पैरामीटर पास करके ऐसा कर सकते हैं:

```python
<!--IMPORTS:[{"imported": "Cohere", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html", "title": "self-query-qdrant"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "self-query-qdrant"}, {"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.schema", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "self-query-qdrant"}]-->
from langchain_community.llms import Cohere
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains.query_constructor.schema import AttributeInfo

from self_query_qdrant.chain import create_chain

chain = create_chain(
    llm=Cohere(),
    embeddings=HuggingFaceEmbeddings(),
    document_contents="Descriptions of cats, along with their names and breeds.",
    metadata_field_info=[
        AttributeInfo(name="name", description="Name of the cat", type="string"),
        AttributeInfo(name="breed", description="Cat's breed", type="string"),
    ],
    collection_name="cats",
)
```

यही बात `initialize` फ़ंक्शन के लिए भी लागू होती है, जो एक Qdrant संग्रह बनाता है और दस्तावेजों को सूचीबद्ध करता है:

```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html", "title": "self-query-qdrant"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "self-query-qdrant"}]-->
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings

from self_query_qdrant.chain import initialize

initialize(
    embeddings=HuggingFaceEmbeddings(),
    collection_name="cats",
    documents=[
        Document(
            page_content="A mean lazy old cat who destroys furniture and eats lasagna",
            metadata={"name": "Garfield", "breed": "Tabby"},
        ),
        ...
    ]
)
```

टेम्पलेट लचीला है और इसका उपयोग अलग-अलग सेट के दस्तावेजों के लिए आसानी से किया जा सकता है।

### LangSmith

(वैकल्पिक) यदि आपके पास LangSmith तक पहुंच है, तो LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद के लिए इसे कॉन्फ़िगर करें। यदि आपके पास पहुंच नहीं है, तो इस खंड को छोड़ दें।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

### स्थानीय सर्वर

यह FastAPI ऐप को एक सर्वर के साथ [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चलाना शुरू करेगा।

आप [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं
[http://127.0.0.1:8000/self-query-qdrant/playground](http://127.0.0.1:8000/self-query-qdrant/playground) पर प्लेग्राउंड तक पहुंच करें

कोड से टेम्पलेट तक पहुंचने के लिए:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/self-query-qdrant")
```
