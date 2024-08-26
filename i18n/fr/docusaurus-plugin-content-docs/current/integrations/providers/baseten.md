---
translated: true
---

# Baseten

>[Baseten](https://baseten.co) est un fournisseur de toute l'infrastructure dont vous avez besoin pour déployer et servir
> des modèles ML de manière performante, évolutive et rentable.

>En tant que plateforme d'inférence de modèle, `Baseten` est un `Fournisseur` dans l'écosystème LangChain.
L'intégration `Baseten` implémente actuellement un seul `Composant`, les LLM, mais d'autres sont prévus !

>`Baseten` vous permet d'exécuter à la fois des modèles open source comme Llama 2 ou Mistral et d'exécuter des modèles propriétaires ou
affinés sur des GPU dédiés. Si vous êtes habitué à un fournisseur comme OpenAI, l'utilisation de Baseten présente quelques différences :

>* Plutôt que de payer par jeton, vous payez par minute de GPU utilisé.
>* Chaque modèle sur Baseten utilise [Truss](https://truss.baseten.co/welcome), notre cadre d'emballage de modèle open source, pour une personnalisation maximale.
>* Bien que nous ayons quelques modèles [compatibles avec OpenAI ChatCompletions](https://docs.baseten.co/api-reference/openai), vous pouvez définir votre propre spécification d'E/S avec `Truss`.

>[En savoir plus](https://docs.baseten.co/deploy/lifecycle) sur les identifiants de modèle et les déploiements.

>En savoir plus sur Baseten dans [la documentation Baseten](https://docs.baseten.co/).

## Installation et configuration

Vous aurez besoin de deux choses pour utiliser les modèles Baseten avec LangChain :

- Un [compte Baseten](https://baseten.co)
- Une [clé API](https://docs.baseten.co/observability/api-keys)

Exportez votre clé API dans votre environnement en tant que variable d'environnement appelée `BASETEN_API_KEY`.

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

## LLMs

Voir un [exemple d'utilisation](/docs/integrations/llms/baseten).

```python
<!--IMPORTS:[{"imported": "Baseten", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.baseten.Baseten.html", "title": "Baseten"}]-->
from langchain_community.llms import Baseten
```
