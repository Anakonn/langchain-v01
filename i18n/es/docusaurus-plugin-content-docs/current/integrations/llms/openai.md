---
translated: true
---

# OpenAI

[OpenAI](https://platform.openai.com/docs/introduction) ofrece un espectro de modelos con diferentes niveles de potencia adecuados para diferentes tareas.

Este ejemplo explica cómo usar LangChain para interactuar con los [modelos](https://platform.openai.com/docs/models) de `OpenAI`

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

Si necesita especificar su ID de organización, puede usar la siguiente celda. Sin embargo, no es necesario si solo forma parte de una sola organización o tiene la intención de usar su organización predeterminada. Puede verificar su organización predeterminada [aquí](https://platform.openai.com/account/api-keys).

Para especificar su organización, puede usar esto:

```python
OPENAI_ORGANIZATION = getpass()

os.environ["OPENAI_ORGANIZATION"] = OPENAI_ORGANIZATION
```

```python
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = OpenAI()
```

Si desea especificar manualmente su clave API de OpenAI y/o ID de organización, puede usar lo siguiente:

```python
llm = OpenAI(openai_api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

Elimine el parámetro openai_organization si no se aplica a usted.

```python
llm_chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.invoke(question)
```

```output
' Justin Bieber was born on March 1, 1994. The Super Bowl is typically played in late January or early February. So, we need to look at the Super Bowl from 1994. In 1994, the Super Bowl was Super Bowl XXVIII, played on January 30, 1994. The winning team of that Super Bowl was the Dallas Cowboys.'
```

Si se encuentra detrás de un proxy explícito, puede especificar el http_client para que pase a través de

```python
pip install httpx

import httpx

openai = OpenAI(model_name="gpt-3.5-turbo-instruct", http_client=httpx.Client(proxies="http://proxy.yourcompany.com:8080"))
```
