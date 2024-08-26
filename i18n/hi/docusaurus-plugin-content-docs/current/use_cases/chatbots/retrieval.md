---
sidebar_position: 2
translated: true
---

# पुनर्प्राप्ति

पुनर्प्राप्ति एक सामान्य तकनीक है जिसका उपयोग चैटबॉट अपने प्रशिक्षण डेटा के बाहर के डेटा से अपने प्रतिक्रियाओं को बढ़ाने के लिए करते हैं। यह खंड चैटबॉट के संदर्भ में पुनर्प्राप्ति को कैसे लागू करें, इस पर कवर करेगा, लेकिन यह ध्यान देने योग्य है कि पुनर्प्राप्ति एक बहुत ही सूक्ष्म और गहरा विषय है - हम आपको [प्रलेखन के अन्य भागों](/docs/use_cases/question_answering/) का अन्वेषण करने के लिए प्रोत्साहित करते हैं जो इस पर अधिक गहराई से जाते हैं!

## सेटअप

आपको कुछ पैकेज इंस्टॉल करने होंगे, और आपका OpenAI API कुंजी `OPENAI_API_KEY` नाम के एक पर्यावरण चर के रूप में सेट होनी चाहिए:

```python
%pip install --upgrade --quiet langchain langchain-openai langchain-chroma beautifulsoup4

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

आइए नीचे दिए गए उदाहरणों के लिए उपयोग करने के लिए एक चैट मॉडल भी सेट करें।

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0.2)
```

## एक पुनर्प्राप्तकर्ता बनाना

