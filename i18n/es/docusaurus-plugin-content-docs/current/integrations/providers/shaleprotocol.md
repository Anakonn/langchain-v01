---
traducido: falso
translated: true
---

# Protocolo Shale

[Protocolo Shale](https://shaleprotocol.com) proporciona API de inferencia listas para producción para LLM abiertos. Es un API Plug & Play ya que se aloja en una infraestructura de nube GPU altamente escalable.

Nuestro nivel gratuito admite hasta 1K solicitudes diarias por clave, ya que queremos eliminar la barrera para que cualquiera comience a construir aplicaciones genAI con LLM.

Con el Protocolo Shale, los desarrolladores/investigadores pueden crear aplicaciones y explorar las capacidades de los LLM abiertos sin costo.

Esta página cubre cómo se puede incorporar la API Shale-Serve con LangChain.

A partir de junio de 2023, la API admite Vicuna-13B de forma predeterminada. Vamos a admitir más LLM como Falcon-40B en futuras versiones.

## Cómo

### 1. Encuentra el enlace a nuestro Discord en https://shaleprotocol.com. Genera una clave API a través del "Shale Bot" en nuestro Discord. No se requiere tarjeta de crédito y no hay pruebas gratuitas. Es un nivel gratuito para siempre con un límite de 1K por día por clave API.

### 2. Usa https://shale.live/v1 como reemplazo de la API de OpenAI

Por ejemplo

```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Shale Protocol"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Shale Protocol"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.llm.LLMChain.html", "title": "Shale Protocol"}]-->
from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain

import os
os.environ['OPENAI_API_BASE'] = "https://shale.live/v1"
os.environ['OPENAI_API_KEY'] = "ENTER YOUR API KEY"

llm = OpenAI()

template = """Question: {question}

# Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)

```
