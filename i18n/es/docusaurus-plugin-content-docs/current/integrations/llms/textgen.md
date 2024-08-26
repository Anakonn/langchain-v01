---
translated: true
---

# TextGen

[GitHub:oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui) Una interfaz web de gradio para ejecutar modelos de lenguaje grandes como LLaMA, llama.cpp, GPT-J, Pythia, OPT y GALACTICA.

Este ejemplo explica cómo usar LangChain para interactuar con modelos LLM a través de la integración de la API `text-generation-webui`.

Asegúrese de tener `text-generation-webui` configurado y un modelo LLM instalado. Instalación recomendada a través del [instalador de un solo clic apropiado](https://github.com/oobabooga/text-generation-webui#one-click-installers) para su sistema operativo.

Una vez que `text-generation-webui` esté instalado y confirmado que funciona a través de la interfaz web, habilite la opción `api` ya sea a través de la pestaña de configuración del modelo web o agregando el argumento de ejecución `--api` a su comando de inicio.

## Establecer model_url y ejecutar el ejemplo

```python
model_url = "http://localhost:5000"
```

```python
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import TextGen
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)
llm = TextGen(model_url=model_url)
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

### Versión de transmisión

Debes instalar websocket-client para usar esta función.
`pip install websocket-client`

```python
model_url = "ws://localhost:5005"
```

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import TextGen
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)
llm = TextGen(
    model_url=model_url, streaming=True, callbacks=[StreamingStdOutCallbackHandler()]
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

```python
llm = TextGen(model_url=model_url, streaming=True)
for chunk in llm.stream("Ask 'Hi, how are you?' like a pirate:'", stop=["'", "\n"]):
    print(chunk, end="", flush=True)
```
