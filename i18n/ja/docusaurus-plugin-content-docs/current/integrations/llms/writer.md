---
translated: true
---

# ライター

[ライター](https://writer.com/)は、さまざまな言語のコンテンツを生成するプラットフォームです。

この例では、LangChainを使って`Writer`[モデル](https://dev.writer.com/docs/models)と対話する方法について説明します。

WRITER_API_KEYは[こちら](https://dev.writer.com/docs)から取得する必要があります。

```python
from getpass import getpass

WRITER_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["WRITER_API_KEY"] = WRITER_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import Writer
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
# If you get an error, probably, you need to set up the "base_url" parameter that can be taken from the error log.

llm = Writer()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
