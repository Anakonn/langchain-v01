---
translated: true
---

<h1>UpTrain</h1>

> UpTrain [[github](https://github.com/uptrain-ai/uptrain) || [website](https://uptrain.ai/) || [docs](https://docs.uptrain.ai/getting-started/introduction)] एक ओपन-सोर्स प्लेटफॉर्म है जो LLM अनुप्रयोगों का मूल्यांकन और सुधार करता है। यह 20+ पूर्व-कॉन्फ़िगर किए गए चेक (भाषा, कोड, एम्बेडिंग उपयोग मामलों को कवर करते हुए) के लिए ग्रेड प्रदान करता है, विफलता के मामलों पर मूल कारण विश्लेषण करता है और उन्हें हल करने के लिए मार्गदर्शन प्रदान करता है।

## UpTrain कॉलबैक हैंडलर

यह नोटबुक UpTrain कॉलबैक हैंडलर को आपकी पाइपलाइन में सुचारू रूप से एकीकृत करता है, जो विविध मूल्यांकनों को सुविधाजनक बनाता है। हमने कुछ मूल्यांकन चुने हैं जो हमें श्रृंखलाओं का मूल्यांकन करने के लिए उपयुक्त लगे। ये मूल्यांकन स्वचालित रूप से चलते हैं, और परिणाम आउटपुट में प्रदर्शित होते हैं। UpTrain के मूल्यांकनों के बारे में अधिक जानकारी [यहां](https://github.com/uptrain-ai/uptrain?tab=readme-ov-file#pre-built-evaluations-we-offer-) पाई जा सकती है।

Langchain से चयनित रिट्रीवर प्रदर्शन के लिए हाइलाइट किए गए हैं:

### 1. **वैनिला RAG**:

RAG प्रसंग को पुनर्प्राप्त करने और प्रतिक्रिया उत्पन्न करने में महत्वपूर्ण भूमिका निभाता है। इसके प्रदर्शन और प्रतिक्रिया गुणवत्ता को सुनिश्चित करने के लिए, हम निम्नलिखित मूल्यांकन करते हैं:

- **[संदर्भ प्रासंगिकता](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**: यह निर्धारित करता है कि क्वेरी से प्राप्त संदर्भ प्रतिक्रिया के लिए प्रासंगिक है।
- **[तथ्यात्मक सटीकता](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**: यह आकलन करता है कि क्या LLM हल्लूसिनेट कर रहा है या गलत जानकारी प्रदान कर रहा है।
- **[प्रतिक्रिया पूर्णता](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**: यह जांच करता है कि क्या प्रतिक्रिया में क्वेरी द्वारा अनुरोधित सभी जानकारी शामिल है।

### 2. **बहु क्वेरी जनरेशन**:

MultiQueryRetriever मूल क्वेरी के समान अर्थ वाले क्वेरी के कई संस्करण बनाता है। जटिलता को देखते हुए, हम पिछले मूल्यांकनों को शामिल करते हैं और निम्नलिखित को जोड़ते हैं:

- **[बहु क्वेरी सटीकता](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: यह सुनिश्चित करता है कि उत्पन्न बहु-क्वेरी मूल क्वेरी के समान अर्थ रखती हैं।

### 3. **संदर्भ संपीड़न और पुनः क्रमण**:

पुनः क्रमण में क्वेरी के प्रासंगिकता के आधार पर नोड्स को पुनः क्रमित करना और शीर्ष n नोड्स का चयन करना शामिल है। चूंकि पुनः क्रमण पूरा होने के बाद नोड्स की संख्या कम हो सकती है, इसलिए हम निम्नलिखित मूल्यांकन करते हैं:

- **[संदर्भ पुनः क्रमण](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: यह जांच करता है कि क्या पुनः क्रमित नोड्स का क्रम मूल क्रम की तुलना में क्वेरी के लिए अधिक प्रासंगिक है।
- **[संदर्भ संक्षिप्तता](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: यह जांचता है कि क्या कम नोड्स भी अपेक्षित सभी जानकारी प्रदान करते हैं।

ये मूल्यांकन सामूहिक रूप से RAG, MultiQueryRetriever और श्रृंखला में पुनः क्रमण प्रक्रिया की मजबूती और प्रभावशीलता को सुनिश्चित करते हैं।

## निर्भरताएं स्थापित करें

```python
%pip install -qU langchain langchain_openai uptrain faiss-cpu flashrank
```

```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)

[33mWARNING: There was an error checking the latest version of pip.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

नोट: आप `faiss-gpu` भी स्थापित कर सकते हैं `faiss-cpu` के बजाय यदि आप लाइब्रेरी के GPU-सक्षम संस्करण का उपयोग करना चाहते हैं।

## लाइब्रेरी आयात करें

```python
from getpass import getpass

from langchain.chains import RetrievalQA
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import FlashrankRerank
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.runnables.passthrough import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)
```

## दस्तावेज़ लोड करें

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

## दस्तावेज़ को टुकड़ों में विभाजित करें

```python
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
chunks = text_splitter.split_documents(documents)
```

## रिट्रीवर बनाएं

```python
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(chunks, embeddings)
retriever = db.as_retriever()
```

## LLM परिभाषित करें

```python
llm = ChatOpenAI(temperature=0, model="gpt-4")
```

## openai API कुंजी सेट करें

यह कुंजी मूल्यांकन करने के लिए आवश्यक है। UpTrain LLM द्वारा उत्पन्न प्रतिक्रियाओं का मूल्यांकन करने के लिए GPT मॉडल का उपयोग करता है।

```python
OPENAI_API_KEY = getpass()
```

## सेटअप

नीचे दिए गए प्रत्येक रिट्रीवर के लिए, हस्तक्षेप से बचने के लिए कॉलबैक हैंडलर को फिर से परिभाषित करना बेहतर है। UpTrain का उपयोग करके मूल्यांकन करने के लिए आप निम्नलिखित विकल्पों में से चुन सकते हैं:

### 1. **UpTrain का ओपन-सोर्स सॉफ़्टवेयर (OSS)**:

आप अपने मॉडल का मूल्यांकन करने के लिए ओपन-सोर्स मूल्यांकन सेवा का उपयोग कर सकते हैं।
इस मामले में, आपको एक OpenAI API कुंजी प्रदान करनी होगी। आप अपनी कुंजी [यहां](https://platform.openai.com/account/api-keys) से प्राप्त कर सकते हैं।

पैरामीटर:
- key_type="openai"
- api_key="OPENAI_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

### 2. **UpTrain प्रबंधित सेवा और डैशबोर्ड**:

आप [यहां](https://uptrain.ai/) एक मुफ्त UpTrain खाता बना सकते हैं और मुफ्त ट्रायल क्रेडिट प्राप्त कर सकते हैं। यदि आप अधिक ट्रायल क्रेडिट चाहते हैं, तो [UpTrain के रखरखावकर्ताओं से यहां कॉल बुक करें](https://calendly.com/uptrain-sourabh/30min)।

UpTrain प्रबंधित सेवा प्रदान करती है:
1. उन्नत ड्रिल-डाउन और फ़िल्टरिंग विकल्पों के साथ डैशबोर्ड
1. विफल मामलों के बीच सामान्य विषयों पर अंतर्दृष्टि
1. उत्पादन डेटा पर अवलोकनीयता और वास्तविक-समय निगरानी
1. आपकी CI/CD पाइपलाइन के साथ सुसंगत एकीकरण के माध्यम से रीग्रेशन परीक्षण

नोटबुक में UpTrain प्रबंधित सेवा से प्राप्त डैशबोर्ड और अंतर्दृष्टि की कुछ स्क्रीनशॉट शामिल हैं।

पैरामीटर:
- key_type="uptrain"
- api_key="UPTRAIN_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

**नोट:** `project_name_prefix` का उपयोग UpTrain डैशबोर्ड में प्रोजेक्ट नामों के लिए उपसर्ग के रूप में किया जाएगा। ये विभिन्न प्रकार के मूल्यांकनों के लिए अलग-अलग होंगे। उदाहरण के लिए, यदि आप project_name_prefix="langchain" सेट करते हैं और multi_query मूल्यांकन करते हैं, तो प्रोजेक्ट नाम "langchain_multi_query" होगा।

# 1. वैनिला RAG

UpTrain कॉलबैक हैंडलर स्वचालित रूप से क्वेरी, संदर्भ और उत्पन्न प्रतिक्रिया को कैप्चर करेगा और प्रतिक्रिया पर निम्नलिखित तीन मूल्यांकन *(0 से 1 तक ग्रेडेड)* चलाएगा:
- **[संदर्भ प्रासंगिकता](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**: यह जांच करें कि क्वेरी से निकाला गया संदर्भ प्रतिक्रिया के प्रासंगिक है या नहीं।
- **[तथ्यात्मक सटीकता](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**: यह जांच करें कि प्रतिक्रिया कितनी तथ्यात्मक रूप से सटीक है।
- **[प्रतिक्रिया पूर्णता](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**: यह जांच करें कि क्वेरी द्वारा पूछे गए सभी सवालों का उत्तर प्रतिक्रिया में शामिल है या नहीं।

```python
# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

# Create the chain
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Create the uptrain callback handler
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:03:44.969[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:05.809[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that she is a former top litigator in private practice, a former federal public defender, and comes from a family of public school educators and police officers. He described her as a consensus builder and noted that since her nomination, she has received a broad range of support from various groups, including the Fraternal Order of Police and former judges appointed by both Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 2. बहु क्वेरी जनरेशन

**MultiQueryRetriever** का उपयोग उस समस्या को हल करने के लिए किया जाता है कि RAG पाइपलाइन मूल क्वेरी के आधार पर सर्वश्रेष्ठ दस्तावेजों को वापस नहीं दे सकती। यह मूल क्वेरी के समान अर्थ वाली कई क्वेरी जनरेट करता है और फिर प्रत्येक के लिए दस्तावेज प्राप्त करता है।

इस पुनर्प्राप्तकर्ता का मूल्यांकन करने के लिए, UpTrain निम्नलिखित मूल्यांकन चलाएगा:
- **[बहु क्वेरी सटीकता](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: यह जांच करता है कि क्या उत्पन्न बहु-क्वेरी मूल क्वेरी के समान अर्थ वाली हैं।

```python
# Create the retriever
multi_query_retriever = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

chain = (
    {"context": multi_query_retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Invoke the chain with a query
question = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(question, config=config)
```

```output
[32m2024-04-17 17:04:10.675[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:16.804[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Multi Queries:
  - How did the president comment on Ketanji Brown Jackson?
  - What were the president's remarks regarding Ketanji Brown Jackson?
  - What statements has the president made about Ketanji Brown Jackson?

Multi Query Accuracy Score: 0.5

[32m2024-04-17 17:04:22.027[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:44.033[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that since her nomination, she has received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 3. संदर्भ संपीड़न और पुनः क्रमण

पुनः क्रमण प्रक्रिया में क्वेरी के प्रासंगिकता के आधार पर नोड को पुनः क्रमित करना और शीर्ष n नोड को चुनना शामिल है। क्योंकि पुनः क्रमण पूरा होने के बाद नोड की संख्या कम हो सकती है, हम निम्नलिखित मूल्यांकन करते हैं:
- **[संदर्भ पुनः क्रमण](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: यह जांच करें कि क्या पुनः क्रमित नोड का क्रम मूल क्रम की तुलना में क्वेरी के प्रासंगिक है।
- **[संदर्भ संक्षिप्तता](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: यह जांच करें कि क्या कम नोड भी आवश्यक सभी जानकारी प्रदान करते हैं।

```python
# Create the retriever
compressor = FlashrankRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

# Create the chain
chain = RetrievalQA.from_chain_type(llm=llm, retriever=compression_retriever)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
result = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:04:46.462[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:53.561[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson

Context Conciseness Score: 0.0
Context Reranking Score: 1.0

[32m2024-04-17 17:04:56.947[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:05:16.551[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The President mentioned that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 0.5
```
