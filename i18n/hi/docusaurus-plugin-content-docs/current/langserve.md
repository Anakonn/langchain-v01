---
fixed: true
translated: true
---

# 🦜️🏓 LangServe

[![Release Notes](https://img.shields.io/github/release/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/releases)
[![Downloads](https://static.pepy.tech/badge/langserve/month)](https://pepy.tech/project/langserve)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)

🚩 हम LangServe का एक होस्टेड संस्करण जारी करेंगे ताकि LangChain अनुप्रयोगों की एक-क्लिक परिनियोजन हो सके। [यहाँ साइन अप करें](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm)
वेटलिस्ट में जुड़ने के लिए।

## ओवरव्यू

[LangServe](https://github.com/langchain-ai/langserve) डेवलपर्स को
`LangChain` [रननबल्स और चेन](https://python.langchain.com/docs/expression_language/)
को एक REST API के रूप में परिनियोजित करने में मदद करता है।

यह लाइब्रेरी [FastAPI](https://fastapi.tiangolo.com/) के साथ एकीकृत है और
डेटा मान्यता के लिए [pydantic](https://docs.pydantic.dev/latest/) का उपयोग करती है।

इसके अतिरिक्त, यह एक क्लाइंट प्रदान करती है जिसे सर्वर पर परिनियोजित रननबल्स को कॉल करने के लिए उपयोग किया जा सकता है।
एक जावास्क्रिप्ट क्लाइंट उपलब्ध है
[LangChain.js](https://js.langchain.com/docs/ecosystem/langserve) में।

## विशेषताएँ

- आपके LangChain ऑब्जेक्ट से इनपुट और आउटपुट स्कीमाज़ स्वचालित रूप से निकाले जाते हैं, और
  हर API कॉल पर लागू किए जाते हैं, समृद्ध त्रुटि संदेशों के साथ
- JSONSchema और Swagger के साथ API डॉक्स पेज (उदाहरण लिंक डालें)
- कुशल `/invoke`, `/batch` और `/stream` एंडपॉइंट्स जो एकल सर्वर पर कई
  समवर्ती अनुरोधों का समर्थन करते हैं
- आपके चेन/एजेंट से सभी (या कुछ) मध्यवर्ती चरणों को स्ट्रीम करने के लिए `/stream_log` एंडपॉइंट
- 0.0.40 के नए संस्करण के रूप में, `/stream_events` का समर्थन करता है ताकि आउटपुट को पार्स किए बिना स्ट्रीम करना आसान हो सके।
- `/playground/` पर प्लेग्राउंड पेज जिसमें स्ट्रीमिंग आउटपुट और मध्यवर्ती चरण होते हैं
- [LangSmith](https://www.langchain.com/langsmith) के लिए अंतर्निहित (वैकल्पिक) ट्रेसिंग, बस
  अपना API कुंजी जोड़ें (देखें [निर्देश](https://docs.smith.langchain.com/))
- FastAPI, Pydantic, uvloop और asyncio जैसी युद्ध-परिक्षित ओपन-सोर्स पायथन लाइब्रेरियों के साथ निर्मित।
- क्लाइंट SDK का उपयोग करके LangServe सर्वर को इस तरह कॉल करें जैसे कि यह एक लोकेली रनिंग रननबल हो (या सीधे HTTP API को कॉल करें)
- [LangServe Hub](https://github.com/langchain-ai/langchain/blob/master/templates/README.md)

## सीमाएँ

- सर्वर पर उत्पन्न होने वाली घटनाओं के लिए क्लाइंट कॉलबैक अभी तक समर्थित नहीं हैं
- OpenAPI डॉक्स Pydantic V2 का उपयोग करने पर उत्पन्न नहीं होंगे। FastAPI [pydantic v1 और v2 नेमस्पेस को मिलाने](https://github.com/tiangolo/fastapi/issues/10360) का समर्थन नहीं करता है।
  अधिक विवरण के लिए नीचे दिया गया खंड देखें।

## होस्टेड LangServe

हम LangServe का एक होस्टेड संस्करण जारी करेंगे ताकि LangChain
अनुप्रयोगों की एक-क्लिक परिनियोजन हो सके। [यहाँ साइन अप करें](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm)
वेटलिस्ट में जुड़ने के लिए।

## सुरक्षा

- संस्करण 0.0.13 - 0.0.15 में भेद्यता -- प्लेग्राउंड एंडपॉइंट सर्वर पर मनमाने फ़ाइलों तक पहुँचने की अनुमति देता है।
  [0.0.16 में हल किया गया](https://github.com/langchain-ai/langserve/pull/98)।

## इंस्टॉलेशन

क्लाइंट और सर्वर दोनों के लिए:

```bash
pip install "langserve[all]"
```

या क्लाइंट कोड के लिए `pip install "langserve[client]"`,
और सर्वर कोड के लिए `pip install "langserve[server]"`।

## LangChain CLI 🛠️

`LangChain` CLI का उपयोग करके एक `LangServe` प्रोजेक्ट को जल्दी से बूटस्ट्रैप करें।

langchain CLI का उपयोग करने के लिए सुनिश्चित करें कि आपके पास `langchain-cli` का नवीनतम संस्करण इंस्टॉल है। आप इसे `pip install -U langchain-cli` का उपयोग करके इंस्टॉल कर सकते हैं।

## सेटअप

**नोट**: हम निर्भरता प्रबंधन के लिए `poetry` का उपयोग करते हैं। इसके बारे में अधिक जानने के लिए कृपया poetry [doc](https://python-poetry.org/docs/) का पालन करें।

### 1. langchain cli कमांड का उपयोग करके नया ऐप बनाएं

```sh
langchain app new my-app
```

### 2. add_routes में रननबल को परिभाषित करें। server.py पर जाएं और संपादित करें

```sh
add_routes(app. NotImplemented)
```

### 3. `poetry` का उपयोग करके 3rd पार्टी पैकेज जोड़ें (जैसे, langchain-openai, langchain-anthropic, langchain-mistral आदि)।

```sh
poetry add [package-name] // e.g `poetry add langchain-openai`
```

### 4. संबंधित env वेरिएबल सेट करें। उदाहरण के लिए,

```sh
export OPENAI_API_KEY="sk-..."
```

### 5. अपना ऐप सर्व करें

```sh
poetry run langchain serve --port=8100
```

## उदाहरण

[LangChain टेम्पलेट्स](https://github.com/langchain-ai/langchain/blob/master/templates/README.md) के साथ अपने LangServe इंस्टेंस को जल्दी से शुरू करें।

अधिक उदाहरणों के लिए, टेम्पलेट्स
[सूचकांक](https://github.com/langchain-ai/langchain/blob/master/templates/docs/INDEX.md)
या [उदाहरण](https://github.com/langchain-ai/langserve/tree/main/examples)
डायरेक्टरी देखें।

| विवरण                                                                                                                                                                                                                                                        | लिंक                                                                                                                                                                                                                               |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLMs** न्यूनतम उदाहरण जो OpenAI और Anthropic चैट मॉडल को आरक्षित करता है। असिंक्रोनस का उपयोग करता है, बैचिंग और स्ट्रीमिंग का समर्थन करता है।                                                                                                                                              | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/llm/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/blob/main/examples/llm/client.ipynb)                                                       |
| **Retriever** सरल सर्वर जो एक रिट्रीवर को रननबल के रूप में उजागर करता है।                                                                                                                                                                                                | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/client.ipynb)                                           |
| **Conversational Retriever** एक [Conversational Retriever](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) LangServe के माध्यम से उजागर किया गया                                                                           | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/client.ipynb) |
| **Agent** बिना **conversation history** के [OpenAI tools](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent) आधारित                                                                                                            | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/agent/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/agent/client.ipynb)                                                   |
| **Agent** **conversation history** के साथ [OpenAI tools](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent) आधारित                                                                                                               | [सर्वर](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/client.ipynb)                         |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history) जो बैकएंड पर चैट को बनाए रखता है, `session_id` द्वारा क्लाइंट द्वारा प्रदान किया गया।                                                                    | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/client.ipynb)                   |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history) जो बैकएंड पर चैट को बनाए रखता है, `conversation_id` द्वारा क्लाइंट द्वारा प्रदान किया गया, और `user_id` (देखें Auth `user_id` को सही तरीके से लागू करने के लिए)। | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/client.ipynb) |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure) एक रिट्रीवर बनाने के लिए जो इंडेक्स नाम के रन टाइम कॉन्फ़िगरेशन का समर्थन करता है।                                                                                      | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/client.ipynb)                 |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure) जो कॉन्फ़िगरेबल फील्ड्स और कॉन्फ़िगरेबल अल्टरनेटिव्स को दिखाता है।                                                                                                      | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/client.ipynb)                         |
| **APIHandler** दिखाता है कि `APIHandler` का उपयोग `add_routes` के बजाय कैसे करें। यह डेवलपर्स को एंडपॉइंट्स को परिभाषित करने के लिए अधिक लचीलापन प्रदान करता है। सभी FastAPI पैटर्न के साथ अच्छी तरह से काम करता है, लेकिन इसमें अधिक प्रयास लगता है।                                                        | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py)                                                                                                                               |
| **LCEL Example** उदाहरण जो LCEL का उपयोग करके एक डिक्शनरी इनपुट को बदलता है।                                                                                                                                                                                          | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/client.ipynb)                             |
| **Auth** `add_routes` के साथ: सरल प्रमाणीकरण जो ऐप से जुड़े सभी एंडपॉइंट्स पर लागू किया जा सकता है। (प्रति उपयोगकर्ता लॉजिक को लागू करने के लिए अपने आप में उपयोगी नहीं)।                                                                                           | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                                   |
| **Auth** `add_routes` के साथ: पथ निर्भरता पर आधारित सरल प्रमाणीकरण तंत्र। (प्रति उपयोगकर्ता लॉजिक को लागू करने के लिए अपने आप में उपयोगी नहीं)।                                                                                                                    | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                             |
| **Auth** `add_routes` के साथ: प्रति उपयोगकर्ता लॉजिक और प्रमाणीकरण को लागू करें जो प्रति अनुरोध कॉन्फ़िग मोडिफायर का उपयोग करने वाले एंडपॉइंट्स के लिए है। (**नोट**: वर्तमान में, OpenAPI डॉक्स के साथ एकीकृत नहीं होता है।)                                                                                 | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb)     |
| **Auth** `APIHandler` के साथ: प्रति उपयोगकर्ता लॉजिक और प्रमाणीकरण को लागू करें जो दिखाता है कि केवल उपयोगकर्ता के स्वामित्व वाले दस्तावेज़ों के भीतर कैसे खोज करें।                                                                                                                                           | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)                             |
| **Widgets** विभिन्न विजेट्स जो प्लेग्राउंड के साथ उपयोग किए जा सकते हैं (फ़ाइल अपलोड और चैट)                                                                                                                                                                              | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py)                                                                                                                                |
| **Widgets** फ़ाइल अपलोड विजेट जो LangServe प्लेग्राउंड के लिए उपयोग किया जाता है।                                                                                                                                                                                                      | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb)                               |

## नमूना एप्लिकेशन

### सर्वर

यहाँ एक सर्वर है जो एक OpenAI चैट मॉडल, एक Anthropic चैट मॉडल, और एक चेन को परिनियोजित करता है
जो
Anthropic मॉडल का उपयोग करके किसी विषय पर एक चुटकुला बताता है।

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatAnthropic", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.anthropic.ChatAnthropic.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatOpenAI", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.openai.ChatOpenAI.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
#!/usr/bin/env python
from fastapi import FastAPI
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatAnthropic, ChatOpenAI
from langserve import add_routes

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using Langchain's Runnable interfaces",
)

