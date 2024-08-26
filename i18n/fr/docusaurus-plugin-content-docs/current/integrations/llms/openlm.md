---
translated: true
---

# OpenLM

[OpenLM](https://github.com/r2d4/openlm) est un fournisseur de LLM compatible OpenAI sans dépendance qui peut appeler directement différents points de terminaison d'inférence via HTTP.

Il implémente la classe OpenAI Completion afin qu'il puisse être utilisé comme un remplacement direct pour l'API OpenAI. Cet ensemble de modifications utilise BaseOpenAI pour un code ajouté minimal.

Cet exemple explique comment utiliser LangChain pour interagir avec OpenAI et HuggingFace. Vous aurez besoin de clés d'API pour les deux.

### Configuration

Installez les dépendances et définissez les clés d'API.

```python
# Uncomment to install openlm and openai if you haven't already

%pip install --upgrade --quiet  openlm
%pip install --upgrade --quiet  langchain-openai
```

```python
import os
from getpass import getpass

# Check if OPENAI_API_KEY environment variable is set
if "OPENAI_API_KEY" not in os.environ:
    print("Enter your OpenAI API key:")
    os.environ["OPENAI_API_KEY"] = getpass()

# Check if HF_API_TOKEN environment variable is set
if "HF_API_TOKEN" not in os.environ:
    print("Enter your HuggingFace Hub API key:")
    os.environ["HF_API_TOKEN"] = getpass()
```

### Utilisation de LangChain avec OpenLM

Ici, nous allons appeler deux modèles dans une LLMChain, `text-davinci-003` d'OpenAI et `gpt2` sur HuggingFace.

```python
from langchain.chains import LLMChain
from langchain_community.llms import OpenLM
from langchain_core.prompts import PromptTemplate
```

```python
question = "What is the capital of France?"
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

for model in ["text-davinci-003", "huggingface.co/gpt2"]:
    llm = OpenLM(model=model)
    llm_chain = LLMChain(prompt=prompt, llm=llm)
    result = llm_chain.run(question)
    print(
        """Model: {}
Result: {}""".format(model, result)
    )
```

```output
Model: text-davinci-003
Result:  France is a country in Europe. The capital of France is Paris.
Model: huggingface.co/gpt2
Result: Question: What is the capital of France?

Answer: Let's think step by step. I am not going to lie, this is a complicated issue, and I don't see any solutions to all this, but it is still far more
```
