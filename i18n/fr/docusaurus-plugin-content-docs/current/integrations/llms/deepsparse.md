---
translated: true
---

# DeepSparse

Cette page couvre comment utiliser le runtime d'inférence [DeepSparse](https://github.com/neuralmagic/deepsparse) dans LangChain.
Elle est divisée en deux parties : l'installation et la configuration, puis des exemples d'utilisation de DeepSparse.

## Installation et configuration

- Installez le package Python avec `pip install deepsparse`
- Choisissez un [modèle SparseZoo](https://sparsezoo.neuralmagic.com/?useCase=text_generation) ou exportez un modèle pris en charge vers ONNX [en utilisant Optimum](https://github.com/neuralmagic/notebooks/blob/main/notebooks/opt-text-generation-deepsparse-quickstart/OPT_Text_Generation_DeepSparse_Quickstart.md)

Il existe un wrapper LLM DeepSparse, qui fournit une interface unifiée pour tous les modèles :

```python
from langchain_community.llms import DeepSparse

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none"
)

print(llm.invoke("def fib():"))
```

Des paramètres supplémentaires peuvent être passés en utilisant le paramètre `config` :

```python
config = {"max_generated_tokens": 256}

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none",
    config=config,
)
```
