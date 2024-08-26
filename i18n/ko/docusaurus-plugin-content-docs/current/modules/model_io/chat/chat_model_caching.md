---
translated: true
---

# 캐싱

LangChain은 채팅 모델에 대한 선택적 캐싱 계층을 제공합니다. 이것은 두 가지 이유로 유용합니다:

LLM 공급자에게 여러 번 동일한 완성을 요청하는 경우 API 호출 수를 줄여 비용을 절감할 수 있습니다.
LLM 공급자에게 API 호출 수를 줄여 애플리케이션 속도를 높일 수 있습니다.

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />

```python
# | output: false
# | echo: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI()
```

```python
# <!-- ruff: noqa: F821 -->
from langchain.globals import set_llm_cache
```

## 메모리 캐시

```python
%%time
from langchain.cache import InMemoryCache

set_llm_cache(InMemoryCache())

# The first time, it is not yet in cache, so it should take longer
llm.predict("Tell me a joke")
```

```output
CPU times: user 17.7 ms, sys: 9.35 ms, total: 27.1 ms
Wall time: 801 ms
```

```output
"Sure, here's a classic one for you:\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything!"
```

```python
%%time
# The second time it is, so it goes faster
llm.predict("Tell me a joke")
```

```output
CPU times: user 1.42 ms, sys: 419 µs, total: 1.83 ms
Wall time: 1.83 ms
```

```output
"Sure, here's a classic one for you:\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything!"
```

## SQLite 캐시

```python
!rm .langchain.db
```

```python
# We can do the same thing with a SQLite cache
from langchain.cache import SQLiteCache

set_llm_cache(SQLiteCache(database_path=".langchain.db"))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm.predict("Tell me a joke")
```

```output
CPU times: user 23.2 ms, sys: 17.8 ms, total: 40.9 ms
Wall time: 592 ms
```

```output
"Sure, here's a classic one for you:\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything!"
```

```python
%%time
# The second time it is, so it goes faster
llm.predict("Tell me a joke")
```

```output
CPU times: user 5.61 ms, sys: 22.5 ms, total: 28.1 ms
Wall time: 47.5 ms
```

```output
"Sure, here's a classic one for you:\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything!"
```
