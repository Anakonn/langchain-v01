---
sidebar_class_name: hidden
translated: true
---

# Uso de herramientas y agentes

Un caso de uso emocionante para los LLM es la construcción de interfaces de lenguaje natural para otras "herramientas", ya sean APIs, funciones, bases de datos, etc. LangChain es excelente para construir dichas interfaces porque tiene:

- Buen análisis de la salida del modelo, lo que facilita la extracción de JSON, XML, llamadas a funciones de OpenAI, etc. de las salidas del modelo.
- Una gran colección de [Herramientas](/docs/integrations/tools) incorporadas.
- Proporciona mucha flexibilidad en la forma de llamar a estas herramientas.

Hay dos formas principales de usar herramientas: [cadenas](/docs/modules/chains) y [agentes](/docs/modules/agents/).

Las cadenas le permiten crear una secuencia predefinida de uso(s) de herramientas.

![chain](../../../../../../static/img/tool_chain.svg)

Los agentes permiten que el modelo use herramientas en un bucle, de modo que pueda decidir cuántas veces usar las herramientas.

![agent](../../../../../../static/img/tool_agent.svg)

Para comenzar con ambos enfoques, dirígete a la página [Inicio rápido](/docs/use_cases/tool_use/quickstart).
