---
translated: true
---

# 작가

[Writer](https://writer.com/)는 다양한 언어 콘텐츠를 생성하는 플랫폼입니다.

이 예제에서는 LangChain을 사용하여 `Writer` [모델](https://dev.writer.com/docs/models)과 상호 작용하는 방법을 설명합니다.

WRITER_API_KEY를 [여기](https://dev.writer.com/docs)에서 얻어야 합니다.

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