add_routes(
    app,
    ChatOpenAI(),
    path="/openai",
)

add_routes(
    app,
    ChatAnthropic(),
    path="/anthropic",
)

model = ChatAnthropic()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
add_routes(
    app,
    prompt | model,
    path="/joke",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
```

यदि आप अपने ब्राउज़र से अपने एंडपॉइंट को कॉल करने का इरादा रखते हैं, तो आपको CORS हेडर्स सेट करने की भी आवश्यकता होगी।
आप इसके लिए FastAPI के अंतर्निहित मिडलवेयर का उपयोग कर सकते हैं:

```python
from fastapi.middleware.cors import CORSMiddleware

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

### डॉक्स

यदि आपने ऊपर सर्वर परिनियोजित किया है, तो आप उत्पन्न OpenAPI डॉक्स देख सकते हैं:

> ⚠️ यदि pydantic v2 का उपयोग कर रहे हैं, तो _invoke_, _batch_, _stream_,
> _stream_log_ के लिए डॉक्स उत्पन्न नहीं होंगे। अधिक विवरण के लिए [Pydantic](#pydantic) खंड देखें।

```sh
curl localhost:8000/docs
```

सुनिश्चित करें कि **/docs** प्रत्यय जोड़ें।

> ⚠️ इंडेक्स पेज `/` डिज़ाइन द्वारा परिभाषित नहीं है, इसलिए `curl localhost:8000` या URL पर जाकर
> 404 लौटाएगा। यदि आप `/` पर सामग्री चाहते हैं तो एक एंडपॉइंट `@app.get("/")` परिभाषित करें।

### क्लाइंट

Python SDK

```python
<!--IMPORTS:[{"imported": "SystemMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "HumanMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "RunnableMap", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableMap.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->

from langchain.schema import SystemMessage, HumanMessage
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableMap
from langserve import RemoteRunnable

openai = RemoteRunnable("http://localhost:8000/openai/")
anthropic = RemoteRunnable("http://localhost:8000/anthropic/")
joke_chain = RemoteRunnable("http://localhost:8000/joke/")

joke_chain.invoke({"topic": "parrots"})

# or async
await joke_chain.ainvoke({"topic": "parrots"})

prompt = [
    SystemMessage(content='Act like either a cat or a parrot.'),
    HumanMessage(content='Hello!')
]

# Supports astream
async for msg in anthropic.astream(prompt):
    print(msg, end="", flush=True)

prompt = ChatPromptTemplate.from_messages(
    [("system", "Tell me a long story about {topic}")]
)

# Can define custom chains
chain = prompt | RunnableMap({
    "openai": openai,
    "anthropic": anthropic,
})

chain.batch([{"topic": "parrots"}, {"topic": "cats"}])
```

TypeScript में (LangChain.js संस्करण 0.0.166 या बाद का आवश्यक है):

```typescript
import { RemoteRunnable } from "@langchain/core/runnables/remote";

const chain = new RemoteRunnable({
  url: `http://localhost:8000/joke/`,
});
const result = await chain.invoke({
  topic: "cats",
});
```

Python `requests` का उपयोग करते हुए:

```python
import requests

