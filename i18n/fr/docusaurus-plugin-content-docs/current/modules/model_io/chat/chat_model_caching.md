---
translated: true
---

# Mise en cache

LangChain fournit une couche de mise en cache facultative pour les modèles de chat. Cela est utile pour deux raisons :

Cela peut vous faire économiser de l'argent en réduisant le nombre d'appels d'API que vous effectuez auprès du fournisseur de LLM, si vous demandez souvent la même complétion plusieurs fois.
Cela peut accélérer votre application en réduisant le nombre d'appels d'API que vous effectuez auprès du fournisseur de LLM.

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

## Cache en mémoire

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

## Cache SQLite

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
