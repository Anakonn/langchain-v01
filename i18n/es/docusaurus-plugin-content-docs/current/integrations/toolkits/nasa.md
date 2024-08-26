---
translated: true
---

# NASA

Este cuaderno muestra cómo usar agentes para interactuar con el kit de herramientas de la NASA. El kit de herramientas proporciona acceso a la API de la Biblioteca de Imágenes y Videos de la NASA, con el potencial de expandirse e incluir otras API accesibles de la NASA en iteraciones futuras.

**Nota: Las consultas de búsqueda de la Biblioteca de Imágenes y Videos de la NASA pueden dar como resultado respuestas grandes cuando no se especifica el número de resultados de medios deseados. Considera esto antes de usar el agente con créditos de tokens de LLM.**

## Ejemplo de uso:

---

### Inicializar el agente

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

### Consultar activos de medios

```python
agent.run(
    "Can you find three pictures of the moon published between the years 2014 and 2020?"
)
```

### Consultar detalles sobre los activos de medios

```python
output = agent.run(
    "I've just queried an image of the moon with the NASA id NHQ_2019_0311_Go Forward to the Moon."
    " Where can I find the metadata manifest for this asset?"
)
```
