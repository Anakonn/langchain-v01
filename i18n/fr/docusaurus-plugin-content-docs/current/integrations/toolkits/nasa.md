---
translated: true
---

# NASA

Ce cahier montre comment utiliser des agents pour interagir avec la boîte à outils NASA. La boîte à outils fournit un accès à l'API de la NASA Image and Video Library, avec la possibilité de s'étendre et d'inclure d'autres API NASA accessibles dans les itérations futures.

**Remarque : les requêtes de recherche de la NASA Image and Video Library peuvent entraîner des réponses importantes lorsque le nombre de résultats multimédias souhaités n'est pas spécifié. Tenez-en compte avant d'utiliser l'agent avec des crédits de jetons LLM.**

## Exemple d'utilisation :

---

### Initialisation de l'agent

```python
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.nasa.toolkit import NasaToolkit
from langchain_community.utilities.nasa import NasaAPIWrapper
from langchain_openai import OpenAI

llm = OpenAI(temperature=0, openai_api_key="")
nasa = NasaAPIWrapper()
toolkit = NasaToolkit.from_nasa_api_wrapper(nasa)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

### Interrogation des actifs multimédias

```python
agent.run(
    "Can you find three pictures of the moon published between the years 2014 and 2020?"
)
```

### Interrogation des détails sur les actifs multimédias

```python
output = agent.run(
    "I've just queried an image of the moon with the NASA id NHQ_2019_0311_Go Forward to the Moon."
    " Where can I find the metadata manifest for this asset?"
)
```
