---
translated: true
---

# キャッシング

LangChainには、LLMのオプションのキャッシングレイヤーが用意されています。これには2つの理由があります:

- LLMプロバイダへのAPIコールの回数を減らすことで、コストを節約できます。同じ完成を何度も要求する場合に特に効果的です。
- LLMプロバイダへのAPIコールの回数を減らすことで、アプリケーションのスピードアップにつながります。

```python
from langchain.globals import set_llm_cache
from langchain_openai import OpenAI

# To make the caching really obvious, lets use a slower model.
llm = OpenAI(model_name="gpt-3.5-turbo-instruct", n=2, best_of=2)
```

```python
%%time
from langchain.cache import InMemoryCache

set_llm_cache(InMemoryCache())

# The first time, it is not yet in cache, so it should take longer
llm.predict("Tell me a joke")
```

```output
CPU times: user 13.7 ms, sys: 6.54 ms, total: 20.2 ms
Wall time: 330 ms
```

```output
"\n\nWhy couldn't the bicycle stand up by itself? Because it was two-tired!"
```

```python
%%time
# The second time it is, so it goes faster
llm.predict("Tell me a joke")
```

```output
CPU times: user 436 µs, sys: 921 µs, total: 1.36 ms
Wall time: 1.36 ms
```

```output
"\n\nWhy couldn't the bicycle stand up by itself? Because it was two-tired!"
```

## SQLiteキャッシュ

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
CPU times: user 29.3 ms, sys: 17.3 ms, total: 46.7 ms
Wall time: 364 ms
```

```output
'\n\nWhy did the tomato turn red?\n\nBecause it saw the salad dressing!'
```

```python
%%time
# The second time it is, so it goes faster
llm.predict("Tell me a joke")
```

```output
CPU times: user 4.58 ms, sys: 2.23 ms, total: 6.8 ms
Wall time: 4.68 ms
```

```output
'\n\nWhy did the tomato turn red?\n\nBecause it saw the salad dressing!'
```