response = requests.post(
    "http://localhost:8000/joke/invoke",
    json={'input': {'topic': 'cats'}}
)
response.json()
```

आप `curl` का उपयोग भी कर सकते हैं:

```sh
curl --location --request POST 'http://localhost:8000/joke/invoke' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "input": {
            "topic": "cats"
        }
    }'
```

## एंडपॉइंट्स

निम्नलिखित कोड:

```python
...
add_routes(
    app,
    runnable,
    path="/my_runnable",
)
```

इन एंडपॉइंट्स को सर्वर में जोड़ता है:

- `POST /my_runnable/invoke` - एकल इनपुट पर runnable को invoke करें
- `POST /my_runnable/batch` - इनपुट्स के बैच पर runnable को invoke करें
- `POST /my_runnable/stream` - एकल इनपुट पर invoke करें और आउटपुट को stream करें
- `POST /my_runnable/stream_log` - एकल इनपुट पर invoke करें और आउटपुट को stream करें, 
  मध्यवर्ती चरणों के आउटपुट सहित जैसा कि यह उत्पन्न होता है
- `POST /my_runnable/astream_events` - एकल इनपुट पर invoke करें और इवेंट्स को stream करें जैसा कि वे उत्पन्न होते हैं,
  मध्यवर्ती चरणों से भी।
- `GET /my_runnable/input_schema` - runnable के इनपुट के लिए json schema
- `GET /my_runnable/output_schema` - runnable के आउटपुट के लिए json schema
- `GET /my_runnable/config_schema` - runnable के कॉन्फ़िग के लिए json schema

ये एंडपॉइंट्स [LangChain Expression Language इंटरफ़ेस](https://python.langchain.com/docs/expression_language/interface) से मेल खाते हैं --
अधिक विवरण के लिए कृपया इस दस्तावेज़ को संदर्भित करें।

## प्लेग्राउंड

आप अपने runnable के लिए प्लेग्राउंड पृष्ठ `/my_runnable/playground/` पर पा सकते हैं। यह एक सरल UI को उजागर करता है
[runnable को कॉन्फ़िगर करें](https://python.langchain.com/docs/expression_language/how_to/configure)
और स्ट्रीमिंग आउटपुट और मध्यवर्ती चरणों के साथ runnable को invoke करें।

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/5ca56e29-f1bb-40f4-84b5-15916384a276" width="50%"/>
</p>

### विजेट्स

प्लेग्राउंड [widgets](#playground-widgets) का समर्थन करता है और इसका उपयोग विभिन्न इनपुट्स के साथ अपने runnable का परीक्षण करने के लिए किया जा सकता है। नीचे दिए गए [widgets](#widgets) अनुभाग में अधिक विवरण देखें।

### साझा करना

इसके अतिरिक्त, कॉन्फ़िगर करने योग्य runnables के लिए, प्लेग्राउंड आपको runnable को कॉन्फ़िगर करने और कॉन्फ़िगरेशन के साथ एक लिंक साझा करने की अनुमति देगा:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/86ce9c59-f8e4-4d08-9fa3-62030e0f521d" width="50%"/>
</p>

## चैट प्लेग्राउंड

LangServe एक चैट-केंद्रित प्लेग्राउंड का भी समर्थन करता है जिसे `/my_runnable/playground/` के तहत उपयोग में लाया जा सकता है।
सामान्य प्लेग्राउंड के विपरीत, केवल कुछ प्रकार के runnables समर्थित होते हैं - runnable की इनपुट schema एक `dict` होनी चाहिए जिसमें या तो:

- एकल कुंजी हो, और उस कुंजी का मान चैट संदेशों की एक सूची हो।
- दो कुंजियाँ हो, जिनमें से एक का मान संदेशों की एक सूची हो, और दूसरी सबसे हाल के संदेश का प्रतिनिधित्व करे।

हम अनुशंसा करते हैं कि आप पहले प्रारूप का उपयोग करें।

runnable को या तो `AIMessage` या एक स्ट्रिंग लौटानी चाहिए।

इसे सक्षम करने के लिए, आपको अपने रूट को जोड़ते समय `playground_type="chat",` सेट करना होगा। यहाँ एक उदाहरण है:

```python
# Declare a chain
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful, professional assistant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class InputChat(BaseModel):
    """Input for the chat endpoint."""

    messages: List[Union[HumanMessage, AIMessage, SystemMessage]] = Field(
        ...,
        description="The chat messages representing the current conversation.",
    )


