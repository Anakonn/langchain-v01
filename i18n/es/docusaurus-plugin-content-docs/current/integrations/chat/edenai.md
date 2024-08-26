---
translated: true
---

# Eden AI

Eden AI está revolucionando el panorama de la IA al unir a los mejores proveedores de IA, capacitando a los usuarios para desbloquear posibilidades ilimitadas y aprovechar el verdadero potencial de la inteligencia artificial. Con una plataforma integral y sin complicaciones, permite a los usuarios implementar funciones de IA en producción de manera rápida, brindando un acceso sencillo a toda la gama de capacidades de IA a través de una sola API. (sitio web: https://edenai.co/)

Este ejemplo explica cómo usar LangChain para interactuar con los modelos de Eden AI

-----------------------------------------------------------------------------------

`EdenAI` va más allá de la mera invocación de modelos. Te empodera con funciones avanzadas, que incluyen:

- **Múltiples proveedores**: Obtén acceso a una diversa gama de modelos de lenguaje ofrecidos por varios proveedores, lo que te da la libertad de elegir el modelo más adecuado para tu caso de uso.

- **Mecanismo de respaldo**: Establece un mecanismo de respaldo para garantizar operaciones sin problemas incluso si el proveedor principal no está disponible, puedes cambiar fácilmente a un proveedor alternativo.

- **Seguimiento de uso**: Realiza un seguimiento de las estadísticas de uso por proyecto y por clave de API. Esta función te permite monitorear y gestionar eficazmente el consumo de recursos.

- **Monitoreo y observabilidad**: `EdenAI` proporciona herramientas de monitoreo y observabilidad completas en la plataforma. Monitorea el rendimiento de tus modelos de lenguaje, analiza los patrones de uso y obtén valiosas ideas para optimizar tus aplicaciones.

Acceder a la API de EDENAI requiere una clave de API,

que puedes obtener creando una cuenta https://app.edenai.run/user/register y dirigiéndote aquí https://app.edenai.run/admin/iam/api-keys

Una vez que tengamos una clave, la estableceremos como una variable de entorno ejecutando:

```bash
export EDENAI_API_KEY="..."
```

Puedes encontrar más detalles en la referencia de la API: https://docs.edenai.co/reference

Si prefieres no establecer una variable de entorno, puedes pasar la clave directamente a través del parámetro nombrado edenai_api_key

cuando se inicia la clase EdenAI Chat Model.

```python
from langchain_community.chat_models.edenai import ChatEdenAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatEdenAI(
    edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250
)
```

```python
messages = [HumanMessage(content="Hello !")]
chat.invoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## Streaming y Batching

`ChatEdenAI` admite streaming y batching. A continuación se muestra un ejemplo.

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Hello! How can I assist you today?
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='Hello! How can I assist you today?')]
```

## Mecanismo de respaldo

Con Eden AI puedes establecer un mecanismo de respaldo para garantizar operaciones sin problemas incluso si el proveedor principal no está disponible, puedes cambiar fácilmente a un proveedor alternativo.

```python
chat = ChatEdenAI(
    edenai_api_key="...",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
    fallback_providers="google",
)
```

En este ejemplo, puedes usar Google como proveedor de respaldo si OpenAI presenta algún problema.

Para obtener más información y detalles sobre Eden AI, consulta este enlace: : https://docs.edenai.co/docs/additional-parameters

## Encadenamiento de llamadas

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "What is a good name for a company that makes {product}?"
)
chain = prompt | chat
```

```python
chain.invoke({"product": "healthy snacks"})
```

```output
AIMessage(content='VitalBites')
```
