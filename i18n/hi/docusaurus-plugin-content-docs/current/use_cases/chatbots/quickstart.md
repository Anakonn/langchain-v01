---
sidebar_position: 0
translated: true
---

# त्वरित शुरुआत

[![](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/chatbots.ipynb)

## अवलोकन

हम एक उदाहरण पर जाएंगे कि कैसे एक एलएलएम-संचालित चैटबॉट को डिज़ाइन और कार्यान्वित किया जाए। यहाँ कुछ उच्च-स्तरीय घटक हैं जिनके साथ हम काम करेंगे:

- `Chat Models`। चैटबॉट इंटरफ़ेस संदेशों के इर्द-गिर्द आधारित है न कि कच्चे टेक्स्ट पर, और इसलिए यह टेक्स्ट एलएलएम की बजाय चैट मॉडलों के लिए सबसे उपयुक्त है। चैट मॉडल इंटीग्रेशन की सूची के लिए [यहाँ देखें](/docs/integrations/chat) और लैंगचेन में चैट मॉडल इंटरफेस पर दस्तावेज़ के लिए [यहाँ देखें](/docs/modules/model_io/chat)। आप चैटबॉट के लिए `LLMs` (देखें [यहाँ](/docs/modules/model_io/llms)) का भी उपयोग कर सकते हैं, लेकिन चैट मॉडल में एक अधिक संवादात्मक स्वर होता है और वे स्वाभाविक रूप से एक संदेश इंटरफ़ेस का समर्थन करते हैं।
- `Prompt Templates`, जो डिफ़ॉल्ट संदेशों, उपयोगकर्ता इनपुट, चैट इतिहास और (वैकल्पिक रूप से) अतिरिक्त पुनः प्राप्त संदर्भों को संयोजित करने वाले संकेतों को एकत्र करने की प्रक्रिया को सरल बनाते हैं।
- `Chat History`, जो एक चैटबॉट को पिछले इंटरैक्शन को "याद" करने और अनुवर्ती प्रश्नों का उत्तर देते समय उन्हें ध्यान में रखने की अनुमति देता है। अधिक जानकारी के लिए [यहाँ देखें](/docs/modules/memory/chat_messages/)।
- `Retrievers` (वैकल्पिक), जो उपयोगी होते हैं यदि आप एक ऐसा चैटबॉट बनाना चाहते हैं जो डोमेन-विशिष्ट, अद्यतन ज्ञान का उपयोग करके अपनी प्रतिक्रियाओं को बढ़ा सके। पुनर्प्राप्ति प्रणालियों पर गहन दस्तावेज़ के लिए [यहाँ देखें](/docs/modules/data_connection/retrievers)।

हम एक शक्तिशाली संवादात्मक चैटबॉट बनाने के लिए उपरोक्त घटकों को एक साथ कैसे फिट करें, इस पर चर्चा करेंगे।

## त्वरित शुरुआत

शुरू करने के लिए, चलिए कुछ निर्भरताएँ स्थापित करते हैं और आवश्यक क्रेडेंशियल्स सेट करते हैं:

```python
%pip install --upgrade --quiet langchain langchain-openai langchain-chroma

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

आइए चैट मॉडल को इनिशियलाइज़ करें जो चैटबॉट के मस्तिष्क के रूप में कार्य करेगा:

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0.2)
```

यदि हम अपने चैट मॉडल को बुलाते हैं, तो आउटपुट एक `AIMessage` होता है:

```python
from langchain_core.messages import HumanMessage

chat.invoke(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'adore programmer.")
```

मॉडल अपने आप में किसी भी राज्य की अवधारणा नहीं रखता है। उदाहरण के लिए, यदि आप अनुवर्ती प्रश्न पूछते हैं:

```python
chat.invoke([HumanMessage(content="What did you just say?")])
```

```output
AIMessage(content='I said, "What did you just say?"')
```

हम देख सकते हैं कि यह पिछले वार्तालाप को संदर्भ में नहीं लेता है, और प्रश्न का उत्तर नहीं दे सकता।

इससे बचने के लिए, हमें पूरी बातचीत का इतिहास मॉडल में पास करने की आवश्यकता है। देखें कि जब हम ऐसा करते हैं तो क्या होता है:

```python
from langchain_core.messages import AIMessage

chat.invoke(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        ),
        AIMessage(content="J'adore la programmation."),
        HumanMessage(content="What did you just say?"),
    ]
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

और अब हम देख सकते हैं कि हमें एक अच्छा उत्तर मिला है!

यह एक चैटबॉट की संवादात्मक तरीके से बातचीत करने की क्षमता की बुनियादी अवधारणा है।

## संकेत टेम्पलेट्स

फॉर्मेटिंग को थोड़ा आसान बनाने के लिए आइए एक संकेत टेम्पलेट को परिभाषित करें। हम इसे मॉडल में पाइप करके एक श्रृंखला बना सकते हैं:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat
```

उपरोक्त `MessagesPlaceholder` चैट संदेशों को श्रृंखला के इनपुट के रूप में `chat_history` के रूप में सीधे संकेत में सम्मिलित करता है। फिर, हम श्रृंखला को इस तरह बुला सकते हैं:

```python
chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

## संदेश इतिहास

चैट इतिहास को प्रबंधित करने के लिए एक शॉर्टकट के रूप में, हम एक [`MessageHistory`](/docs/modules/memory/chat_messages/) क्लास का उपयोग कर सकते हैं, जो चैट संदेशों को सहेजने और लोड करने के लिए जिम्मेदार है। कई अंतर्निर्मित संदेश इतिहास इंटीग्रेशन हैं जो संदेशों को विभिन्न डेटाबेस में सहेजते हैं, लेकिन इस त्वरित शुरुआत के लिए हम एक इन-मेमोरी, डेमो संदेश इतिहास का उपयोग करेंगे जिसे `ChatMessageHistory` कहा जाता है।

इसे सीधे उपयोग करने का एक उदाहरण यहाँ है:

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("hi!")

demo_ephemeral_chat_history.add_ai_message("whats up?")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

एक बार जब हम ऐसा कर लेते हैं, तो हम संग्रहीत संदेशों को सीधे हमारे श्रृंखला में एक पैरामीटर के रूप में पास कर सकते हैं:

```python
demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

response = chain.invoke({"messages": demo_ephemeral_chat_history.messages})

response
```

```output
AIMessage(content='The translation of "I love programming" in French is "J\'adore la programmation."')
```

```python
demo_ephemeral_chat_history.add_ai_message(response)

demo_ephemeral_chat_history.add_user_message("What did you just say?")

chain.invoke({"messages": demo_ephemeral_chat_history.messages})
```

```output
AIMessage(content='I said "J\'adore la programmation," which is the French translation for "I love programming."')
```

और अब हमारे पास एक बुनियादी चैटबॉट है!

जबकि यह श्रृंखला मॉडल के आंतरिक ज्ञान के साथ अपने आप में एक उपयोगी चैटबॉट के रूप में कार्य कर सकती है, यह अक्सर हमारे चैटबॉट को अधिक केंद्रित बनाने के लिए डोमेन-विशिष्ट ज्ञान पर `retrieval-augmented generation`, या संक्षेप में RAG, का कुछ रूप पेश करना उपयोगी होता है। हम इसे अगले कवर करेंगे।

## पुनर्प्राप्ति

हम अपने चैटबॉट के लिए डोमेन-विशिष्ट ज्ञान प्राप्त करने के लिए एक [`Retriever`](/docs/modules/data_connection/retrievers/) सेट अप और उपयोग कर सकते हैं। इसे दिखाने के लिए, चलिए ऊपर बनाए गए साधारण चैटबॉट का विस्तार करते हैं ताकि यह लैंगस्मिथ के बारे में प्रश्नों का उत्तर दे सके।

हम [लैंगस्मिथ दस्तावेज़ीकरण](https://docs.smith.langchain.com/overview) को स्रोत सामग्री के रूप में उपयोग करेंगे और इसे बाद में पुनर्प्राप्ति के लिए एक वेक्टरस्टोर में संग्रहीत करेंगे। ध्यान दें कि यह उदाहरण डेटा स्रोत को पार्सिंग और स्टोरिंग के आसपास के कुछ विशेषताओं को छोड़ देगा - आप [पुनर्प्राप्ति प्रणालियों को बनाने पर गहन दस्तावेज़ यहाँ देख सकते हैं](/docs/use_cases/question_answering/)।

चलिए अपने पुनर्प्राप्ति को सेट करते हैं। पहले, कुछ आवश्यक निर्भरताएँ स्थापित करें:

```python
%pip install --upgrade --quiet langchain-chroma beautifulsoup4
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

अगला, हम एक दस्तावेज़ लोडर का उपयोग करके वेबपेज से डेटा खींचेंगे:

```python
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://docs.smith.langchain.com/overview")
data = loader.load()
```

अगला, हम इसे छोटे टुकड़ों में विभाजित करेंगे जिन्हें LLM का संदर्भ विंडो संभाल सकता है और इसे एक वेक्टर डेटाबेस में संग्रहीत करेंगे:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

फिर हम उन टुकड़ों को एम्बेड और एक वेक्टर डेटाबेस में संग्रहीत करेंगे:

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
```

और अंत में, चलिए हमारे इनिशियलाइज़्ड वेक्टरस्टोर से एक पुनर्प्राप्ति बनाएँ:

```python
# k is the number of chunks to retrieve
retriever = vectorstore.as_retriever(k=4)

docs = retriever.invoke("how can langsmith help with testing?")

docs
```

```output
[Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

हम देख सकते हैं कि ऊपर दिया गया पुनर्प्राप्ति लैंगस्मिथ दस्तावेज़ के कुछ हिस्सों को लौटा रहा है जिसमें हमारे चैटबॉट के प्रश्नों का उत्तर देने के लिए परीक्षण के बारे में जानकारी है।

### दस्तावेज़ों को संभालना

चलो अपने पिछले संकेत को दस्तावेज़ों को संदर्भ के रूप में स्वीकार करने के लिए संशोधित करते हैं। हम एक [`create_stuff_documents_chain`](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html#langchain.chains.combine_documents.stuff.create_stuff_documents_chain) हेल्पर फ़ंक्शन का उपयोग करेंगे जो सभी इनपुट दस्तावेज़ों को संकेत में "भर" देगा, जो कि फॉर्मेटिंग को संभालने के लिए भी सुविधाजनक है। हम [`ChatPromptTemplate.from_messages`](/docs/modules/model_io/prompts/quick_start#chatprompttemplate) विधि का उपयोग करेंगे ताकि हम मॉडल को पास करने के लिए संदेश इनपुट को फॉर्मेट कर सकें, जिसमें एक [`MessagesPlaceholder`](/docs/modules/model_io/prompts/quick_start#messagesplaceholder) शामिल होगा जहाँ चैट इतिहास संदेश सीधे इंजेक्ट किए जाएंगे:

```python
from langchain.chains.combine_documents import create_stuff_documents_chain

chat = ChatOpenAI(model="gpt-3.5-turbo-1106")

question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user's questions based on the below context:\n\n{context}",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

document_chain = create_stuff_documents_chain(chat, question_answering_prompt)
```

हम ऊपर पुनर्प्राप्त किए गए कच्चे दस्तावेज़ों के साथ इस `document_chain` को बुला सकते हैं:

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("how can langsmith help with testing?")

document_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
        "context": docs,
    }
)
```

```output
'LangSmith can assist with testing by providing the capability to quickly edit examples and add them to datasets. This allows for the expansion of evaluation sets or fine-tuning of a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in the application.'
```

बहुत बढ़िया! हम इनपुट दस्तावेज़ों में जानकारी से संकलित एक उत्तर देख सकते हैं।

### एक पुनर्प्राप्ति श्रृंखला बनाना

अगला, चलिए अपने पुनर्प्राप्ति को श्रृंखला में इंटीग्रेट करते हैं। हमारा पुनर्प्राप्ति उपयोगकर्ता से पास किए गए अंतिम संदेश से प्रासंगिक जानकारी पुनर्प्राप्त करेगा, इसलिए हम इसे निकालते हैं और प्रासंगिक दस्तावेज़ों को पुनर्प्राप्त करने के लिए इनपुट के रूप में उपयोग करते हैं, जिन्हें हम वर्तमान श्रृंखला में `context` के रूप में जोड़ते हैं। हम `context` और पिछले `messages` को अपने दस्तावेज़ श्रृंखला में अंतिम उत्तर उत्पन्न करने के लिए पास करते हैं।

हम प्रत्येक कॉल पर मध्यवर्ती चरणों को पास करने के लिए [`RunnablePassthrough.assign()`](/docs/expression_language/primitives/assign) विधि का भी उपयोग करते हैं। यह इस प्रकार दिखता है:

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

```python
response = retrieval_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

response
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?')],
 'context': [Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'LangSmith can help with testing in several ways:\n\n1. Dataset Expansion: LangSmith enables quick editing of examples and adding them to datasets, which expands the surface area of evaluation sets. This allows for more comprehensive testing of models and applications.\n\n2. Fine-Tuning Models: LangSmith facilitates the fine-tuning of models for improved quality or reduced costs. This is beneficial for optimizing the performance of models during testing.\n\n3. Monitoring: LangSmith can be used to monitor applications, log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise during testing. This monitoring helps in ensuring the reliability and performance of the application during testing phases.\n\nOverall, LangSmith helps in making testing more rigorous and comprehensive, whether by expanding datasets, fine-tuning models, or monitoring application performance.'}
```

```python
demo_ephemeral_chat_history.add_ai_message(response["answer"])

demo_ephemeral_chat_history.add_user_message("tell me more about that!")

retrieval_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    },
)
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith can help with testing in several ways:\n\n1. Dataset Expansion: LangSmith enables quick editing of examples and adding them to datasets, which expands the surface area of evaluation sets. This allows for more comprehensive testing of models and applications.\n\n2. Fine-Tuning Models: LangSmith facilitates the fine-tuning of models for improved quality or reduced costs. This is beneficial for optimizing the performance of models during testing.\n\n3. Monitoring: LangSmith can be used to monitor applications, log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise during testing. This monitoring helps in ensuring the reliability and performance of the application during testing phases.\n\nOverall, LangSmith helps in making testing more rigorous and comprehensive, whether by expanding datasets, fine-tuning models, or monitoring application performance.'),
  HumanMessage(content='tell me more about that!')],
 'context': [Document(page_content='however, there is still no complete substitute for human review to get the utmost quality and reliability from your application.', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content="against these known issues.Why is this so impactful? When building LLM applications, it’s often common to start without a dataset of any kind. This is part of the power of LLMs! They are amazing zero-shot learners, making it possible to get started as easily as possible. But this can also be a curse -- as you adjust the prompt, you're wandering blind. You don’t have any examples to benchmark your changes against.LangSmith addresses this problem by including an “Add to Dataset” button for each", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='playground. Here, you can modify the prompt and re-run it to observe the resulting changes to the output - as many times as needed!Currently, this feature supports only OpenAI and Anthropic models and works for LLM and Chat Model calls. We plan to extend its functionality to more LLM types, chains, agents, and retrievers in the future.What is the exact sequence of events?\u200bIn complicated chains and agents, it can often be hard to understand what is going on under the hood. What calls are being', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Certainly! LangSmith offers the following capabilities to aid in testing:\n\n1. Dataset Expansion: By allowing quick editing of examples and adding them to datasets, LangSmith enables the expansion of evaluation sets. This is crucial for thorough testing of models and applications, as it broadens the range of scenarios and inputs that can be used to assess performance.\n\n2. Fine-Tuning Models: LangSmith supports the fine-tuning of models to enhance their quality and reduce operational costs. This capability is valuable during testing as it enables the optimization of model performance based on specific testing requirements and objectives.\n\n3. Monitoring: LangSmith provides monitoring features that allow for the logging of traces, visualization of latency and token usage statistics, and troubleshooting of issues as they occur during testing. This real-time monitoring helps in identifying and addressing any issues that may impact the reliability and performance of the application during testing.\n\nBy leveraging these features, LangSmith enhances the testing process by enabling comprehensive dataset expansion, model fine-tuning, and real-time monitoring to ensure the quality and reliability of applications and models.'}
```

अच्छा! अब हमारा चैटबॉट डोमेन-विशिष्ट प्रश्नों का संवादात्मक तरीके से उत्तर दे सकता है।

एक ओर, यदि आप सभी मध्यवर्ती चरणों को वापस नहीं करना चाहते हैं, तो आप अंतिम `.assign()` कॉल की बजाय दस्तावेज़ श्रृंखला में सीधे पाइप का उपयोग करके अपनी पुनर्प्राप्ति श्रृंखला को इस प्रकार परिभाषित कर सकते हैं:

```python
retrieval_chain_with_only_answer = (
    RunnablePassthrough.assign(
        context=parse_retriever_input | retriever,
    )
    | document_chain
)

retrieval_chain_with_only_answer.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    },
)
```

```output
"LangSmith offers the capability to quickly edit examples and add them to datasets, thereby enhancing the scope of evaluation sets. This feature is particularly valuable for testing as it allows for a more thorough assessment of model performance and application behavior.\n\nFurthermore, LangSmith enables the fine-tuning of models to enhance quality and reduce costs, which can significantly impact testing outcomes. By adjusting and refining models, developers can ensure that they are thoroughly tested and optimized for various scenarios and use cases.\n\nAdditionally, LangSmith provides monitoring functionality, allowing users to log traces, visualize latency and token usage statistics, and troubleshoot specific issues as they encounter them during testing. This real-time monitoring and troubleshooting capability contribute to the overall effectiveness and reliability of the testing process.\n\nIn essence, LangSmith's features are designed to improve the quality and reliability of testing by expanding evaluation sets, fine-tuning models, and providing comprehensive monitoring capabilities. These aspects collectively contribute to a more robust and thorough testing process for applications and models."
```

## प्रश्न परिवर्तन

यहाँ एक और ऑप्टिमाइज़ेशन है जिसे हम कवर करेंगे - ऊपर के उदाहरण में, जब हमने एक अनुवर्ती प्रश्न पूछा, `इसके बारे में और बताओ!`, तो आपको यह ध्यान में आ सकता है कि पुनर्प्राप्त दस्तावेज़ सीधे परीक्षण के बारे में जानकारी शामिल नहीं करते हैं। ऐसा इसलिए है क्योंकि हम पुनर्प्राप्ति को एक क्वेरी के रूप में `इसके बारे में और बताओ!` को शब्दशः पास कर रहे हैं। पुनर्प्राप्ति श्रृंखला का आउटपुट अभी भी ठीक है क्योंकि दस्तावेज़ श्रृंखला पुनर्प्राप्ति श्रृंखला चैट इतिहास के आधार पर उत्तर उत्पन्न कर सकती है, लेकिन हम अधिक समृद्ध और सूचनात्मक दस्तावेज़ पुनर्प्राप्त कर सकते थे:

```python
retriever.invoke("how can langsmith help with testing?")
```

```output
[Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

```python
retriever.invoke("tell me more about that!")
```

```output
[Document(page_content='however, there is still no complete substitute for human review to get the utmost quality and reliability from your application.', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content="against these known issues.Why is this so impactful? When building LLM applications, it’s often common to start without a dataset of any kind. This is part of the power of LLMs! They are amazing zero-shot learners, making it possible to get started as easily as possible. But this can also be a curse -- as you adjust the prompt, you're wandering blind. You don’t have any examples to benchmark your changes against.LangSmith addresses this problem by including an “Add to Dataset” button for each", metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
 Document(page_content='playground. Here, you can modify the prompt and re-run it to observe the resulting changes to the output - as many times as needed!Currently, this feature supports only OpenAI and Anthropic models and works for LLM and Chat Model calls. We plan to extend its functionality to more LLM types, chains, agents, and retrievers in the future.What is the exact sequence of events?\u200bIn complicated chains and agents, it can often be hard to understand what is going on under the hood. What calls are being', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})]
```

इस सामान्य समस्या से बचने के लिए, चलिए एक `query transformation` चरण जोड़ते हैं जो इनपुट से संदर्भों को हटा देता है। हम अपने पुराने पुनर्प्राप्ति को इस प्रकार रैप करेंगे:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableBranch

# We need a prompt that we can pass into an LLM to generate a transformed search query

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0.2)

