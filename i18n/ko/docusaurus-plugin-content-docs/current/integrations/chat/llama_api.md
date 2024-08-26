---
sidebar_label: Llama API
translated: true
---

# ChatLlamaAPI

이 노트북은 [LlamaAPI](https://llama-api.com/)를 사용하여 LangChain과 함께 Llama2를 사용하는 방법을 보여줍니다. LlamaAPI는 함수 호출 지원을 추가한 Llama2의 호스팅 버전입니다.

%pip install --upgrade --quiet llamaapi

```python
from llamaapi import LlamaAPI

# 실제 API 토큰으로 'Your_API_Token'을 대체하세요

llama = LlamaAPI("Your_API_Token")
```

```python
from langchain_experimental.llms import ChatLlamaAPI
```

```output
/Users/harrisonchase/.pyenv/versions/3.9.1/envs/langchain/lib/python3.9/site-packages/deeplake/util/check_latest_version.py:32: UserWarning: A newer version of deeplake (3.6.12) is available. It's recommended that you update to the latest version using `pip install -U deeplake`.
  warnings.warn(
```

```python
model = ChatLlamaAPI(client=llama)
```

```python
from langchain.chains import create_tagging_chain

schema = {
    "properties": {
        "sentiment": {
            "type": "string",
            "description": "the sentiment encountered in the passage",
        },
        "aggressiveness": {
            "type": "integer",
            "description": "a 0-10 score of how aggressive the passage is",
        },
        "language": {"type": "string", "description": "the language of the passage"},
    }
}

chain = create_tagging_chain(schema, model)
```

```python
chain.run("give me your money")
```

```output
{'sentiment': 'aggressive', 'aggressiveness': 8, 'language': 'english'}
```