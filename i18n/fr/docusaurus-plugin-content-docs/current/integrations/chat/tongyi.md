---
sidebar_label: Tongyi Qwen
translated: true
---

# ChatTongyi

Tongyi Qwen est un modèle de langage de grande taille développé par l'Académie Damo d'Alibaba. Il est capable de comprendre l'intention de l'utilisateur grâce à la compréhension du langage naturel et à l'analyse sémantique, sur la base des entrées de l'utilisateur en langage naturel. Il fournit des services et une assistance aux utilisateurs dans différents domaines et tâches. En fournissant des instructions claires et détaillées, vous pouvez obtenir des résultats mieux alignés avec vos attentes.
Dans ce notebook, nous présenterons comment utiliser langchain avec [Tongyi](https://www.aliyun.com/product/dashscope) principalement dans `Chat` correspondant au package `langchain/chat_models` dans langchain.

```python
# Install the package
%pip install --upgrade --quiet  dashscope
```

```python
# Get a new token: https://help.aliyun.com/document_detail/611472.html?spm=a2c4g.2399481.0.0
from getpass import getpass

DASHSCOPE_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["DASHSCOPE_API_KEY"] = DASHSCOPE_API_KEY
```

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.messages import HumanMessage

chatLLM = ChatTongyi(
    streaming=True,
)
res = chatLLM.stream([HumanMessage(content="hi")], streaming=True)
for r in res:
    print("chat resp:", r)
```

```output
chat resp: content='Hello! How' additional_kwargs={} example=False
chat resp: content=' can I assist you today?' additional_kwargs={} example=False
```

```python
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]
chatLLM(messages)
```

```output
AIMessageChunk(content="J'aime programmer.", additional_kwargs={}, example=False)
```

## Appel d'outil

ChatTongyi prend en charge l'API d'appel d'outil qui vous permet de décrire des outils et leurs arguments, et de faire en sorte que le modèle renvoie un objet JSON avec un outil à invoquer et les entrées de cet outil.

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.messages import HumanMessage, SystemMessage

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "当你想知道现在的时间时非常有用。",
            "parameters": {},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "当你想查询指定城市的天气时非常有用。",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市或县区，比如北京市、杭州市、余杭区等。",
                    }
                },
            },
            "required": ["location"],
        },
    },
]

messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="What is the weather like in San Francisco?"),
]
chatLLM = ChatTongyi()
llm_kwargs = {"tools": tools, "result_format": "message"}
ai_message = chatLLM.bind(**llm_kwargs).invoke(messages)
ai_message
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'function': {'name': 'get_current_weather', 'arguments': '{"location": "San Francisco"}'}, 'id': '', 'type': 'function'}]}, response_metadata={'model_name': 'qwen-turbo', 'finish_reason': 'tool_calls', 'request_id': 'dae79197-8780-9b7e-8c15-6a83e2a53534', 'token_usage': {'input_tokens': 229, 'output_tokens': 19, 'total_tokens': 248}}, id='run-9e06f837-582b-473b-bb1f-5e99a68ecc10-0', tool_calls=[{'name': 'get_current_weather', 'args': {'location': 'San Francisco'}, 'id': ''}])
```
