---
translated: true
---

# Recherche Exa

L'intégration de recherche d'Exa existe dans son propre [package partenaire](https://pypi.org/project/langchain-exa/). Vous pouvez l'installer avec :

```python
%pip install -qU langchain-exa
```

Pour utiliser le package, vous devrez également définir la variable d'environnement `EXA_API_KEY` avec votre clé API Exa.

## Retriever

Vous pouvez utiliser le [`ExaSearchRetriever`](/docs/integrations/tools/exa_search#using-exasearchretriever) dans un pipeline de récupération standard. Vous pouvez l'importer comme suit :

```python
from langchain_exa import ExaSearchRetriever
```

## Outils

Vous pouvez utiliser Exa comme outil d'agent comme décrit dans la [documentation sur l'appel d'outils Exa](/docs/integrations/tools/exa_search#using-the-exa-sdk-as-langchain-agent-tools).
