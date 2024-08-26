---
translated: true
---

# Tongyi Qwen

Tongyi Qwen es un modelo de lenguaje a gran escala desarrollado por Alibaba's Damo Academy. Es capaz de entender la intención del usuario a través del entendimiento del lenguaje natural y el análisis semántico, basado en la entrada del usuario en lenguaje natural. Proporciona servicios y asistencia a los usuarios en diferentes dominios y tareas. Al proporcionar instrucciones claras y detalladas, puede obtener resultados que se alineen mejor con sus expectativas.

## Configuración

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

## Uso en una cadena

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