query_transform_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="messages"),
        (
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
        ),
    ]
)

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

अब हम इस नए `query_transforming_retriever_chain` के साथ अपनी पिछली श्रृंखला को पुनः बनाएँ। ध्यान दें कि यह नई श्रृंखला इनपुट के रूप में एक डिक्ट स्वीकार करती है और पुनर्प्राप्ति को पास करने के लिए एक स्ट्रिंग को पार्स करती है, इसलिए हमें शीर्ष स्तर पर अतिरिक्त पार्सिंग करने की आवश्यकता नहीं है:

```python
document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

conversational_retrieval_chain = RunnablePassthrough.assign(
    context=query_transforming_retriever_chain,
).assign(
    answer=document_chain,
)

demo_ephemeral_chat_history = ChatMessageHistory()
```

और अंत में, इसे बुलाते हैं!

```python
demo_ephemeral_chat_history.add_user_message("how can langsmith help with testing?")

response = conversational_retrieval_chain.invoke(
    {"messages": demo_ephemeral_chat_history.messages},
)

demo_ephemeral_chat_history.add_ai_message(response["answer"])

response
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith can assist with testing in several ways. It allows you to quickly edit examples and add them to datasets, expanding the range of evaluation sets. This can help in fine-tuning a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in your application. Furthermore, it enables monitoring of your application by logging all traces, visualizing latency and token usage statistics, and troubleshooting specific issues as they arise.')],
 'context': [Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='have been building and using LangSmith with the goal of bridging this gap. This is our tactical user guide to outline effective ways to use LangSmith and maximize its benefits.On by default\u200bAt LangChain, all of us have LangSmith’s tracing running in the background by default. On the Python side, this is achieved by setting environment variables, which we establish whenever we launch a virtual environment or open our bash shell and leave them set. The same principle applies to most JavaScript', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'LangSmith can assist with testing in several ways. It allows you to quickly edit examples and add them to datasets, expanding the range of evaluation sets. This can help in fine-tuning a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in your application. Furthermore, it enables monitoring of your application by logging all traces, visualizing latency and token usage statistics, and troubleshooting specific issues as they arise.'}
```

