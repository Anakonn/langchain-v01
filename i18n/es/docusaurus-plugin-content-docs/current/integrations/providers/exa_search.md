---
translated: true
---

# Búsqueda de Exa

La integración de búsqueda de Exa existe en su propio [paquete asociado](https://pypi.org/project/langchain-exa/). Puedes instalarlo con:

```python
%pip install -qU langchain-exa
```

Para usar el paquete, también deberás establecer la variable de entorno `EXA_API_KEY` con tu clave API de Exa.

## Recuperador

Puedes usar el [`ExaSearchRetriever`](/docs/integrations/tools/exa_search#using-exasearchretriever) en una canalización de recuperación estándar. Puedes importarlo de la siguiente manera:

```python
from langchain_exa import ExaSearchRetriever
```

## Herramientas

Puedes usar Exa como una herramienta de agente como se describe en la [documentación de llamada a herramientas de Exa](/docs/integrations/tools/exa_search#using-the-exa-sdk-as-langchain-agent-tools).