add_routes(
    app,
    chain.with_types(input_type=InputChat),
    enable_feedback_endpoint=True,
    enable_public_trace_link_endpoint=True,
    playground_type="chat",
)
```

यदि आप LangSmith का उपयोग कर रहे हैं, तो आप अपने रूट पर `enable_feedback_endpoint=True` सेट कर सकते हैं जिससे प्रत्येक संदेश के बाद थंब्स-अप/थंब्स-डाउन बटन सक्षम हो जाएँ, और `enable_public_trace_link_endpoint=True` सेट कर सकते हैं जिससे एक बटन जो रन के लिए सार्वजनिक ट्रेस बनाता है। ध्यान दें कि आपको निम्नलिखित पर्यावरण वेरिएबल्स को भी सेट करना होगा:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_PROJECT="YOUR_PROJECT_NAME"
export LANGCHAIN_API_KEY="YOUR_API_KEY"
```

उपरोक्त दो विकल्पों के साथ एक उदाहरण यहाँ है:

<p align="center">
<img src="./.github/img/chat_playground.png" width="50%"/>
</p>

नोट: यदि आप सार्वजनिक ट्रेस लिंक सक्षम करते हैं, तो आपकी श्रृंखला की आंतरिक जानकारी उजागर हो जाएगी। हम केवल डेमो या परीक्षण के लिए इस सेटिंग का उपयोग करने की सलाह देते हैं।