हम [LangSmith प्रलेखन](https://docs.smith.langchain.com/overview) को स्रोत सामग्री के रूप में उपयोग करेंगे और बाद में पुनर्प्राप्ति के लिए सामग्री को एक वेक्टर स्टोर में संग्रहीत करेंगे। ध्यान दें कि इस उदाहरण में डेटा स्रोत को पार्स और संग्रहीत करने के विशिष्टों को नज़रअंदाज़ कर दिया जाएगा - आप [पुनर्प्राप्ति प्रणालियों को बनाने पर अधिक गहन प्रलेखन](/docs/use_cases/question_answering/) देख सकते हैं।

आइए एक दस्तावेज़ लोडर का उपयोग करके दस्तावेज़ों से पाठ खींचें:

```python
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://docs.smith.langchain.com/overview")
data = loader.load()
```

अगला, हम इसे छोटे-छोटे टुकड़ों में विभाजित करेंगे जिनका LLM का संदर्भ विंडो संभाल सकता है और उन्हें एक वेक्टर डेटाबेस में संग्रहीत करेंगे:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

फिर हम उन टुकड़ों को एम्बेड करके एक वेक्टर डेटाबेस में संग्रहीत करेंगे:

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
```

और अंत में, आइए हमारे पहले से ही प्रारंभ किए गए वेक्टर स्टोर से एक पुनर्प्राप्तकर्ता बनाएं:

```python
# k is the number of chunks to retrieve
retriever = vectorstore.as_retriever(k=4)

docs = retriever.invoke("Can LangSmith help test my LLM applications?")

docs
```

```output
[Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content="does that affect the output?\u200bSo you notice a bad output, and you go into LangSmith to see what's going on. You find the faulty LLM call and are now looking at the exact input. You want to try changing a word or a phrase to see what happens -- what do you do?We constantly ran into this issue. Initially, we copied the prompt to a playground of sorts. But this got annoying, so we built a playground of our own! When examining an LLM call, you can click the Open in Playground button to access this", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

हम देख सकते हैं कि उपरोक्त पुनर्प्राप्तकर्ता को कॉल करने से LangSmith दस्तावेज़ों के कुछ हिस्से मिलते हैं जो हमारे चैटबॉट को परीक्षण के बारे में जानकारी देने में मदद कर सकते हैं। और अब हमारे पास LangSmith दस्तावेज़ों से संबंधित डेटा को वापस लौटाने वाला एक पुनर्प्राप्तकर्ता है!

## दस्तावेज़ श्रृंखला

अब जब हमारे पास LangChain दस्तावेज़ों को वापस लौटाने वाला एक पुनर्प्राप्तकर्ता है, तो आइए एक ऐसी श्रृंखला बनाएं जो उन्हें संदर्भ के रूप में उपयोग कर सकती है और प्रश्नों का उत्तर दे सकती है। हम `create_stuff_documents_chain` हेल्पर फ़ंक्शन का उपयोग करेंगे जो इनपुट दस्तावेज़ों को प्रॉम्प्ट में "भर" देगा। यह दस्तावेज़ों को स्ट्रिंग के रूप में भी फ़ॉर्मैट करेगा।

एक चैट मॉडल के अलावा, फ़ंक्शन एक प्रॉम्प्ट भी अपेक्षित करता है जिसमें `context` चर होता है, साथ ही चैट इतिहास संदेशों के लिए `messages` नाम का स्थान होता है। हम एक उचित प्रॉम्प्ट बनाएंगे और नीचे दिखाए गए तरीके से उसे पास करेंगे:

```python
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

SYSTEM_TEMPLATE = """
Answer the user's questions based on the below context.
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
"""

question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            SYSTEM_TEMPLATE,
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

document_chain = create_stuff_documents_chain(chat, question_answering_prompt)
```

हम इस `document_chain` को अकेले बुला कर प्रश्नों का उत्तर दे सकते हैं। आइए उपर प्राप्त दस्तावेज़ों और समान प्रश्न `how can langsmith help with testing?` का उपयोग करें:

```python
from langchain_core.messages import HumanMessage

document_chain.invoke(
    {
        "context": docs,
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?")
        ],
    }
)
```

```output
'Yes, LangSmith can help test and evaluate your LLM applications. It simplifies the initial setup, and you can use it to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'
```

अच्छा लग रहा है! तुलना के लिए, हम बिना किसी संदर्भ दस्तावेज़ों के भी इसे आज़मा सकते हैं और परिणाम की तुलना कर सकते हैं:

```python
document_chain.invoke(
    {
        "context": [],
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?")
        ],
    }
)
```

```output
"I don't know about LangSmith's specific capabilities for testing LLM applications. It's best to reach out to LangSmith directly to inquire about their services and how they can assist with testing your LLM applications."
```

हम देख सकते हैं कि LLM कोई परिणाम नहीं देता।

## पुनर्प्राप्ति श्रृंखला

आइए इस दस्तावेज़ श्रृंखला को पुनर्प्राप्तकर्ता के साथ जोड़ें। यह इस तरह दिख सकता है:

```python
from typing import Dict

from langchain_core.runnables import RunnablePassthrough


def parse_retriever_input(params: Dict):
    return params["messages"][-1].content


retrieval_chain = RunnablePassthrough.assign(
    context=parse_retriever_input | retriever,
).assign(
    answer=document_chain,
)
```

दिए गए इनपुट संदेशों की सूची से, हम सूची में अंतिम संदेश के सामग्री को निकालते हैं और उसे पुनर्प्राप्तकर्ता को पास करते हैं ताकि कुछ दस्तावेज़ प्राप्त हो सकें। फिर, हम उन दस्तावेज़ों को संदर्भ के रूप में अपने दस्तावेज़ श्रृंखला को पास करते हैं ताकि एक अंतिम प्रतिक्रिया उत्पन्न हो सके।

इस श्रृंखला को कॉल करने से उपरोक्त दोनों चरण एकीकृत हो जाते हैं:

```python
retrieval_chain.invoke(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?")
        ],
    }
)
```

```output
{'messages': [HumanMessage(content='Can LangSmith help test my LLM applications?')],
 'context': [Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content="does that affect the output?\u200bSo you notice a bad output, and you go into LangSmith to see what's going on. You find the faulty LLM call and are now looking at the exact input. You want to try changing a word or a phrase to see what happens -- what do you do?We constantly ran into this issue. Initially, we copied the prompt to a playground of sorts. But this got annoying, so we built a playground of our own! When examining an LLM call, you can click the Open in Playground button to access this", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Yes, LangSmith can help test and evaluate your LLM applications. It simplifies the initial setup, and you can use it to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'}
```

अच्छा लग रहा है!

## क्वेरी रूपांतरण

हमारी पुनर्प्राप्ति श्रृंखला LangSmith के बारे में प्रश्नों का उत्तर देने में सक्षम है, लेकिन एक समस्या है - चैटबॉट उपयोगकर्ताओं के साथ वार्तालाप करते हैं, और इसलिए उन्हें फॉलोअप प्रश्नों का सामना करना पड़ता है।

वर्तमान रूप में श्रृंखला इससे निपटने में असमर्थ होगी। हमारे मूल प्रश्न के एक फॉलोअप प्रश्न पर विचार करें जैसे `Tell me more!`। यदि हम पुनर्प्राप्तकर्ता को सीधे इस क्वेरी के साथ कॉल करते हैं, तो हमें LLM अनुप्रयोग परीक्षण से अप्रासंगिक दस्तावेज़ मिलते हैं:

```python
retriever.invoke("Tell me more!")
```

```output
[Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='playground. Here, you can modify the prompt and re-run it to observe the resulting changes to the output - as many times as needed!Currently, this feature supports only OpenAI and Anthropic models and works for LLM and Chat Model calls. We plan to extend its functionality to more LLM types, chains, agents, and retrievers in the future.What is the exact sequence of events?\u200bIn complicated chains and agents, it can often be hard to understand what is going on under the hood. What calls are being', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='however, there is still no complete substitute for human review to get the utmost quality and reliability from your application.', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

यह इसलिए है क्योंकि पुनर्प्राप्तकर्ता में स्थिति का कोई अंतर्निहित अवधारणा नहीं है, और वह केवल दी गई क्वेरी के सबसे समान दस्तावेज़ खींचेगा। इसका समाधान करने के लिए, हम क्वेरी को एक स्वतंत्र क्वेरी में रूपांतरित कर सकते हैं जिसमें कोई बाहरी संदर्भ नहीं होता।

यहाँ एक उदाहरण है:

```python
from langchain_core.messages import AIMessage, HumanMessage

query_transform_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="messages"),
        (
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
        ),
    ]
)

