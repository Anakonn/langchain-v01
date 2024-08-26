---
translated: true
---

# Xorbits Inference (Xinference)

[Xinference](https://github.com/xorbitsai/inference) est une bibliothèque puissante et polyvalente conçue pour servir les LLM, les modèles de reconnaissance vocale et les modèles multimodaux, même sur votre ordinateur portable. Elle prend en charge une variété de modèles compatibles avec GGML, tels que chatglm, baichuan, whisper, vicuna, orca et bien d'autres. Ce notebook montre comment utiliser Xinference avec LangChain.

## Installation

Installez `Xinference` via PyPI :

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## Déployer Xinference localement ou dans un cluster distribué.

Pour un déploiement local, exécutez `xinference`.

Pour déployer Xinference dans un cluster, commencez par démarrer un superviseur Xinference à l'aide de `xinference-supervisor`. Vous pouvez également utiliser l'option -p pour spécifier le port et -H pour spécifier l'hôte. Le port par défaut est 9997.

Ensuite, démarrez les workers Xinference à l'aide de `xinference-worker` sur chaque serveur sur lequel vous voulez les exécuter.

Vous pouvez consulter le fichier README de [Xinference](https://github.com/xorbitsai/inference) pour plus d'informations.

## Wrapper

Pour utiliser Xinference avec LangChain, vous devez d'abord lancer un modèle. Vous pouvez utiliser l'interface en ligne de commande (CLI) pour le faire :

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 7167b2b0-2a04-11ee-83f0-d29396a3f064
```

Un ID de modèle vous est retourné pour que vous puissiez l'utiliser. Maintenant, vous pouvez utiliser Xinference avec LangChain :

```python
from langchain_community.llms import Xinference

llm = Xinference(
    server_url="http://0.0.0.0:9997", model_uid="7167b2b0-2a04-11ee-83f0-d29396a3f064"
)

llm(
    prompt="Q: where can we visit in the capital of France? A:",
    generate_config={"max_tokens": 1024, "stream": True},
)
```

```output
' You can visit the Eiffel Tower, Notre-Dame Cathedral, the Louvre Museum, and many other historical sites in Paris, the capital of France.'
```

### Intégrer avec un LLMChain

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "Where can we visit in the capital of {country}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(country="France")
print(generated)
```

```output

A: You can visit many places in Paris, such as the Eiffel Tower, the Louvre Museum, Notre-Dame Cathedral, the Champs-Elysées, Montmartre, Sacré-Cœur, and the Palace of Versailles.
```

Enfin, terminez le modèle lorsque vous n'avez plus besoin de l'utiliser :

```python
!xinference terminate --model-uid "7167b2b0-2a04-11ee-83f0-d29396a3f064"
```
