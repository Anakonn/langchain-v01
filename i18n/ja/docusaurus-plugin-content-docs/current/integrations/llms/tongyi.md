---
translated: true
---

# Tongyi Qwen

Tongyi Qwen は、アリババのDamo Academyが開発した大規模な言語モデルです。ユーザーの入力に基づいて自然言語理解とセマンティック分析を行い、ユーザーの意図を理解することができます。さまざまなドメインやタスクでユーザーにサービスとアシストを提供しています。明確で詳細な指示を提供することで、期待に沿った結果を得ることができます。

## 設定

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
from langchain_community.llms import Tongyi
```

```python
Tongyi().invoke("What NFL team won the Super Bowl in the year Justin Bieber was born?")
```

```output
'Justin Bieber was born on March 1, 1994. The Super Bowl that took place in the same year was Super Bowl XXVIII, which was played on January 30, 1994. The winner of that Super Bowl was the Dallas Cowboys, who defeated the Buffalo Bills with a score of 30-13.'
```

## チェーンで使用する

```python
from langchain_core.prompts import PromptTemplate
```

```python
llm = Tongyi()
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

chain.invoke({"question": question})
```

```output
'Justin Bieber was born on March 1, 1994. The Super Bowl that took place in the same calendar year was Super Bowl XXVIII, which was played on January 30, 1994. The winner of Super Bowl XXVIII was the Dallas Cowboys, who defeated the Buffalo Bills with a score of 30-13.'
```
