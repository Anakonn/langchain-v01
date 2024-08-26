---
translated: true
---

# कैशिंग

LangChain एक वैकल्पिक कैशिंग परत प्रदान करता है चैट मॉडल के लिए। यह दो कारणों से उपयोगी है:

यह आपको पैसे बचा सकता है क्योंकि यह LLM प्रदाता को किए जाने वाले API कॉल की संख्या को कम करता है, अगर आप अक्सर एक ही पूर्णता का अनुरोध कर रहे हैं।
यह आपके एप्लिकेशन को तेज कर सकता है क्योंकि यह LLM प्रदाता को किए जाने वाले API कॉल की संख्या को कम करता है।

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

## मेमोरी कैश

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

## SQLite कैश

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
