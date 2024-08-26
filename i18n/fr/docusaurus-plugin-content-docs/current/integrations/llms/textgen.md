---
translated: true
---

# TextGen

[GitHub:oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui) Une interface web Gradio pour exécuter des modèles de langage comme LLaMA, llama.cpp, GPT-J, Pythia, OPT et GALACTICA.

Cet exemple explique comment utiliser LangChain pour interagir avec des modèles LLM via l'intégration de l'API `text-generation-webui`.

Assurez-vous d'avoir configuré `text-generation-webui` et installé un modèle LLM. Installation recommandée via l'[installateur en un clic](https://github.com/oobabooga/text-generation-webui#one-click-installers) approprié pour votre système d'exploitation.

Une fois que `text-generation-webui` est installé et confirmé fonctionnel via l'interface web, activez l'option `api` soit via l'onglet de configuration du modèle web, soit en ajoutant l'argument de démarrage `--api` à votre commande de démarrage.

## Définir model_url et exécuter l'exemple

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

### Version en flux continu

Vous devez installer websocket-client pour utiliser cette fonctionnalité.
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