query_transformation_chain = query_transform_prompt | chat

query_transformation_chain.invoke(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?"),
            AIMessage(
                content="Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
            ),
            HumanMessage(content="Tell me more!"),
        ],
    }
)
```

```output
AIMessage(content='"LangSmith LLM application testing and evaluation"')
```

शानदार! इस रूपांतरित क्वेरी से LLM अनुप्रयोग परीक्षण से संबंधित संदर्भ दस्तावेज़ प्राप्त होंगे।

आइए इसे हमारी पुनर्प्राप्ति श्रृंखला में जोड़ें। हम अपने पुनर्प्राप्तकर्ता को निम्नानुसार लपेट सकते हैं:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableBranch

query_transforming_retriever_chain = RunnableBranch(
    (
        lambda x: len(x.get("messages", [])) == 1,
        # If only one message, then we just pass that message's content to retriever
        (lambda x: x["messages"][-1].content) | retriever,
    ),
    # If messages, then we pass inputs to LLM chain to transform the query, then pass to retriever
    query_transform_prompt | chat | StrOutputParser() | retriever,
).with_config(run_name="chat_retriever_chain")
```

फिर, हम इस क्वेरी रूपांतरण श्रृंखला का उपयोग कर सकते हैं ताकि हमारी पुनर्प्राप्ति श्रृंखला ऐसे फॉलोअप प्रश्नों से बेहतर ढंग से निपट सके:

```python
SYSTEM_TEMPLATE = """
Answer the user's questions based on the below context.
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
"""

question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            SYSTEM_TEMPLATE,
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

conversational_retrieval_chain = RunnablePassthrough.assign(
    context=query_transforming_retriever_chain,
).assign(
    answer=document_chain,
)
```

शानदार! आइए इस नई श्रृंखला को पहले की तरह ही इनपुट के साथ कॉल करें:

```python
conversational_retrieval_chain.invoke(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?"),
        ]
    }
)
```

```output
{'messages': [HumanMessage(content='Can LangSmith help test my LLM applications?')],
 'context': [Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content="does that affect the output?\u200bSo you notice a bad output, and you go into LangSmith to see what's going on. You find the faulty LLM call and are now looking at the exact input. You want to try changing a word or a phrase to see what happens -- what do you do?We constantly ran into this issue. Initially, we copied the prompt to a playground of sorts. But this got annoying, so we built a playground of our own! When examining an LLM call, you can click the Open in Playground button to access this", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Yes, LangSmith can help test and evaluate LLM (Language Model) applications. It simplifies the initial setup, and you can use it to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'}
```

```python
conversational_retrieval_chain.invoke(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?"),
            AIMessage(
                content="Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
            ),
            HumanMessage(content="Tell me more!"),
        ],
    }
)
```

```output
{'messages': [HumanMessage(content='Can LangSmith help test my LLM applications?'),
  AIMessage(content='Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'),
  HumanMessage(content='Tell me more!')],
 'context': [Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='LangSmith makes it easy to manually review and annotate runs through annotation queues.These queues allow you to select any runs based on criteria like model type or automatic evaluation scores, and queue them up for human review. As a reviewer, you can then quickly step through the runs, viewing the input, output, and any existing tags before adding your own feedback.We often use this for a couple of reasons:To assess subjective qualities that automatic evaluators struggle with, like', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'LangSmith simplifies the initial setup for building reliable LLM applications, but it acknowledges that there is still work needed to bring the performance of prompts, chains, and agents up to the level where they are reliable enough to be used in production. It also provides the capability to manually review and annotate runs through annotation queues, allowing you to select runs based on criteria like model type or automatic evaluation scores for human review. This feature is particularly useful for assessing subjective qualities that automatic evaluators struggle with.'}
```

