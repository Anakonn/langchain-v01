---
translated: true
---

# GPT4All

[GitHub:nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all) un ecosistema de chatbots de código abierto entrenados en una gran colección de datos limpios de asistentes, incluido código, historias y diálogo.

Este ejemplo explica cómo usar LangChain para interactuar con modelos `GPT4All`.

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

```output
Note: you may need to restart the kernel to use updated packages.
```

### Importar GPT4All

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain_community.llms import GPT4All
from langchain_core.prompts import PromptTemplate
```

### Configurar la pregunta para pasar al LLM

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### Especificar el modelo

Para ejecutar localmente, descarga un modelo con formato ggml compatible.

La [página de gpt4all](https://gpt4all.io/index.html) tiene una útil sección de `Model Explorer`:

* Selecciona un modelo de interés
* Descarga usando la interfaz de usuario y mueve el `.bin` a la `local_path` (indicada a continuación)

Para más información, visita https://github.com/nomic-ai/gpt4all.

---

```python
local_path = (
    "./models/ggml-gpt4all-l13b-snoozy.bin"  # replace with your desired local file path
)
```

```python
# Callbacks support token-wise streaming
callbacks = [StreamingStdOutCallbackHandler()]

# Verbose is required to pass to the callback manager
llm = GPT4All(model=local_path, callbacks=callbacks, verbose=True)

# If you want to use a custom model add the backend parameter
# Check https://docs.gpt4all.io/gpt4all_python.html for supported backends
llm = GPT4All(model=local_path, backend="gptj", callbacks=callbacks, verbose=True)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

Justin Bieber nació el 1 de marzo de 1994. En 1994, los Cowboys ganaron el Super Bowl XXVIII.
