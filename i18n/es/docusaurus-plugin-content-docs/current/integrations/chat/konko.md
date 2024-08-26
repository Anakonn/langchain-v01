---
sidebar_label: Konko
translated: true
---

# ChatKonko

# Konko

>[Konko](https://www.konko.ai/) API es una API web totalmente administrada diseñada para ayudar a los desarrolladores de aplicaciones a:

1. **Seleccionar** los LLM de código abierto o propietarios adecuados para su aplicación
2. **Construir** aplicaciones más rápido con integraciones a los principales marcos de aplicaciones y APIs totalmente administradas
3. **Ajustar finamente** los LLM de código abierto más pequeños para lograr un rendimiento líder en la industria a una fracción del costo
4. **Implementar API a escala de producción** que cumplan con los SLA de seguridad, privacidad, rendimiento y latencia sin configuración ni administración de infraestructura, utilizando la infraestructura multicloud compatible con SOC 2 de Konko AI

Este ejemplo explica cómo usar LangChain para interactuar con los [modelos](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-chatcompletion) de ChatCompletion de `Konko`

Para ejecutar este cuaderno, necesitará una clave API de Konko. Inicie sesión en nuestra aplicación web para [crear una clave API](https://platform.konko.ai/settings/api-keys) para acceder a los modelos

```python
from langchain_community.chat_models import ChatKonko
from langchain_core.messages import HumanMessage, SystemMessage
```

#### Establecer variables de entorno

1. Puede establecer variables de entorno para
   1. KONKO_API_KEY (Requerido)
   2. OPENAI_API_KEY (Opcional)
2. En la sesión de shell actual, use el comando export:

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## Llamar a un modelo

Encuentra un modelo en la [página de información general de Konko](https://docs.konko.ai/docs/list-of-models)

Otra forma de encontrar la lista de modelos que se ejecutan en la instancia de Konko es a través de este [endpoint](https://docs.konko.ai/reference/get-models).

A partir de aquí, podemos inicializar nuestro modelo:

```python
chat = ChatKonko(max_tokens=400, model="meta-llama/llama-2-13b-chat")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Explain Big Bang Theory briefly"),
]
chat(messages)
```

```output
AIMessage(content="  Sure thing! The Big Bang Theory is a scientific theory that explains the origins of the universe. In short, it suggests that the universe began as an infinitely hot and dense point around 13.8 billion years ago and expanded rapidly. This expansion continues to this day, and it's what makes the universe look the way it does.\n\nHere's a brief overview of the key points:\n\n1. The universe started as a singularity, a point of infinite density and temperature.\n2. The singularity expanded rapidly, causing the universe to cool and expand.\n3. As the universe expanded, particles began to form, including protons, neutrons, and electrons.\n4. These particles eventually came together to form atoms, and later, stars and galaxies.\n5. The universe is still expanding today, and the rate of this expansion is accelerating.\n\nThat's the Big Bang Theory in a nutshell! It's a pretty mind-blowing idea when you think about it, and it's supported by a lot of scientific evidence. Do you have any other questions about it?")
```
