---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)** [Sambaverse](https://sambaverse.sambanova.ai/) et [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) sont des plateformes pour exécuter vos propres modèles open-source

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles SambaNova

## Sambaverse

**Sambaverse** vous permet d'interagir avec plusieurs modèles open-source. Vous pouvez afficher la liste des modèles disponibles et interagir avec eux dans le [playground](https://sambaverse.sambanova.ai/playground). **Veuillez noter que l'offre gratuite de Sambaverse est limitée en performance.** Les entreprises prêtes à évaluer les performances de production en tokens par seconde, le débit volumétrique et un coût total de possession (TCO) 10 fois inférieur des produits SambaNova doivent [nous contacter](https://sambaverse.sambanova.ai/contact-us) pour obtenir une instance d'évaluation illimitée.

Une clé d'API est requise pour accéder aux modèles Sambaverse. Pour obtenir une clé, créez un compte sur [sambaverse.sambanova.ai](https://sambaverse.sambanova.ai/)

Le package [sseclient-py](https://pypi.org/project/sseclient-py/) est nécessaire pour exécuter des prédictions en flux

```python
%pip install --quiet sseclient-py==1.8.0
```

Enregistrez votre clé d'API en tant que variable d'environnement :

```python
import os

sambaverse_api_key = "<Your sambaverse API key>"

# Set the environment variables
os.environ["SAMBAVERSE_API_KEY"] = sambaverse_api_key
```

Appelez les modèles Sambaverse directement depuis LangChain !

```python
from langchain_community.llms.sambanova import Sambaverse

llm = Sambaverse(
    sambaverse_model_name="Meta/llama-2-7b-chat-hf",
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        "process_prompt": True,
        "select_expert": "llama-2-7b-chat-hf",
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```

## SambaStudio

**SambaStudio** vous permet d'entraîner, d'exécuter des tâches d'inférence par lots et de déployer des points de terminaison d'inférence en ligne pour exécuter des modèles open source que vous avez affinés vous-même.

Un environnement SambaStudio est requis pour déployer un modèle. Obtenez plus d'informations sur [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)

Le package [sseclient-py](https://pypi.org/project/sseclient-py/) est nécessaire pour exécuter des prédictions en flux

```python
%pip install --quiet sseclient-py==1.8.0
```

Enregistrez vos variables d'environnement :

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_API_KEY"] = sambastudio_api_key
```

Appelez les modèles SambaStudio directement depuis LangChain !

```python
from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_logprobs": {"type": "int", "value": "0"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```
