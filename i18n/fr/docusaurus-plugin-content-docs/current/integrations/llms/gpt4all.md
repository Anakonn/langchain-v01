---
translated: true
---

# GPT4All

[GitHub:nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all) un écosystème de chatbots open source entraînés sur une vaste collection de données d'assistant propres, y compris du code, des histoires et des dialogues.

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles `GPT4All`.

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

```output
Note: you may need to restart the kernel to use updated packages.
```

### Importer GPT4All

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain_community.llms import GPT4All
from langchain_core.prompts import PromptTemplate
```

### Définir la question à passer au LLM

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### Spécifier le modèle

Pour exécuter localement, téléchargez un modèle au format ggml compatible.

La [page gpt4all](https://gpt4all.io/index.html) a une section `Model Explorer` utile :

* Sélectionnez un modèle qui vous intéresse
* Téléchargez-le à l'aide de l'interface utilisateur et déplacez le `.bin` vers le `local_path` (noté ci-dessous)

Pour plus d'informations, visitez https://github.com/nomic-ai/gpt4all.

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

Justin Bieber est né le 1er mars 1994. En 1994, les Cowboys ont remporté le Super Bowl XXVIII.
