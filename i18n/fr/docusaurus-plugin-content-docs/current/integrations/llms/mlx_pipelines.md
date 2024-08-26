---
translated: true
---

# Pipelines locales MLX

Les modèles MLX peuvent être exécutés localement via la classe `MLXPipeline`.

La [communauté MLX](https://huggingface.co/mlx-community) héberge plus de 150 modèles, tous open source et publiquement disponibles sur Hugging Face Model Hub, une plateforme en ligne où les gens peuvent facilement collaborer et construire des ML ensemble.

Ceux-ci peuvent être appelés à partir de LangChain soit via ce wrapper de pipeline local, soit en appelant leurs points de terminaison d'inférence hébergés via la classe MlXPipeline. Pour plus d'informations sur mlx, consultez le [notebook du référentiel d'exemples](https://github.com/ml-explore/mlx-examples/tree/main/llms).

Pour utiliser, vous devez avoir le package python `mlx-lm` [installé](https://pypi.org/project/mlx-lm/), ainsi que [transformers](https://pypi.org/project/transformers/). Vous pouvez également installer `huggingface_hub`.

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

### Chargement du modèle

Les modèles peuvent être chargés en spécifiant les paramètres du modèle à l'aide de la méthode `from_model_id`.

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

pipe = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

Ils peuvent également être chargés en passant directement un pipeline `transformers` existant

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from mlx_lm import load

model, tokenizer = load("mlx-community/quantized-gemma-2b-it")
pipe = MLXPipeline(model=model, tokenizer=tokenizer)
```

### Créer une chaîne

Avec le modèle chargé en mémoire, vous pouvez le composer avec une invite pour former une chaîne.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | pipe

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```
