---
translated: true
---

# Huggingface Endpoints

>El [Hugging Face Hub](https://huggingface.co/docs/hub/index) es una plataforma con más de 120k modelos, 20k conjuntos de datos y 50k aplicaciones de demostración (Spaces), todos de código abierto y de acceso público, en una plataforma en línea donde las personas pueden colaborar y construir ML juntas.

El `Hugging Face Hub` también ofrece varios endpoints para construir aplicaciones de ML.
Este ejemplo muestra cómo conectarse a los diferentes tipos de Endpoints.

En particular, la generación de texto por inferencia está impulsada por [Text Generation Inference](https://github.com/huggingface/text-generation-inference): un servidor personalizado de Rust, Python y gRPC para una inferencia de generación de texto ultrarrápida.

```python
from langchain_community.llms import HuggingFaceEndpoint
```

## Instalación y configuración

Para usar, debes tener instalado el paquete de Python `huggingface_hub`.

```python
%pip install --upgrade --quiet huggingface_hub
```

```python
# get a token: https://huggingface.co/docs/api-inference/quicktour#get-your-api-token

from getpass import getpass

HUGGINGFACEHUB_API_TOKEN = getpass()
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = HUGGINGFACEHUB_API_TOKEN
```

## Preparar ejemplos

```python
from langchain_community.llms import HuggingFaceEndpoint
```

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
question = "Who won the FIFA World Cup in the year 1994? "

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## Ejemplos

Aquí hay un ejemplo de cómo puede acceder a la integración `HuggingFaceEndpoint` de la API gratuita [Serverless Endpoints](https://huggingface.co/inference-endpoints/serverless).

```python
repo_id = "mistralai/Mistral-7B-Instruct-v0.2"

llm = HuggingFaceEndpoint(
    repo_id=repo_id, max_length=128, temperature=0.5, token=HUGGINGFACEHUB_API_TOKEN
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
print(llm_chain.run(question))
```

## Endpoint dedicado

La API gratuita sin servidor le permite implementar soluciones e iterar rápidamente, pero puede estar limitada por tasa para casos de uso intensivo, ya que las cargas se comparten con otras solicitudes.

Para cargas de trabajo empresariales, lo mejor es usar [Inference Endpoints - Dedicated](https://huggingface.co/inference-endpoints/dedicated).
Esto brinda acceso a una infraestructura totalmente administrada que ofrece más flexibilidad y velocidad. Estos recursos vienen con soporte continuo y garantías de tiempo de actividad, así como opciones como AutoScaling.

```python
# Set the url to your Inference Endpoint below
your_endpoint_url = "https://fayjubiy2xqn36z0.us-east-1.aws.endpoints.huggingface.cloud"
```

```python
llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
)
llm("What did foo say about bar?")
```

### Streaming

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import HuggingFaceEndpoint

llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
    streaming=True,
)
llm("What did foo say about bar?", callbacks=[StreamingStdOutCallbackHandler()])
```
