---
translated: true
---

# OpenLLM

[🦾 OpenLLM](https://github.com/bentoml/OpenLLM) es una plataforma abierta para operar modelos de lenguaje grandes (LLM) en producción. Permite a los desarrolladores ejecutar fácilmente inferencia con cualquier LLM de código abierto, implementar en la nube o en las instalaciones y construir aplicaciones de IA poderosas.

## Instalación

Instala `openllm` a través de [PyPI](https://pypi.org/project/openllm/)

```python
%pip install --upgrade --quiet  openllm
```

## Iniciar el servidor OpenLLM localmente

Para iniciar un servidor LLM, usa el comando `openllm start`. Por ejemplo, para iniciar un servidor dolly-v2, ejecuta el siguiente comando desde una terminal:

```bash
openllm start dolly-v2
```

## Wrapper

```python
from langchain_community.llms import OpenLLM

server_url = "http://localhost:3000"  # Replace with remote host if you are running on a remote server
llm = OpenLLM(server_url=server_url)
```

### Opcional: Inferencia LLM local

También puede elegir inicializar un LLM administrado por OpenLLM localmente desde el proceso actual. Esto es útil para fines de desarrollo y permite a los desarrolladores probar rápidamente diferentes tipos de LLM.

Al mover aplicaciones LLM a producción, recomendamos implementar el servidor OpenLLM por separado y acceder a través de la opción `server_url` demostrada anteriormente.

Para cargar un LLM localmente a través del wrapper de LangChain:

```python
from langchain_community.llms import OpenLLM

llm = OpenLLM(
    model_name="dolly-v2",
    model_id="databricks/dolly-v2-3b",
    temperature=0.94,
    repetition_penalty=1.2,
)
```

### Integrar con un LLMChain

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "What is a good name for a company that makes {product}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(product="mechanical keyboard")
print(generated)
```

```output
iLkb
```