```python
demo_ephemeral_chat_history.add_user_message("tell me more about that!")

conversational_retrieval_chain.invoke(
    {"messages": demo_ephemeral_chat_history.messages}
)
```

```output
{'messages': [HumanMessage(content='how can langsmith help with testing?'),
  AIMessage(content='LangSmith can assist with testing in several ways. It allows you to quickly edit examples and add them to datasets, expanding the range of evaluation sets. This can help in fine-tuning a model for improved quality or reduced costs. Additionally, LangSmith simplifies the construction of small datasets by hand, providing a convenient way to rigorously test changes in your application. Furthermore, it enables monitoring of your application by logging all traces, visualizing latency and token usage statistics, and troubleshooting specific issues as they arise.'),
  HumanMessage(content='tell me more about that!')],
 'context': [Document(page_content='LangSmith Overview and User Guide | 🦜️🛠️ LangSmith', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='You can also quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs.Monitoring\u200bAfter all this, your app might finally ready to go in production. LangSmith can also be used to monitor your application in much the same way that you used for debugging. You can log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. Each run can also be', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='Skip to main content🦜️🛠️ LangSmith DocsPython DocsJS/TS DocsSearchGo to AppLangSmithOverviewTracingTesting & EvaluationOrganizationsHubLangSmith CookbookOverviewOn this pageLangSmith Overview and User GuideBuilding reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.Over the past two months, we at LangChain', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'}),
  Document(page_content='inputs, and see what happens. At some point though, our application is performing\nwell and we want to be more rigorous about testing changes. We can use a dataset\nthat we’ve constructed along the way (see above). Alternatively, we could spend some\ntime constructing a small dataset by hand. For these situations, LangSmith simplifies', metadata={'description': 'Building reliable LLM applications can be challenging. LangChain simplifies the initial setup, but there is still work needed to bring the performance of prompts, chains and agents up the level where they are reliable enough to be used in production.', 'language': 'en', 'source': 'https://docs.smith.langchain.com/overview', 'title': 'LangSmith Overview and User Guide | 🦜️🛠️ LangSmith'})],
 'answer': 'Certainly! LangSmith simplifies the process of constructing and editing datasets, which is essential for testing and fine-tuning models. By quickly editing examples and adding them to datasets, you can expand the surface area of your evaluation sets, leading to improved model quality and potentially reduced costs. Additionally, LangSmith provides monitoring capabilities for your application, allowing you to log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise. This comprehensive monitoring functionality helps ensure the reliability and performance of your application in production.'}
```

