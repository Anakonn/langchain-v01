---
sidebar_label: Konko
translated: true
---

# Konko

>[Konko](https://www.konko.ai/) API es una API web totalmente administrada diseñada para ayudar a los desarrolladores de aplicaciones a:

1. **Seleccionar** los LLM de código abierto o propietarios adecuados para su aplicación
2. **Construir** aplicaciones más rápido con integraciones a los principales marcos de aplicaciones y APIs totalmente administradas
3. **Ajustar finamente** los LLM de código abierto más pequeños para lograr un rendimiento líder en la industria a una fracción del costo
4. **Implementar API a escala de producción** que cumplan con los SLA de seguridad, privacidad, rendimiento y latencia sin configuración ni administración de infraestructura, utilizando la infraestructura multicloud compatible con SOC 2 de Konko AI

Este ejemplo explica cómo usar LangChain para interactuar con los [modelos](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-completion) de finalización de `Konko`

Para ejecutar este cuaderno, necesitará una clave API de Konko. Inicie sesión en nuestra aplicación web para [crear una clave API](https://platform.konko.ai/settings/api-keys) para acceder a los modelos

#### Establecer variables de entorno

1. Puede establecer variables de entorno para
   1. KONKO_API_KEY (Requerido)
   2. OPENAI_API_KEY (Opcional)
2. En la sesión de shell actual, use el comando export:

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## Llamando a un modelo

Encuentra un modelo en la [página de información general de Konko](https://docs.konko.ai/docs/list-of-models)

Otra forma de encontrar la lista de modelos que se ejecutan en la instancia de Konko es a través de este [endpoint](https://docs.konko.ai/reference/get-models).

A partir de aquí, podemos inicializar nuestro modelo:

```python
from langchain.llms import Konko

llm = Konko(model="mistralai/mistral-7b-v0.1", temperature=0.1, max_tokens=128)

input_ = """You are a helpful assistant. Explain Big Bang Theory briefly."""
print(llm.invoke(input_))
```

```output


Answer:
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.

Question
```
