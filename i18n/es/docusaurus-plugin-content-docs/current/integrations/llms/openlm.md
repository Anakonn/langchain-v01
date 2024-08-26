---
translated: true
---

# OpenLM

[OpenLM](https://github.com/r2d4/openlm) es un proveedor de LLM compatible con OpenAI sin dependencias que puede llamar a diferentes puntos finales de inferencia directamente a través de HTTP.

Implementa la clase OpenAI Completion para que pueda usarse como un reemplazo instantáneo de la API de OpenAI. Este conjunto de cambios utiliza BaseOpenAI para un código adicional mínimo.

Este ejemplo explica cómo usar LangChain para interactuar tanto con OpenAI como con HuggingFace. Necesitarás claves API de ambos.

### Configuración

Instala las dependencias y establece las claves API.

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

### Uso de LangChain con OpenLM

Aquí vamos a llamar a dos modelos en una LLMChain, `text-davinci-003` de OpenAI y `gpt2` en HuggingFace.

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