आपको यह समझने में मदद करने के लिए कि आंतरिक रूप से क्या हो रहा है, [यह लैंगस्मिथ ट्रेस](https://smith.langchain.com/public/42f8993b-7d19-42d3-990a-6608a73c5824/r) पहले कॉल को दिखाता है। आप देख सकते हैं कि उपयोगकर्ता की प्रारंभिक क्वेरी को सीधे पुनर्प्राप्ति को पास किया गया है, जो उपयुक्त दस्तावेज़ लौटाता है।

अनुवर्ती प्रश्न के लिए कॉल, [इस लैंगस्मिथ ट्रेस द्वारा चित्रित](https://smith.langchain.com/public/7b463791-868b-42bd-8035-17b471e9c7cd/r) उपयोगकर्ता के प्रारंभिक प्रश्न को लैंगस्मिथ के साथ परीक्षण के लिए अधिक प्रासंगिक कुछ में पुन: वाक्यांशित करता है, जिसके परिणामस्वरूप उच्च गुणवत्ता वाले दस्तावेज़ होते हैं।

और अब हमारे पास एक चैटबॉट है जो संवादात्मक पुनर्प्राप्ति में सक्षम है!

## अगले कदम

अब आप जानते हैं कि कैसे एक संवादात्मक चैटबॉट बनाना है जो पिछले संदेशों और डोमेन-विशिष्ट ज्ञान को अपनी जेनरेशन में एकीकृत कर सकता है। इसके चारों ओर आप कई अन्य अनुकूलन कर सकते हैं - अधिक जानकारी के लिए निम्नलिखित पृष्ठ देखें:

- [Memory management](/docs/use_cases/chatbots/memory_management): इसमें चैट इतिहास को स्वचालित रूप से अपडेट करने के साथ-साथ लंबी बातचीत को ट्रिम, सारांशित या अन्यथा संशोधित करने के लिए एक गाइड शामिल है ताकि आपका बॉट केंद्रित रहे।
- [Retrieval](/docs/use_cases/chatbots/retrieval): आपके चैटबॉट के साथ विभिन्न प्रकार की पुनर्प्राप्ति का उपयोग करने पर एक गहन अवलोकन
- [Tool usage](/docs/use_cases/chatbots/tool_usage): यह कैसे आपके चैटबॉट्स को अन्य API और सिस्टम के साथ इंटरैक्ट करने वाले टूल का उपयोग करने की अनुमति देता है।
