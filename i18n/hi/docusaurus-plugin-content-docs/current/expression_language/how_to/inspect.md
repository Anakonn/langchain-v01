---
translated: true
---

# अपने रनेबल्स का निरीक्षण करें

एक बार जब आप LCEL के साथ एक रनेबल बनाते हैं, तो आप अक्सर इसका निरीक्षण करना चाहते हैं ताकि आप इसके बारे में बेहतर अंदाजा लगा सकें। यह नोटबुक कुछ तरीकों को कवर करता है जिनसे ऐसा किया जा सकता है।

पहले, आइए एक उदाहरण LCEL बनाएं। हम एक ऐसा बनाएंगे जो पुनर्प्राप्ति करता है।

```python
%pip install --upgrade --quiet  langchain langchain-openai faiss-cpu tiktoken
```

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()
```

```python
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

## एक ग्राफ प्राप्त करें

आप रनेबल का एक ग्राफ प्राप्त कर सकते हैं।

```python
chain.get_graph()
```

## एक ग्राफ प्रिंट करें

जबकि यह बहुत पठनीय नहीं है, आप इसे प्रिंट कर सकते हैं ताकि इसे समझना आसान हो।

```python
chain.get_graph().print_ascii()
```

```output
           +---------------------------------+
           | Parallel<context,question>Input |
           +---------------------------------+
                    **               **
                 ***                   ***
               **                         **
+----------------------+              +-------------+
| VectorStoreRetriever |              | Passthrough |
+----------------------+              +-------------+
                    **               **
                      ***         ***
                         **     **
           +----------------------------------+
           | Parallel<context,question>Output |
           +----------------------------------+
                             *
                             *
                             *
                  +--------------------+
                  | ChatPromptTemplate |
                  +--------------------+
                             *
                             *
                             *
                      +------------+
                      | ChatOpenAI |
                      +------------+
                             *
                             *
                             *
                   +-----------------+
                   | StrOutputParser |
                   +-----------------+
                             *
                             *
                             *
                +-----------------------+
                | StrOutputParserOutput |
                +-----------------------+
```

## प्रॉम्प्ट्स प्राप्त करें

प्रत्येक श्रृंखला का एक महत्वपूर्ण हिस्सा प्रॉम्प्ट्स हैं जो उपयोग किए जाते हैं। आप श्रृंखला में मौजूद प्रॉम्प्ट्स को प्राप्त कर सकते हैं:

```python
chain.get_prompts()
```

```output
[ChatPromptTemplate(input_variables=['context', 'question'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template='Answer the question based only on the following context:\n{context}\n\nQuestion: {question}\n'))])]
```
