---
translated: true
---

# Dappier AI

**Dappier: Alimentando la IA con modelos de datos dinámicos y en tiempo real**

Dappier ofrece una plataforma de vanguardia que otorga a los desarrolladores acceso inmediato a una amplia variedad de modelos de datos en tiempo real que abarcan noticias, entretenimiento, finanzas, datos de mercado, clima y más. Con nuestros modelos de datos pre-entrenados, puedes impulsar tus aplicaciones de IA, asegurando que entreguen respuestas precisas y actualizadas, y minimizando las inexactitudes.

Los modelos de datos de Dappier te ayudan a construir aplicaciones LLM de última generación con contenido confiable y actualizado de las principales marcas del mundo. Libera tu creatividad y mejora cualquier aplicación GPT o flujo de trabajo de IA con datos propietarios y accionables a través de una API sencilla. Aumentar tu IA con datos propietarios de fuentes confiables es la mejor manera de garantizar respuestas factuales y actualizadas, sin importar la pregunta.

Para desarrolladores, por desarrolladores
Diseñado con los desarrolladores en mente, Dappier simplifica el camino desde la integración de datos hasta la monetización, brindando rutas claras y directas para implementar y ganar con tus modelos de IA. Experimenta el futuro de la infraestructura de monetización para el nuevo internet en **https://dappier.com/**.

Este ejemplo muestra cómo usar LangChain para interactuar con los modelos de IA de Dappier

-----------------------------------------------------------------------------------

Para usar uno de nuestros modelos de datos de IA de Dappier, necesitarás una clave API. Visita la plataforma Dappier (https://platform.dappier.com/) para iniciar sesión y crear una clave API en tu perfil.

Puedes encontrar más detalles en la referencia de la API: https://docs.dappier.com/introduction

Para trabajar con nuestro modelo de chat Dappier, puedes pasar la clave directamente a través del parámetro llamado dappier_api_key al iniciar la clase
o establecerla como una variable de entorno.

```bash
export DAPPIER_API_KEY="..."
```

```python
from langchain_community.chat_models.dappier import ChatDappierAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatDappierAI(
    dappier_endpoint="https://api.dappier.com/app/datamodelconversation",
    dappier_model="dm_01hpsxyfm2fwdt2zet9cg6fdxt",
    dappier_api_key="...",
)
```

```python
messages = [HumanMessage(content="Who won the super bowl in 2024?")]
chat.invoke(messages)
```

```output
AIMessage(content='Hey there! The Kansas City Chiefs won Super Bowl LVIII in 2024. They beat the San Francisco 49ers in overtime with a final score of 25-22. It was quite the game! 🏈')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='The Kansas City Chiefs won Super Bowl LVIII in 2024! 🏈')
```
