---
translated: true
---

# Plantilla de comentarios del bot de chat

Esta plantilla muestra cómo evaluar tu bot de chat sin comentarios explícitos del usuario. Define un bot de chat simple en [chain.py](https://github.com/langchain-ai/langchain/blob/master/templates/chat-bot-feedback/chat_bot_feedback/chain.py) y un evaluador personalizado que califica la eficacia de la respuesta del bot en función de la respuesta del usuario posterior. Puedes aplicar este evaluador a tu propio bot de chat llamando a `with_config` en el bot de chat antes de servirlo. También puedes implementar directamente tu aplicación de chat usando esta plantilla.

Los [bots de chat](https://python.langchain.com/docs/use_cases/chatbots) son una de las interfaces más comunes para implementar LLM. La calidad de los bots de chat varía, lo que hace que el desarrollo continuo sea importante. Pero los usuarios no suelen dejar comentarios explícitos a través de mecanismos como botones de pulgar hacia arriba o hacia abajo. Además, los análisis tradicionales como la "duración de la sesión" o la "duración de la conversación" a menudo carecen de claridad. Sin embargo, las conversaciones de varios turnos con un bot de chat pueden proporcionar una gran cantidad de información, que podemos transformar en métricas para el ajuste fino, la evaluación y el análisis de productos.

Tomando [Chat Langchain](https://chat.langchain.com/) como un caso de estudio, solo alrededor del 0.04% de todas las consultas reciben comentarios explícitos. Sin embargo, aproximadamente el 70% de las consultas son seguimientos de preguntas anteriores. Una parte significativa de estas consultas de seguimiento continúan con información útil que podemos usar para inferir la calidad de la respuesta de IA anterior.

Esta plantilla ayuda a resolver este problema de "escasez de comentarios". A continuación se muestra un ejemplo de invocación de este bot de chat:

[](https://smith.langchain.com/public/3378daea-133c-4fe8-b4da-0a3044c5dbe8/r?runtab=1)

Cuando el usuario responde a esto ([link](https://smith.langchain.com/public/a7e2df54-4194-455d-9978-cecd8be0df1e/r)), se invoca el evaluador de respuestas, lo que da como resultado la siguiente ejecución de evaluación:

[](https://smith.langchain.com/public/534184ee-db8f-4831-a386-3f578145114c/r)

Como se muestra, el evaluador ve que el usuario está cada vez más frustrado, lo que indica que la respuesta anterior no fue efectiva.

## Comentarios de LangSmith

[LangSmith](https://smith.langchain.com/) es una plataforma para construir aplicaciones de LLM de nivel de producción. Más allá de sus funciones de depuración y evaluación fuera de línea, LangSmith le ayuda a capturar comentarios tanto de los usuarios como de los modelos asistidos para refinar su aplicación de LLM. Esta plantilla usa un LLM para generar comentarios para su aplicación, que puede usar para mejorar continuamente su servicio. Para más ejemplos sobre cómo recopilar comentarios usando LangSmith, consulte la [documentación](https://docs.smith.langchain.com/cookbook/feedback-examples).

## Implementación del evaluador

Los comentarios del usuario se infieren mediante un `RunEvaluator` personalizado. Este evaluador se llama usando el `EvaluatorCallbackHandler`, que lo ejecuta en un subproceso separado para evitar interferir con el tiempo de ejecución del bot de chat. Puedes usar este evaluador personalizado en cualquier bot de chat compatible llamando a la siguiente función en tu objeto LangChain:

```python
my_chain.with_config(
    callbacks=[
        EvaluatorCallbackHandler(
            evaluators=[
                ResponseEffectivenessEvaluator(evaluate_response_effectiveness)
            ]
        )
    ],
)
```

El evaluador instruye a un LLM, específicamente `gpt-3.5-turbo`, para evaluar el mensaje de chat más reciente de la IA en función de la respuesta de seguimiento del usuario. Genera una puntuación y un razonamiento adjunto que se convierten en comentarios en LangSmith, aplicados al valor proporcionado como el `last_run_id`.

El prompt utilizado dentro del LLM [está disponible en el hub](https://smith.langchain.com/hub/wfh/response-effectiveness). Siéntete libre de personalizarlo con cosas como contexto adicional de la aplicación (como el objetivo de la aplicación o los tipos de preguntas a las que debería responder) o "síntomas" en los que te gustaría que se centrara el LLM. Este evaluador también utiliza la API de llamada a funciones de OpenAI para garantizar una salida más consistente y estructurada para la calificación.

## Variables de entorno

Asegúrate de que `OPENAI_API_KEY` esté configurado para usar los modelos de OpenAI. También configura LangSmith estableciendo tu `LANGSMITH_API_KEY`.

```bash
export OPENAI_API_KEY=sk-...
export LANGSMITH_API_KEY=...
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=my-project # Set to the project you want to save to
```

## Uso

Si se implementa a través de `LangServe`, recomendamos configurar el servidor para que devuelva eventos de devolución de llamada también. Esto asegurará que los rastros del backend se incluyan en cualquier rastro que generes usando el `RemoteRunnable`.

```python
from chat_bot_feedback.chain import chain

add_routes(app, chain, path="/chat-bot-feedback", include_callback_events=True)
```

Con el servidor en ejecución, puedes usar el siguiente fragmento de código para transmitir las respuestas del bot de chat para una conversación de 2 turnos.

```python
<!--IMPORTS:[{"imported": "tracing_v2_enabled", "source": "langchain.callbacks.manager", "docs": "https://api.python.langchain.com/en/latest/tracers/langchain_core.tracers.context.tracing_v2_enabled.html", "title": "Chat Bot Feedback Template"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.base.BaseMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "Chat Bot Feedback Template"}]-->
from functools import partial
from typing import Dict, Optional, Callable, List
from langserve import RemoteRunnable
from langchain.callbacks.manager import tracing_v2_enabled
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage

# Update with the URL provided by your LangServe server
chain = RemoteRunnable("http://127.0.0.1:8031/chat-bot-feedback")

def stream_content(
    text: str,
    chat_history: Optional[List[BaseMessage]] = None,
    last_run_id: Optional[str] = None,
    on_chunk: Callable = None,
):
    results = []
    with tracing_v2_enabled() as cb:
        for chunk in chain.stream(
            {"text": text, "chat_history": chat_history, "last_run_id": last_run_id},
        ):
            on_chunk(chunk)
            results.append(chunk)
        last_run_id = cb.latest_run.id if cb.latest_run else None
    return last_run_id, "".join(results)

chat_history = []
text = "Where are my keys?"
last_run_id, response_message = stream_content(text, on_chunk=partial(print, end=""))
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
text = "I CAN'T FIND THEM ANYWHERE"  # The previous response will likely receive a low score,
# as the user's frustration appears to be escalating.
last_run_id, response_message = stream_content(
    text,
    chat_history=chat_history,
    last_run_id=str(last_run_id),
    on_chunk=partial(print, end=""),
)
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
```

Esto usa el administrador de devolución de llamada `tracing_v2_enabled` para obtener el ID de ejecución de la llamada, que proporcionamos en las llamadas posteriores en el mismo hilo de chat, para que el evaluador pueda asignar comentarios a la traza apropiada.

## Conclusión

Esta plantilla proporciona una definición de bot de chat simple que puedes implementar directamente usando LangServe. Define un evaluador personalizado para registrar los comentarios de evaluación del bot sin calificaciones explícitas del usuario. Esta es una forma efectiva de aumentar tus análisis y seleccionar mejor los puntos de datos para el ajuste fino y la evaluación.