## पुरानी श्रृंखलाएँ

LangServe Runnables (निर्मित
[LangChain Expression Language](https://python.langchain.com/docs/expression_language/) के माध्यम से)
और पुरानी श्रृंखलाओं (जो `Chain` से विरासत में मिली हैं) के साथ काम करता है।
हालांकि, पुरानी श्रृंखलाओं के कुछ इनपुट schemas अधूरे/गलत हो सकते हैं,
जिससे त्रुटियाँ उत्पन्न हो सकती हैं।
इसको LangChain में उन श्रृंखलाओं की `input_schema` प्रॉपर्टी को अपडेट करके ठीक किया जा सकता है।
यदि आपको कोई त्रुटि मिलती है, तो कृपया इस रिपॉजिटरी में एक issue खोलें, और हम इसे हल करने का प्रयास करेंगे।

## परिनियोजन

### AWS पर परिनियोजित करें

आप [AWS Copilot CLI](https://aws.github.io/copilot-cli/) का उपयोग करके AWS पर परिनियोजित कर सकते हैं

```bash
copilot init --app [application-name] --name [service-name] --type 'Load Balanced Web Service' --dockerfile './Dockerfile' --deploy
```

अधिक जानने के लिए [यहाँ क्लिक करें](https://aws.amazon.com/containers/copilot/)।

### Azure पर परिनियोजित करें

आप Azure कंटेनर एप्स (Serverless) का उपयोग करके Azure पर परिनियोजित कर सकते हैं:

```shell
az containerapp up --name [container-app-name] --source . --resource-group [resource-group-name] --environment  [environment-name] --ingress external --target-port 8001 --env-vars=OPENAI_API_KEY=your_key
```

अधिक जानकारी [यहाँ पाएं](https://learn.microsoft.com/en-us/azure/container-apps/containerapp-up)

### GCP पर परिनियोजित करें

आप निम्नलिखित कमांड का उपयोग करके GCP Cloud Run पर परिनियोजित कर सकते हैं:

```shell
gcloud run deploy [your-service-name] --source . --port 8001 --allow-unauthenticated --region us-central1 --set-env-vars=OPENAI_API_KEY=your_key
```

### सामुदायिक योगदान

#### Railway पर परिनियोजित करें

[उदाहरण Railway रिपॉ](https://github.com/PaulLockett/LangServe-Railway/tree/main)

[![Railway पर परिनियोजित करें](https://railway.app/button.svg)](https://railway.app/template/pW9tXP?referralCode=c-aq4K)

## Pydantic

LangServe कुछ सीमाओं के साथ Pydantic 2 का समर्थन प्रदान करता है।

1. Pydantic V2 का उपयोग करते समय invoke/batch/stream/stream_log के लिए OpenAPI दस्तावेज़ उत्पन्न नहीं होंगे। Fast API [pydantic v1 और v2 नामस्थान को मिलाने] का समर्थन नहीं करता है।
2. LangChain Pydantic v2 में v1 नामस्थान का उपयोग करता है। कृपया LangChain के साथ संगतता सुनिश्चित करने के लिए [निम्नलिखित दिशानिर्देशों](https://github.com/langchain-ai/langchain/discussions/9337) को पढ़ें।

इन सीमाओं को छोड़कर, हमें उम्मीद है कि API एंडपॉइंट्स, प्लेग्राउंड और कोई अन्य सुविधाएँ अपेक्षित रूप से काम करेंगी।

## उन्नत

### प्रमाणीकरण संभालना

यदि आपको अपने सर्वर में प्रमाणीकरण जोड़ने की आवश्यकता है, तो कृपया Fast API के [निर्भरता](https://fastapi.tiangolo.com/tutorial/dependencies/)
और [सुरक्षा](https://fastapi.tiangolo.com/tutorial/security/) के बारे में दस्तावेज़ पढ़ें।

नीचे दिए गए उदाहरण दिखाते हैं कि FastAPI प्राइमिटिव का उपयोग करके LangServe एंडपॉइंट्स के साथ प्रमाणीकरण लॉजिक को कैसे वायर अप करें।

आप वास्तविक प्रमाणीकरण लॉजिक, उपयोगकर्ताओं की तालिका आदि प्रदान करने के लिए जिम्मेदार हैं।

यदि आप सुनिश्चित नहीं हैं कि आप क्या कर रहे हैं, तो आप एक मौजूदा समाधान [Auth0](https://auth0.com/) का उपयोग करने का प्रयास कर सकते हैं।

#### add_routes का उपयोग करना

यदि आप `add_routes` का उपयोग कर रहे हैं, तो 
उदाहरण [यहाँ देखें](https://github.com/langchain-ai/langserve/tree/main/examples/auth)।

| विवरण                                                                                                                                                                       | लिंक                                                                                                                                                                                                                          |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Auth** `add_routes` के साथ: सरल प्रमाणीकरण जो ऐप से संबंधित सभी एंडपॉइंट्स पर लागू किया जा सकता है। (प्रति उपयोगकर्ता लॉजिक लागू करने के लिए स्वयं उपयोगी नहीं।)                                 | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                              |
| **Auth** `add_routes` के साथ: पाथ निर्भरता के आधार पर सरल प्रमाणीकरण तंत्र। (प्रति उपयोगकर्ता लॉजिक लागू करने के लिए स्वयं उपयोगी नहीं।)                                       | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                         |
| **Auth** `add_routes` के साथ: प्रति उपयोगकर्ता लॉजिक और एंडपॉइंट्स के लिए प्रमाणीकरण लागू करें जो प्रति अनुरोध कॉन्फ़िग मॉडिफायर का उपयोग करते हैं। (**नोट**: वर्तमान में, OpenAPI दस्तावेज़ के साथ एकीकृत नहीं होता।) | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb) |

वैकल्पिक रूप से, आप FastAPI के [middleware](https://fastapi.tiangolo.com/tutorial/middleware/) का उपयोग कर सकते हैं।

वैश्विक निर्भरता और पाथ निर्भरता का उपयोग करने का लाभ यह है कि प्रमाणीकरण OpenAPI दस्तावेज़ पृष्ठ में सही समर्थन करेगा, लेकिन ये प्रति उपयोगकर्ता लॉजिक को लागू करने के लिए पर्याप्त नहीं हैं (जैसे, एक ऐसा एप्लिकेशन जो केवल उपयोगकर्ता द्वारा स्वामित्व वाले दस्तावेज़ों के भीतर खोज सकता है)।

यदि आपको प्रति उपयोगकर्ता लॉजिक लागू करने की आवश्यकता है, तो आप `per_req_config_modifier` या `APIHandler` (नीचे) का उपयोग करके इस लॉजिक को लागू कर सकते हैं।

**प्रति उपयोगकर्ता**

यदि आपको प्रमाणीकरण या लॉजिक की आवश्यकता है जो उपयोगकर्ता पर निर्भर है,
`add_routes` का उपयोग करते समय `per_req_config_modifier` निर्दिष्ट करें। एक callable का उपयोग करें जो कच्ची `Request` वस्तु प्राप्त करता है और प्रमाणीकरण और
प्राधिकरण उद्देश्यों के लिए प्रासंगिक जानकारी निकाल सकता है।

#### APIHandler का उपयोग करना

यदि आप FastAPI और पायथन के साथ सहज महसूस करते हैं, तो आप LangServe के [APIHandler](https://github.com/langchain-ai/langserve/blob/main/examples/api_handler_examples/server.py) का उपयोग कर सकते हैं।

| विवरण                                                                                                                                                                                                 | लिंक                                                                                                                                                                                                           |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** `APIHandler` के साथ: प्रति उपयोगकर्ता लॉजिक और प्रमाणीकरण लागू करें जो केवल उपयोगकर्ता द्वारा स्वामित्व वाले दस्तावेज़ों के भीतर खोज करने के तरीके को दिखाता है।                                                                                   | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)         |
| **APIHandler** दिखाता है कि `APIHandler` का उपयोग `add_routes` के बजाय कैसे करें। यह डेवलपर्स को एंडपॉइंट्स को परिभाषित करने के लिए अधिक लचीलापन प्रदान करता है। सभी FastAPI पैटर्न के साथ अच्छी तरह से काम करता है, लेकिन इसमें थोड़ा अधिक प्रयास लगता है। | [सर्वर](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py), [क्लाइंट](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/client.ipynb) |

यह थोड़ा अधिक काम है, लेकिन आपको एंडपॉइंट परिभाषाओं पर पूर्ण नियंत्रण देता है, ताकि आप प्रमाणीकरण के लिए जो भी कस्टम लॉजिक चाहिए उसे कर सकें।

### फाइलें

LLM एप्लिकेशन अक्सर फाइलों से निपटते हैं। फाइल प्रोसेसिंग को लागू करने के लिए विभिन्न आर्किटेक्चर बनाए जा सकते हैं; उच्च स्तर पर:

1. फाइल को समर्पित एंडपॉइंट के माध्यम से सर्वर पर अपलोड किया जा सकता है और एक अलग एंडपॉइंट का उपयोग करके प्रोसेस किया जा सकता है
2. फाइल को या तो मान (फाइल के बाइट्स) या संदर्भ (जैसे, s3 url से फाइल सामग्री) द्वारा अपलोड किया जा सकता है
3. प्रोसेसिंग एंडपॉइंट ब्लॉकिंग या नॉन-ब्लॉकिंग हो सकता है
4. यदि महत्वपूर्ण प्रोसेसिंग की आवश्यकता होती है, तो प्रोसेसिंग को समर्पित प्रोसेस पूल को ऑफलोड किया जा सकता है

आपको यह निर्धारित करना चाहिए कि आपके एप्लिकेशन के लिए उपयुक्त आर्किटेक्चर क्या है।

वर्तमान में, किसी रननेबल में मान द्वारा फाइल अपलोड करने के लिए, फाइल के लिए base64 एन्कोडिंग का उपयोग करें (`multipart/form-data` अभी तक समर्थित नहीं है)।

यहाँ एक [उदाहरण](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing) है जो दिखाता है कि किसी दूरस्थ रननेबल को फाइल भेजने के लिए base64 एन्कोडिंग का उपयोग कैसे करें।

याद रखें, आप हमेशा संदर्भ (जैसे, s3 url) द्वारा फाइल अपलोड कर सकते हैं या उन्हें एक समर्पित एंडपॉइंट पर `multipart/form-data` के रूप में अपलोड कर सकते हैं।

### कस्टम इनपुट और आउटपुट प्रकार

इनपुट और आउटपुट प्रकार सभी रननेबल्स पर परिभाषित होते हैं।

आप `input_schema` और `output_schema` प्रॉपर्टीज़ के माध्यम से इन्हें एक्सेस कर सकते हैं।

`LangServe` इन प्रकारों का उपयोग सत्यापन और दस्तावेजीकरण के लिए करता है।

यदि आप डिफ़ॉल्ट अनुमानित प्रकारों को ओवरराइड करना चाहते हैं, तो आप `with_types` मेथड का उपयोग कर सकते हैं।

यहाँ एक खिलौना उदाहरण है जो इस विचार को स्पष्ट करता है:

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from typing import Any

from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

app = FastAPI()


def func(x: Any) -> int:
    """Mistyped function that should accept an int but accepts anything."""
    return x + 1


runnable = RunnableLambda(func).with_types(
    input_type=int,
)

add_routes(app, runnable)
```

### कस्टम यूज़र प्रकार

यदि आप डेटा को डिक्ट प्रतिनिधित्व के बजाय एक pydantic मॉडल में डि-सीरियलाइज़ करना चाहते हैं तो `CustomUserType` से इनहेरिट करें।

फिलहाल, यह प्रकार केवल _सर्वर_ साइड पर काम करता है और वांछित _डिकोडिंग_ व्यवहार को निर्दिष्ट करने के लिए उपयोग किया जाता है। यदि इस प्रकार से इनहेरिट किया जाता है तो सर्वर डिकोडेड प्रकार को pydantic मॉडल के रूप में रखेगा बजाय इसके कि इसे एक डिक्ट में बदल दे।

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

from langserve import add_routes
from langserve.schema import CustomUserType

app = FastAPI()


class Foo(CustomUserType):
    bar: int


def func(foo: Foo) -> int:
    """Sample function that expects a Foo type which is a pydantic model"""
    assert isinstance(foo, Foo)
    return foo.bar


# Note that the input and output type are automatically inferred!
# You do not need to specify them.
# runnable = RunnableLambda(func).with_types( # <-- Not needed in this case
#     input_type=Foo,
#     output_type=int,
#
add_routes(app, RunnableLambda(func), path="/foo")
```

### प्लेग्राउंड विजेट्स

प्लेग्राउंड आपको बैकएंड से अपने रननेबल के लिए कस्टम विजेट्स परिभाषित करने की अनुमति देता है।

यहाँ कुछ उदाहरण हैं:

| विवरण                                                                           | लिंक                                                                                                                                                                                                 |
| :------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **विजेट्स** प्लेग्राउंड (फाइल अपलोड और चैट) के साथ उपयोग किए जाने वाले विभिन्न विजेट्स | [server](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/client.ipynb)     |
| **विजेट्स** LangServe प्लेग्राउंड के लिए उपयोग किया गया फाइल अपलोड विजेट।                         | [server](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb) |

#### स्कीमा

- एक विजेट को फील्ड स्तर पर निर्दिष्ट किया जाता है और इनपुट प्रकार की JSON स्कीमा का हिस्सा के रूप में भेजा जाता है
- एक विजेट में एक कुंजी होनी चाहिए जिसे `type` कहा जाता है और इसका मान ज्ञात विजेट्स की सूची में से एक होना चाहिए
- अन्य विजेट कुंजियाँ उन मानों के साथ संबद्ध होंगी जो JSON ऑब्जेक्ट में पाथ्स का वर्णन करती हैं

```typescript
type JsonPath = number | string | (number | string)[];
type NameSpacedPath = { title: string; path: JsonPath }; // Using title to mimick json schema, but can use namespace
type OneOfPath = { oneOf: JsonPath[] };

type Widget = {
  type: string; // Some well known type (e.g., base64file, chat etc.)
  [key: string]: JsonPath | NameSpacedPath | OneOfPath;
};
```

### उपलब्ध विजेट्स

अभी केवल दो विजेट्स हैं जिन्हें यूज़र मैन्युअली निर्दिष्ट कर सकता है:

1. फाइल अपलोड विजेट
2. चैट हिस्ट्री विजेट

इन विजेट्स के बारे में अधिक जानकारी नीचे देखें।

प्लेग्राउंड UI पर सभी अन्य विजेट्स स्वचालित रूप से UI द्वारा रननेबल की कॉन्फिग स्कीमा के आधार पर बनाए और प्रबंधित किए जाते हैं। जब आप कॉन्फिगर करने योग्य रननेबल्स बनाते हैं, तो प्लेग्राउंड आपके लिए उपयुक्त विजेट्स बनाने चाहिए ताकि आप व्यवहार को नियंत्रित कर सकें।

#### फाइल अपलोड विजेट

प्लेग्राउंड UI में फाइल अपलोड इनपुट बनाने की अनुमति देता है जो फाइलों को base64 एन्कोडेड स्ट्रिंग्स के रूप में अपलोड करता है। यहाँ पूरा [उदाहरण](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing) है।

स्निपेट:

```python
try:
    from pydantic.v1 import Field
except ImportError:
    from pydantic import Field

from langserve import CustomUserType


# ATTENTION: Inherit from CustomUserType instead of BaseModel otherwise
#            the server will decode it into a dict instead of a pydantic model.
class FileProcessingRequest(CustomUserType):
    """Request including a base64 encoded file."""

    # The extra field is used to specify a widget for the playground UI.
    file: str = Field(..., extra={"widget": {"type": "base64file"}})
    num_chars: int = 100

```

उदाहरण विजेट:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/52199e46-9464-4c2e-8be8-222250e08c3f" width="50%"/>
</p>

### चैट विजेट

देखें [विजेट उदाहरण](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py)।

चैट विजेट को परिभाषित करने के लिए, सुनिश्चित करें कि आप "type": "chat" पास करते हैं।

- "input" JSONPath है _Request_ में उस फील्ड के लिए जिसमें नया इनपुट संदेश है।
- "output" JSONPath है _Response_ में उस फील्ड के लिए जिसमें नया आउटपुट संदेश(एं) हैं।
- इन फील्ड्स को निर्दिष्ट न करें यदि संपूर्ण इनपुट या आउटपुट का उपयोग उसी रूप में किया जाना चाहिए जैसे वे हैं (जैसे, यदि आउटपुट एक चैट संदेशों की सूची है।)

यहाँ एक स्निपेट है:

```python
class ChatHistory(CustomUserType):
    chat_history: List[Tuple[str, str]] = Field(
        ...,
        examples=[[("human input", "ai response")]],
        extra={"widget": {"type": "chat", "input": "question", "output": "answer"}},
    )
    question: str


def _format_to_messages(input: ChatHistory) -> List[BaseMessage]:
    """Format the input to a list of messages."""
    history = input.chat_history
    user_input = input.question

    messages = []

    for human, ai in history:
        messages.append(HumanMessage(content=human))
        messages.append(AIMessage(content=ai))
    messages.append(HumanMessage(content=user_input))
    return messages


model = ChatOpenAI()
chat_model = RunnableParallel({"answer": (RunnableLambda(_format_to_messages) | model)})
add_routes(
    app,
    chat_model.with_types(input_type=ChatHistory),
    config_keys=["configurable"],
    path="/chat",
)
```

उदाहरण विजेट:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/a71ff37b-a6a9-4857-a376-cf27c41d3ca4" width="50%"/>
</p>

आप एक पैरामीटर के रूप में सीधे संदेशों की एक सूची भी निर्दिष्ट कर सकते हैं, जैसा कि इस स्निपेट में दिखाया गया है:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assisstant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class MessageListInput(BaseModel):
    """Input for the chat endpoint."""
    messages: List[Union[HumanMessage, AIMessage]] = Field(
        ...,
        description="The chat messages representing the current conversation.",
        extra={"widget": {"type": "chat", "input": "messages"}},
    )


add_routes(
    app,
    chain.with_types(input_type=MessageListInput),
    path="/chat",
)
```

उदाहरण के लिए [इस सैंपल फाइल](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/message_list/server.py) को देखें।

### एंडपॉइंट्स को सक्षम / अक्षम करना (LangServe >=0.0.33)

आप यह सक्षम / अक्षम कर सकते हैं कि कौन से एंडपॉइंट्स एक दिए गए चेन के लिए रूट्स जोड़ते समय उजागर किए जाते हैं।

यदि आप यह सुनिश्चित करना चाहते हैं कि langserve को नए संस्करण में अपग्रेड करते समय आपको कभी नया एंडपॉइंट न मिले, तो `enabled_endpoints` का उपयोग करें।

सक्षम: नीचे दिया गया कोड केवल `invoke`, `batch` और संबंधित `config_hash` एंडपॉइंट वेरिएंट्स को सक्षम करेगा।

```python
add_routes(app, chain, enabled_endpoints=["invoke", "batch", "config_hashes"], path="/mychain")
```

अक्षम: नीचे दिया गया कोड चेन के लिए प्लेग्राउंड को अक्षम करेगा

```python
add_routes(app, chain, disabled_endpoints=["playground"], path="/mychain")
```
