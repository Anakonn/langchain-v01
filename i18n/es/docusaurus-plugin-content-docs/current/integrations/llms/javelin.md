---
translated: true
---

# Tutorial de Javelin AI Gateway

Este cuaderno de Jupyter explorará cómo interactuar con Javelin AI Gateway utilizando el SDK de Python.
Javelin AI Gateway facilita la utilización de modelos de lenguaje a gran escala (LLM) como OpenAI, Cohere, Anthropic y otros al
proporcionar un punto final seguro y unificado. La puerta de enlace en sí proporciona un mecanismo centralizado para implementar modelos de manera sistemática,
proporcionar seguridad de acceso, política y salvaguardas de costos para empresas, etc.

Para obtener una lista completa de todas las características y beneficios de Javelin, visite www.getjavelin.io

## Paso 1: Introducción

[Javelin AI Gateway](https://www.getjavelin.io) es una puerta de enlace API de nivel empresarial para aplicaciones de IA. Integra una sólida seguridad de acceso, asegurando interacciones seguras con modelos de lenguaje a gran escala. Obtenga más información en la [documentación oficial](https://docs.getjavelin.io).

## Paso 2: Instalación

Antes de comenzar, debemos instalar `javelin_sdk` y configurar la clave API de Javelin como una variable de entorno.

```python
pip install 'javelin_sdk'
```

```output
Requirement already satisfied: javelin_sdk in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (0.1.8)
Requirement already satisfied: httpx<0.25.0,>=0.24.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (0.24.1)
Requirement already satisfied: pydantic<2.0.0,>=1.10.7 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (1.10.12)
Requirement already satisfied: certifi in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (2023.5.7)
Requirement already satisfied: httpcore<0.18.0,>=0.15.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (0.17.3)
Requirement already satisfied: idna in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (3.4)
Requirement already satisfied: sniffio in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (1.3.0)
Requirement already satisfied: typing-extensions>=4.2.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from pydantic<2.0.0,>=1.10.7->javelin_sdk) (4.7.1)
Requirement already satisfied: h11<0.15,>=0.13 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (0.14.0)
Requirement already satisfied: anyio<5.0,>=3.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (3.7.1)
Note: you may need to restart the kernel to use updated packages.
```

## Paso 3: Ejemplo de Completions

Esta sección demostrará cómo interactuar con Javelin AI Gateway para obtener completions de un modelo de lenguaje a gran escala. Aquí hay un script de Python que demuestra esto:
(nota) asume que ha configurado una ruta en la puerta de enlace llamada 'eng_dept03'

```python
from langchain.chains import LLMChain
from langchain_community.llms import JavelinAIGateway
from langchain_core.prompts import PromptTemplate

route_completions = "eng_dept03"

gateway = JavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route=route_completions,
    model_name="gpt-3.5-turbo-instruct",
)

prompt = PromptTemplate("Translate the following English text to French: {text}")

llmchain = LLMChain(llm=gateway, prompt=prompt)
result = llmchain.run("podcast player")

print(result)
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[6], line 2
      1 from langchain.chains import LLMChain
----> 2 from langchain.llms import JavelinAIGateway
      3 from langchain.prompts import PromptTemplate
      5 route_completions = "eng_dept03"

ImportError: cannot import name 'JavelinAIGateway' from 'langchain.llms' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/llms/__init__.py)
```

# Paso 4: Ejemplo de Embeddings

Esta sección demuestra cómo usar Javelin AI Gateway para obtener incrustaciones para consultas de texto y documentos. Aquí hay un script de Python que ilustra esto:
(nota) asume que ha configurado una ruta en la puerta de enlace llamada 'embeddings'

```python
from langchain_community.embeddings import JavelinAIGatewayEmbeddings

embeddings = JavelinAIGatewayEmbeddings(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="embeddings",
)

print(embeddings.embed_query("hello"))
print(embeddings.embed_documents(["hello"]))
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[9], line 1
----> 1 from langchain.embeddings import JavelinAIGatewayEmbeddings
      2 from langchain.embeddings.openai import OpenAIEmbeddings
      4 embeddings = JavelinAIGatewayEmbeddings(
      5     gateway_uri="http://localhost:8000", # replace with service URL or host/port of Javelin
      6     route="embeddings",
      7 )

ImportError: cannot import name 'JavelinAIGatewayEmbeddings' from 'langchain.embeddings' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/embeddings/__init__.py)
```

# Paso 5: Ejemplo de Chat

Esta sección ilustra cómo interactuar con Javelin AI Gateway para facilitar un chat con un modelo de lenguaje a gran escala. Aquí hay un script de Python que demuestra esto:
(nota) asume que ha configurado una ruta en la puerta de enlace llamada 'mychatbot_route'

```python
from langchain_community.chat_models import ChatJavelinAIGateway
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Artificial Intelligence has the power to transform humanity and make the world a better place"
    ),
]

chat = ChatJavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="mychatbot_route",
    model_name="gpt-3.5-turbo",
    params={"temperature": 0.1},
)

print(chat(messages))
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[8], line 1
----> 1 from langchain.chat_models import ChatJavelinAIGateway
      2 from langchain.schema import HumanMessage, SystemMessage
      4 messages = [
      5     SystemMessage(
      6         content="You are a helpful assistant that translates English to French."
   (...)
     10     ),
     11 ]

ImportError: cannot import name 'ChatJavelinAIGateway' from 'langchain.chat_models' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/chat_models/__init__.py)
```

Paso 6: Conclusión
Este tutorial presentó Javelin AI Gateway y demostró cómo interactuar con él utilizando el SDK de Python.
Recuerde consultar el [SDK de Python de Javelin](https://www.github.com/getjavelin.io/javelin-python) para obtener más ejemplos y explorar la documentación oficial para obtener detalles adicionales.

¡Feliz codificación!
