---
translated: true
---

# NLP Cloud

El [NLP Cloud](https://nlpcloud.io) ofrece modelos pre-entrenados o personalizados de alto rendimiento para NER, análisis de sentimiento, clasificación, resumen, paráfrasis, corrección de gramática y ortografía, extracción de palabras clave y frases clave, chatbot, generación de descripciones de productos y anuncios, clasificación de intenciones, generación de texto, generación de imágenes, generación de publicaciones de blog, generación de código, respuesta a preguntas, reconocimiento automático del habla, traducción automática, detección de idioma, búsqueda semántica, similitud semántica, tokenización, etiquetado de partes del discurso, incrustaciones y análisis de dependencias. Está listo para la producción y se sirve a través de una API REST.

Este ejemplo explica cómo usar LangChain para interactuar con los [modelos](https://docs.nlpcloud.com/#models) de `NLP Cloud`.

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
# get a token: https://docs.nlpcloud.com/#authentication

from getpass import getpass

NLPCLOUD_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = NLPCLOUD_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import NLPCloud
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = NLPCloud()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```

```output
' Justin Bieber was born in 1994, so the team that won the Super Bowl that year was the San Francisco 49ers.'
```
