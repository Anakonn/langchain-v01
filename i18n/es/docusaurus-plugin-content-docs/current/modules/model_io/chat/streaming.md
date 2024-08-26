---
sidebar_position: 1.5
translated: true
---

# Transmisión en Vivo

Todos los ChatModels implementan la interfaz Runnable, que viene con implementaciones predeterminadas de todos los métodos, es decir, ainvoke, batch, abatch, stream, astream. Esto brinda a todos los ChatModels un soporte básico para la transmisión en vivo.

El soporte de transmisión en vivo predeterminado se basa en devolver un Iterator (o AsyncIterator en el caso de la transmisión asincrónica) de un solo valor, el resultado final devuelto por el proveedor de ChatModel subyacente. Obviamente, esto no le da la transmisión token por token, que requiere un soporte nativo del proveedor de ChatModel, pero asegura que su código que espera un iterador de tokens pueda funcionar para cualquiera de nuestras integraciones de ChatModel.

Consulte qué [integraciones admiten la transmisión token por token aquí](/docs/integrations/chat/).

```python
from langchain_community.chat_models import ChatAnthropic
```

```python
chat = ChatAnthropic(model="claude-2")
for chunk in chat.stream("Write me a song about goldfish on the moon"):
    print(chunk.content, end="", flush=True)
```

```output
 Here's a song I just improvised about goldfish on the moon:

Floating in space, looking for a place
To call their home, all alone
Swimming through stars, these goldfish from Mars
Left their fishbowl behind, a new life to find
On the moon, where the craters loom
Searching for food, maybe some lunar food
Out of their depth, close to death
How they wish, for just one small fish
To join them up here, their future unclear
On the moon, where the Earth looms
Dreaming of home, filled with foam
Their bodies adapt, continuing to last
On the moon, where they learn to swoon
Over cheese that astronauts tease
As they stare back at Earth, the planet of birth
These goldfish out of water, swim on and on
Lunar pioneers, conquering their fears
On the moon, where they happily swoon
```
