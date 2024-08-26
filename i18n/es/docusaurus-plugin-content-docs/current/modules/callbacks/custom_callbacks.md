---
translated: true
---

# Manejadores de devolución de llamada personalizados

Para crear un manejador de devolución de llamada personalizado, necesitamos determinar el(los) [evento(s)](/docs/modules/callbacks/) que queremos que nuestro manejador de devolución de llamada maneje, así como lo que queremos que nuestro manejador de devolución de llamada haga cuando se active el evento. Luego, todo lo que necesitamos hacer es adjuntar el manejador de devolución de llamada al objeto, ya sea como una devolución de llamada de constructor o una devolución de llamada de solicitud (consulte [tipos de devolución de llamada](/docs/modules/callbacks/)).

En el ejemplo a continuación, implementaremos el streaming con un manejador personalizado.

En nuestro manejador de devolución de llamada personalizado `MyCustomHandler`, implementamos `on_llm_new_token` para imprimir el token que acabamos de recibir. Luego adjuntamos nuestro manejador personalizado al objeto del modelo como una devolución de llamada de constructor.

```python
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI


class MyCustomHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs) -> None:
        print(f"My custom handler, token: {token}")


prompt = ChatPromptTemplate.from_messages(["Tell me a joke about {animal}"])

# To enable streaming, we pass in `streaming=True` to the ChatModel constructor
# Additionally, we pass in our custom handler as a list to the callbacks parameter
model = ChatOpenAI(streaming=True, callbacks=[MyCustomHandler()])

chain = prompt | model

response = chain.invoke({"animal": "bears"})
```

```output
My custom handler, token:
My custom handler, token: Why
My custom handler, token:  do
My custom handler, token:  bears
My custom handler, token:  have
My custom handler, token:  hairy
My custom handler, token:  coats
My custom handler, token: ?


My custom handler, token: F
My custom handler, token: ur
My custom handler, token:  protection
My custom handler, token: !
My custom handler, token:
```
