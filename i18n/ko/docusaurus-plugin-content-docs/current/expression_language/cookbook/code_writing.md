---
sidebar_class_name: hidden
translated: true
---

# 코드 작성

LCEL을 사용하여 Python 코드를 작성하는 예제입니다.

```python
%pip install --upgrade --quiet langchain-core langchain-experimental langchain-openai
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_experimental.utilities import PythonREPL
from langchain_openai import ChatOpenAI
```

```python
template = """Write some python code to solve the user's problem.

Return only python code in Markdown format, e.g.:
```

```python
prompt = ChatPromptTemplate.from_messages([("system", template), ("human", "{input}")])

model = ChatOpenAI()
```

```python
def _sanitize_output(text: str):
    _, after = text.split("```python")
    return after.split("```")[0]
```

```python
chain = prompt | model | StrOutputParser() | _sanitize_output | PythonREPL().run
```

```python
chain.invoke({"input": "whats 2 plus 2"})
```

```output
Python REPL can execute arbitrary code. Use with caution.
```

```output
'4\n'
```