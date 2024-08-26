---
sidebar_position: 1
title: रनेबल इंटरफ़ेस
translated: true
---

कस्टम श्रृंखलाओं को बनाना सबसे आसान बनाने के लिए, हमने एक ["रनेबल"](https://api.python.langchain.com/en/stable/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable) प्रोटोकॉल लागू किया है। कई LangChain घटक `रनेबल` प्रोटोकॉल को लागू करते हैं, जिनमें चैट मॉडल, LLM, आउटपुट पार्सर, रिट्रीवर, प्रॉम्प्ट टेम्पलेट और अधिक शामिल हैं। कार्य करने के लिए कुछ उपयोगी प्राथमिकताएं भी हैं [इस खंड में](/docs/expression_language/primitives) पढ़ें।

यह एक मानक इंटरफ़ेस है, जो कस्टम श्रृंखलाओं को परिभाषित करना और उन्हें एक मानक तरीके से कॉल करना आसान बनाता है।
मानक इंटरफ़ेस में शामिल हैं:

- [`stream`](#stream): प्रतिक्रिया के टुकड़ों को स्ट्रीम करें
- [`invoke`](#invoke): इनपुट पर श्रृंखला को कॉल करें
- [`batch`](#batch): इनपुट की एक सूची पर श्रृंखला को कॉल करें

इनके साथ-साथ समानांतर विधियां भी हैं जिन्हें [asyncio](https://docs.python.org/3/library/asyncio.html) `await` वाक्यविन्यास के साथ उपयोग किया जाना चाहिए:

- [`astream`](#async-stream): प्रतिक्रिया के टुकड़ों को असिंक्रोनस रूप से स्ट्रीम करें
- [`ainvoke`](#async-invoke): इनपुट पर श्रृंखला को असिंक्रोनस रूप से कॉल करें
- [`abatch`](#async-batch): इनपुट की एक सूची पर श्रृंखला को असिंक्रोनस रूप से कॉल करें
- [`astream_log`](#async-stream-intermediate-steps): अंतिम प्रतिक्रिया के अलावा, मध्यवर्ती चरणों को भी स्ट्रीम करें जैसे-जैसे वे होते हैं
- [`astream_events`](#async-stream-events): **बीटा** श्रृंखला में जैसे-जैसे घटनाएं होती हैं, उन्हें स्ट्रीम करें (`langchain-core` 0.1.14 में पेश किया गया)

**इनपुट प्रकार** और **आउटपुट प्रकार** घटक के अनुसार भिन्न होते हैं:

| घटक | इनपुट प्रकार | आउटपुट प्रकार |
| --- | --- | --- |
| प्रॉम्प्ट | डिक्शनरी | PromptValue |
| ChatModel | एकल स्ट्रिंग, चैट संदेशों की सूची या PromptValue | ChatMessage |
| LLM | एकल स्ट्रिंग, चैट संदेशों की सूची या PromptValue | स्ट्रिंग |
| OutputParser | LLM या ChatModel का आउटपुट | पार्सर के अनुसार निर्भर करता है |
| Retriever | एकल स्ट्रिंग | दस्तावेजों की सूची |
| Tool | एकल स्ट्रिंग या डिक्शनरी, उपकरण के अनुसार | उपकरण के अनुसार निर्भर करता है |

सभी रनेबल इनपुट और आउटपुट **स्कीमा** को देखने के लिए एक्सपोज़ करते हैं:
- [`input_schema`](#input-schema): रनेबल की संरचना से स्वचालित रूप से उत्पन्न एक इनपुट Pydantic मॉडल
- [`output_schema`](#output-schema): रनेबल की संरचना से स्वचालित रूप से उत्पन्न एक आउटपुट Pydantic मॉडल

इन विधियों पर एक नज़र डालते हैं। ऐसा करने के लिए, हम एक बहुत ही सरल PromptTemplate + ChatModel श्रृंखला बनाएंगे।

```python
%pip install --upgrade --quiet  langchain-core langchain-community langchain-openai
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
chain = prompt | model
```

## इनपुट स्कीमा

किसी भी रनेबल द्वारा स्वीकार किए जाने वाले इनपुट का वर्णन।
यह रनेबल की संरचना से स्वचालित रूप से उत्पन्न एक Pydantic मॉडल है।
आप इसे `.schema()` कॉल करके एक JSONSchema प्रतिनिधित्व प्राप्त कर सकते हैं।

```python
# The input schema of the chain is the input schema of its first part, the prompt.
chain.input_schema.schema()
```

```output
{'title': 'PromptInput',
 'type': 'object',
 'properties': {'topic': {'title': 'Topic', 'type': 'string'}}}
```

```python
prompt.input_schema.schema()
```

```output
{'title': 'PromptInput',
 'type': 'object',
 'properties': {'topic': {'title': 'Topic', 'type': 'string'}}}
```

```python
model.input_schema.schema()
```

```output
{'title': 'ChatOpenAIInput',
 'anyOf': [{'type': 'string'},
  {'$ref': '#/definitions/StringPromptValue'},
  {'$ref': '#/definitions/ChatPromptValueConcrete'},
  {'type': 'array',
   'items': {'anyOf': [{'$ref': '#/definitions/AIMessage'},
     {'$ref': '#/definitions/HumanMessage'},
     {'$ref': '#/definitions/ChatMessage'},
     {'$ref': '#/definitions/SystemMessage'},
     {'$ref': '#/definitions/FunctionMessage'},
     {'$ref': '#/definitions/ToolMessage'}]}}],
 'definitions': {'StringPromptValue': {'title': 'StringPromptValue',
   'description': 'String prompt value.',
   'type': 'object',
   'properties': {'text': {'title': 'Text', 'type': 'string'},
    'type': {'title': 'Type',
     'default': 'StringPromptValue',
     'enum': ['StringPromptValue'],
     'type': 'string'}},
   'required': ['text']},
  'AIMessage': {'title': 'AIMessage',
   'description': 'A Message from an AI.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'ai',
     'enum': ['ai'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'HumanMessage': {'title': 'HumanMessage',
   'description': 'A Message from a human.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'human',
     'enum': ['human'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'ChatMessage': {'title': 'ChatMessage',
   'description': 'A Message that can be assigned an arbitrary speaker (i.e. role).',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'chat',
     'enum': ['chat'],
     'type': 'string'},
    'role': {'title': 'Role', 'type': 'string'}},
   'required': ['content', 'role']},
  'SystemMessage': {'title': 'SystemMessage',
   'description': 'A Message for priming AI behavior, usually passed in as the first of a sequence\nof input messages.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'system',
     'enum': ['system'],
     'type': 'string'}},
   'required': ['content']},
  'FunctionMessage': {'title': 'FunctionMessage',
   'description': 'A Message for passing the result of executing a function back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'function',
     'enum': ['function'],
     'type': 'string'},
    'name': {'title': 'Name', 'type': 'string'}},
   'required': ['content', 'name']},
  'ToolMessage': {'title': 'ToolMessage',
   'description': 'A Message for passing the result of executing a tool back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'tool',
     'enum': ['tool'],
     'type': 'string'},
    'tool_call_id': {'title': 'Tool Call Id', 'type': 'string'}},
   'required': ['content', 'tool_call_id']},
  'ChatPromptValueConcrete': {'title': 'ChatPromptValueConcrete',
   'description': 'Chat prompt value which explicitly lists out the message types it accepts.\nFor use in external schemas.',
   'type': 'object',
   'properties': {'messages': {'title': 'Messages',
     'type': 'array',
     'items': {'anyOf': [{'$ref': '#/definitions/AIMessage'},
       {'$ref': '#/definitions/HumanMessage'},
       {'$ref': '#/definitions/ChatMessage'},
       {'$ref': '#/definitions/SystemMessage'},
       {'$ref': '#/definitions/FunctionMessage'},
       {'$ref': '#/definitions/ToolMessage'}]}},
    'type': {'title': 'Type',
     'default': 'ChatPromptValueConcrete',
     'enum': ['ChatPromptValueConcrete'],
     'type': 'string'}},
   'required': ['messages']}}}
```

## आउटपुट स्कीमा

किसी भी रनेबल द्वारा उत्पन्न आउटपुट का वर्णन।
यह रनेबल की संरचना से स्वचालित रूप से उत्पन्न एक Pydantic मॉडल है।
आप इसे `.schema()` कॉल करके एक JSONSchema प्रतिनिधित्व प्राप्त कर सकते हैं।

```python
# The output schema of the chain is the output schema of its last part, in this case a ChatModel, which outputs a ChatMessage
chain.output_schema.schema()
```

```output
{'title': 'ChatOpenAIOutput',
 'anyOf': [{'$ref': '#/definitions/AIMessage'},
  {'$ref': '#/definitions/HumanMessage'},
  {'$ref': '#/definitions/ChatMessage'},
  {'$ref': '#/definitions/SystemMessage'},
  {'$ref': '#/definitions/FunctionMessage'},
  {'$ref': '#/definitions/ToolMessage'}],
 'definitions': {'AIMessage': {'title': 'AIMessage',
   'description': 'A Message from an AI.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'ai',
     'enum': ['ai'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'HumanMessage': {'title': 'HumanMessage',
   'description': 'A Message from a human.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'human',
     'enum': ['human'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'ChatMessage': {'title': 'ChatMessage',
   'description': 'A Message that can be assigned an arbitrary speaker (i.e. role).',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'chat',
     'enum': ['chat'],
     'type': 'string'},
    'role': {'title': 'Role', 'type': 'string'}},
   'required': ['content', 'role']},
  'SystemMessage': {'title': 'SystemMessage',
   'description': 'A Message for priming AI behavior, usually passed in as the first of a sequence\nof input messages.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'system',
     'enum': ['system'],
     'type': 'string'}},
   'required': ['content']},
  'FunctionMessage': {'title': 'FunctionMessage',
   'description': 'A Message for passing the result of executing a function back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'function',
     'enum': ['function'],
     'type': 'string'},
    'name': {'title': 'Name', 'type': 'string'}},
   'required': ['content', 'name']},
  'ToolMessage': {'title': 'ToolMessage',
   'description': 'A Message for passing the result of executing a tool back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'tool',
     'enum': ['tool'],
     'type': 'string'},
    'tool_call_id': {'title': 'Tool Call Id', 'type': 'string'}},
   'required': ['content', 'tool_call_id']}}}
```

## स्ट्रीम

```python
for s in chain.stream({"topic": "bears"}):
    print(s.content, end="", flush=True)
```

```output
Sure, here's a bear-themed joke for you:

Why don't bears wear shoes?

Because they already have bear feet!
```

## इनवोक

```python
chain.invoke({"topic": "bears"})
```

```output
AIMessage(content="Why don't bears wear shoes? \n\nBecause they have bear feet!")
```

## बैच

```python
chain.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
[AIMessage(content="Sure, here's a bear joke for you:\n\nWhy don't bears wear shoes?\n\nBecause they already have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!")]
```

आप `max_concurrency` पैरामीटर का उपयोग करके समवर्ती अनुरोधों की संख्या सेट कर सकते हैं।

```python
chain.batch([{"topic": "bears"}, {"topic": "cats"}], config={"max_concurrency": 5})
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild? Too many cheetahs!")]
```

## असिंक्रोनस स्ट्रीम

```python
async for s in chain.astream({"topic": "bears"}):
    print(s.content, end="", flush=True)
```

```output
Why don't bears wear shoes?

Because they have bear feet!
```

## असिंक्रोनस इनवोक

```python
await chain.ainvoke({"topic": "bears"})
```

```output
AIMessage(content="Why don't bears ever wear shoes?\n\nBecause they already have bear feet!")
```

## असिंक्रोनस बैच

```python
await chain.abatch([{"topic": "bears"}])
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!")]
```

## असिंक्रोनस स्ट्रीम घटनाएं (बीटा)

इवेंट स्ट्रीमिंग एक **बीटा** API है, और प्रतिक्रिया के आधार पर थोड़ा बदल सकता है।

नोट: langchain-core 0.2.0 में पेश किया गया

अभी के लिए, जब astream_events API का उपयोग कर रहे हों, तो सही ढंग से काम करने के लिए कृपया:

* पूरे कोड में `async` का उपयोग करें (async उपकरण आदि सहित)
* कस्टम फ़ंक्शन / रनेबल परिभाषित करते समय कॉलबैक प्रसारित करें।
* जब भी LCEL के बिना रनेबल का उपयोग कर रहे हों, तो LLM पर `.ainvoke` कॉल करने के बजाय `.astream()` कॉल करना सुनिश्चित करें ताकि LLM टोकन स्ट्रीम करने के लिए मजबूर हो।

### संदर्भ घटना

यहां एक संदर्भ तालिका है जो कुछ घटनाओं को दर्शाती है जो विभिन्न Runnable वस्तुओं द्वारा उत्सर्जित की जा सकती हैं।
कुछ Runnable के लिए परिभाषाएं तालिका के बाद शामिल की गई हैं।

⚠️ जब रनेबल के इनपुट स्ट्रीम को स्ट्रीम किया जाता है, तब तक वे उपलब्ध नहीं होंगे जब तक कि इनपुट स्ट्रीम पूरी तरह से खपत नहीं हो जाती। इसका मतलब है कि इनपुट `start` घटना के बजाय `end` हुक पर उपलब्ध होंगे।

| घटना                 | नाम             | टुकड़ा                           | इनपुट                                         | आउटपुट                                          |
|----------------------|------------------|---------------------------------|-----------------------------------------------|-------------------------------------------------|
| on_chat_model_start  | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]} |                                                 |
| on_chat_model_stream | [model name]     | AIMessageChunk(content="hello") |                                               |                                                 |
| on_chat_model_end    | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]} | {"generations": [...], "llm_output": None, ...} |
| on_llm_start         | [model name]     |                                 | {'input': 'hello'}                            |                                                 |
| on_llm_stream        | [model name]     | 'Hello'                         |                                               |                                                 |
| on_llm_end           | [model name]     |                                 | 'Hello human!'                                |
| on_chain_start       | format_docs      |                                 |                                               |                                                 |
| on_chain_stream      | format_docs      | "hello world!, goodbye world!"  |                                               |                                                 |
| on_chain_end         | format_docs      |                                 | [Document(...)]                               | "hello world!, goodbye world!"                  |
| on_tool_start        | some_tool        |                                 | {"x": 1, "y": "2"}                            |                                                 |
| on_tool_stream       | some_tool        | {"x": 1, "y": "2"}              |                                               |                                                 |
| on_tool_end          | some_tool        |                                 |                                               | {"x": 1, "y": "2"}                              |
| on_retriever_start   | [retriever name] |                                 | {"query": "hello"}                            |                                                 |
| on_retriever_chunk   | [retriever name] | {documents: [...]}              |                                               |                                                 |
| on_retriever_end     | [retriever name] |                                 | {"query": "hello"}                            | {documents: [...]}                              |
| on_prompt_start      | [template_name]  |                                 | {"question": "hello"}                         |                                                 |
| on_prompt_end        | [template_name]  |                                 | {"question": "hello"}                         | ChatPromptValue(messages: [SystemMessage, ...]) |

उपरोक्त घटनाओं से संबंधित घोषणाएं यहां हैं:

`format_docs`:

```python
def format_docs(docs: List[Document]) -> str:
    '''Format the docs.'''
    return ", ".join([doc.page_content for doc in docs])

format_docs = RunnableLambda(format_docs)
```

`some_tool`:

```python
@tool
def some_tool(x: int, y: str) -> dict:
    '''Some_tool.'''
    return {"x": x, "y": y}
```

`prompt`:

```python
template = ChatPromptTemplate.from_messages(
    [("system", "You are Cat Agent 007"), ("human", "{question}")]
).with_config({"run_name": "my_template", "tags": ["my_template"]})
```

चेन को और रोचक बनाने के लिए, `astream_events` इंटरफ़ेस (और बाद में `astream_log` इंटरफ़ेस) को प्रदर्शित करने के लिए एक नया चेन परिभाषित करते हैं।

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

retrieval_chain = (
    {
        "context": retriever.with_config(run_name="Docs"),
        "question": RunnablePassthrough(),
    }
    | prompt
    | model.with_config(run_name="my_llm")
    | StrOutputParser()
)
```

अब आइए `astream_events` का उपयोग करके रिट्रीवर और LLM से घटनाएं प्राप्त करें।

```python
async for event in retrieval_chain.astream_events(
    "where did harrison work?", version="v1", include_names=["Docs", "my_llm"]
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="|")
    elif kind in {"on_chat_model_start"}:
        print()
        print("Streaming LLM:")
    elif kind in {"on_chat_model_end"}:
        print()
        print("Done streaming LLM.")
    elif kind == "on_retriever_end":
        print("--")
        print("Retrieved the following documents:")
        print(event["data"]["output"]["documents"])
    elif kind == "on_tool_end":
        print(f"Ended tool: {event['name']}")
    else:
        pass
```

```output
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(

--
Retrieved the following documents:
[Document(page_content='harrison worked at kensho')]

Streaming LLM:
|H|arrison| worked| at| Kens|ho|.||
Done streaming LLM.
```

## असिंक्रोनस स्ट्रीम मध्यवर्ती चरण

सभी रनेबल में एक `.astream_log()` विधि भी होती है जिसका उपयोग अपने श्रृंखला/अनुक्रम के सभी या कुछ मध्यवर्ती चरणों को स्ट्रीम करने (जैसे कि वे होते हैं) के लिए किया जाता है।

यह उपयोगकर्ता को प्रगति दिखाने, मध्यवर्ती परिणामों का उपयोग करने या अपने श्रृंखला को डीबग करने के लिए उपयोगी है।

आप सभी चरण (डिफ़ॉल्ट) या नाम, टैग या मेटाडेटा द्वारा शामिल/अपवर्जित चरण स्ट्रीम कर सकते हैं।

यह विधि [JSONPatch](https://jsonpatch.com) ऑप्स उत्पन्न करती है जो प्राप्त होने के उसी क्रम में लागू किए जाने पर RunState को बनाते हैं।

```python
class LogEntry(TypedDict):
    id: str
    """ID of the sub-run."""
    name: str
    """Name of the object being run."""
    type: str
    """Type of the object being run, eg. prompt, chain, llm, etc."""
    tags: List[str]
    """List of tags for the run."""
    metadata: Dict[str, Any]
    """Key-value pairs of metadata for the run."""
    start_time: str
    """ISO-8601 timestamp of when the run started."""

    streamed_output_str: List[str]
    """List of LLM tokens streamed by this run, if applicable."""
    final_output: Optional[Any]
    """Final output of this run.
    Only available after the run has finished successfully."""
    end_time: Optional[str]
    """ISO-8601 timestamp of when the run ended.
    Only available after the run has finished."""


class RunState(TypedDict):
    id: str
    """ID of the run."""
    streamed_output: List[Any]
    """List of output chunks streamed by Runnable.stream()"""
    final_output: Optional[Any]
    """Final output of the run, usually the result of aggregating (`+`) streamed_output.
    Only available after the run has finished successfully."""

    logs: Dict[str, LogEntry]
    """Map of run names to sub-runs. If filters were supplied, this list will
    contain only the runs that matched the filters."""
```

### JSONPatch टुकड़ों को स्ट्रीम करना

यह उपयोगी है, उदा. एक HTTP सर्वर में `JSONPatch` स्ट्रीम करने के लिए, और फिर क्लाइंट पर ऑप्स को लागू करके वहां रन स्थिति को पुनर्गठित करने के लिए। [LangServe](https://github.com/langchain-ai/langserve) टूलिंग देखें जो किसी भी Runnable से वेब सर्वर बनाने में आसान बनाता है।

```python
async for chunk in retrieval_chain.astream_log(
    "where did harrison work?", include_names=["Docs"]
):
    print("-" * 40)
    print(chunk)
```

```output
----------------------------------------
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': '82e9b4b1-3dd6-4732-8db9-90e79c4da48c',
            'logs': {},
            'name': 'RunnableSequence',
            'streamed_output': [],
            'type': 'chain'}})
----------------------------------------
RunLogPatch({'op': 'add',
  'path': '/logs/Docs',
  'value': {'end_time': None,
            'final_output': None,
            'id': '9206e94a-57bd-48ee-8c5e-fdd1c52a6da2',
            'metadata': {},
            'name': 'Docs',
            'start_time': '2024-01-19T22:33:55.902+00:00',
            'streamed_output': [],
            'streamed_output_str': [],
            'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
            'type': 'retriever'}})
----------------------------------------
RunLogPatch({'op': 'add',
  'path': '/logs/Docs/final_output',
  'value': {'documents': [Document(page_content='harrison worked at kensho')]}},
 {'op': 'add',
  'path': '/logs/Docs/end_time',
  'value': '2024-01-19T22:33:56.064+00:00'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ''},
 {'op': 'replace', 'path': '/final_output', 'value': ''})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'H'},
 {'op': 'replace', 'path': '/final_output', 'value': 'H'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'arrison'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' worked'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' at'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked at'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Kens'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked at Kens'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'ho'},
 {'op': 'replace',
  'path': '/final_output',
  'value': 'Harrison worked at Kensho'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'},
 {'op': 'replace',
  'path': '/final_output',
  'value': 'Harrison worked at Kensho.'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ''})
```

### इनक्रीमेंटल RunState को स्ट्रीम करना

आप सरलता से `diff=False` पास कर सकते हैं ताकि `RunState` के इनक्रीमेंटल मान प्राप्त हों।
आप अधिक विस्तृत आउटपुट प्राप्त करेंगे जिसमें अधिक पुनरावृत्ति वाले भाग होंगे।

```python
async for chunk in retrieval_chain.astream_log(
    "where did harrison work?", include_names=["Docs"], diff=False
):
    print("-" * 70)
    print(chunk)
```

```output
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': None,
                   'final_output': None,
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': '',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [''],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'H',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kens',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens', 'ho'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho.',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens', 'ho', '.'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho.',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['',
                     'H',
                     'arrison',
                     ' worked',
                     ' at',
                     ' Kens',
                     'ho',
                     '.',
                     ''],
 'type': 'chain'})
```

## समानांतरता

आइए देखें कि LangChain अभिव्यक्ति भाषा समानांतर अनुरोधों का कैसे समर्थन करती है।
उदाहरण के लिए, जब `RunnableParallel` (अक्सर एक डिक्शनरी के रूप में लिखा जाता है) का उपयोग किया जाता है, तो यह प्रत्येक तत्व को समानांतर रूप से निष्पादित करता है।

```python
from langchain_core.runnables import RunnableParallel

chain1 = ChatPromptTemplate.from_template("tell me a joke about {topic}") | model
chain2 = (
    ChatPromptTemplate.from_template("write a short (2 line) poem about {topic}")
    | model
)
combined = RunnableParallel(joke=chain1, poem=chain2)
```

```python
%%time
chain1.invoke({"topic": "bears"})
```

```output
CPU times: user 18 ms, sys: 1.27 ms, total: 19.3 ms
Wall time: 692 ms
```

```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they already have bear feet!")
```

```python
%%time
chain2.invoke({"topic": "bears"})
```

```output
CPU times: user 10.5 ms, sys: 166 µs, total: 10.7 ms
Wall time: 579 ms
```

```output
AIMessage(content="In forest's embrace,\nMajestic bears pace.")
```

```python
%%time
combined.invoke({"topic": "bears"})
```

```output
CPU times: user 32 ms, sys: 2.59 ms, total: 34.6 ms
Wall time: 816 ms
```

```output
{'joke': AIMessage(content="Sure, here's a bear-related joke for you:\n\nWhy did the bear bring a ladder to the bar?\n\nBecause he heard the drinks were on the house!"),
 'poem': AIMessage(content="In wilderness they roam,\nMajestic strength, nature's throne.")}
```

### बैचों पर समानांतरता

समानांतरता को अन्य रनेबल के साथ संयोजित किया जा सकता है।
आइए बैचों के साथ समानांतरता का उपयोग करने का प्रयास करें।

```python
%%time
chain1.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 17.3 ms, sys: 4.84 ms, total: 22.2 ms
Wall time: 628 ms
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!")]
```

```python
%%time
chain2.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 15.8 ms, sys: 3.83 ms, total: 19.7 ms
Wall time: 718 ms
```

```output
[AIMessage(content='In the wild, bears roam,\nMajestic guardians of ancient home.'),
 AIMessage(content='Whiskers grace, eyes gleam,\nCats dance through the moonbeam.')]
```

```python
%%time
combined.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 44.8 ms, sys: 3.17 ms, total: 48 ms
Wall time: 721 ms
```

```output
[{'joke': AIMessage(content="Sure, here's a bear joke for you:\n\nWhy don't bears wear shoes?\n\nBecause they have bear feet!"),
  'poem': AIMessage(content="Majestic bears roam,\nNature's strength, beauty shown.")},
 {'joke': AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!"),
  'poem': AIMessage(content="Whiskers dance, eyes aglow,\nCats embrace the night's gentle flow.")}]
```