आप [इस LangSmith ट्रेस](https://smith.langchain.com/public/bb329a3b-e92a-4063-ad78-43f720fbb5a2/r) की जांच कर सकते हैं ताकि आप खुद देख सकें कि आंतरिक क्वेरी रूपांतरण चरण कैसा दिखता है।

## स्ट्रीमिंग

क्योंकि यह श्रृंखला LCEL के साथ बनाई गई है, आप इसके साथ परिचित तरीकों जैसे `.stream()` का उपयोग कर सकते हैं:

```python
stream = conversational_retrieval_chain.stream(
    {
        "messages": [
            HumanMessage(content="Can LangSmith help test my LLM applications?"),
            AIMessage(
                content="Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
            ),
            HumanMessage(content="Tell me more!"),
        ],
    }
)

for chunk in stream:
    print(chunk)
```

```output
{'messages': [HumanMessage(content='Can LangSmith help test my LLM applications?'), AIMessage(content='Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise.'), HumanMessage(content='Tell me more!')]}
{'context': [Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}), Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}), Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}), Document(page_content='LangSmith makes it easy to manually review and annotate runs through annotation queues.These queues allow you to select any runs based on criteria like model type or automatic evaluation scores, and queue them up for human review. As a reviewer, you can then quickly step through the runs, viewing the input, output, and any existing tags before adding your own feedback.We often use this for a couple of reasons:To assess subjective qualities that automatic evaluators struggle with, like', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]}
{'answer': ''}
{'answer': 'Lang'}
{'answer': 'Smith'}
{'answer': ' simpl'}
{'answer': 'ifies'}
{'answer': ' the'}
{'answer': ' initial'}
{'answer': ' setup'}
{'answer': ' for'}
{'answer': ' building'}
{'answer': ' reliable'}
{'answer': ' L'}
{'answer': 'LM'}
{'answer': ' applications'}
{'answer': '.'}
{'answer': ' It'}
{'answer': ' provides'}
{'answer': ' features'}
{'answer': ' for'}
{'answer': ' manually'}
{'answer': ' reviewing'}
{'answer': ' and'}
{'answer': ' annot'}
{'answer': 'ating'}
{'answer': ' runs'}
{'answer': ' through'}
{'answer': ' annotation'}
{'answer': ' queues'}
{'answer': ','}
{'answer': ' allowing'}
{'answer': ' you'}
{'answer': ' to'}
{'answer': ' select'}
{'answer': ' runs'}
{'answer': ' based'}
{'answer': ' on'}
{'answer': ' criteria'}
{'answer': ' like'}
{'answer': ' model'}
{'answer': ' type'}
{'answer': ' or'}
{'answer': ' automatic'}
{'answer': ' evaluation'}
{'answer': ' scores'}
{'answer': ','}
{'answer': ' and'}
{'answer': ' queue'}
{'answer': ' them'}
{'answer': ' up'}
{'answer': ' for'}
{'answer': ' human'}
{'answer': ' review'}
{'answer': '.'}
{'answer': ' As'}
{'answer': ' a'}
{'answer': ' reviewer'}
{'answer': ','}
{'answer': ' you'}
{'answer': ' can'}
{'answer': ' quickly'}
{'answer': ' step'}
{'answer': ' through'}
{'answer': ' the'}
{'answer': ' runs'}
{'answer': ','}
{'answer': ' view'}
{'answer': ' the'}
{'answer': ' input'}
{'answer': ','}
{'answer': ' output'}
{'answer': ','}
{'answer': ' and'}
{'answer': ' any'}
{'answer': ' existing'}
{'answer': ' tags'}
{'answer': ' before'}
{'answer': ' adding'}
{'answer': ' your'}
{'answer': ' own'}
{'answer': ' feedback'}
{'answer': '.'}
{'answer': ' This'}
{'answer': ' can'}
{'answer': ' be'}
{'answer': ' particularly'}
{'answer': ' useful'}
{'answer': ' for'}
{'answer': ' assessing'}
{'answer': ' subjective'}
{'answer': ' qualities'}
{'answer': ' that'}
{'answer': ' automatic'}
{'answer': ' evalu'}
{'answer': 'ators'}
{'answer': ' struggle'}
{'answer': ' with'}
{'answer': '.'}
{'answer': ''}
```

## और पढ़ने के लिए

यह गाइड पुनर्प्राप्ति तकनीकों का केवल सतही विवरण है। विभिन्न तरीकों के बारे में अधिक जानकारी के लिए जो डेटा को इंगेस्ट, तैयार और पुनर्प्राप्त करते हैं, [इस खंड](/docs/modules/data_connection/) में प्रलेखन देखें।
