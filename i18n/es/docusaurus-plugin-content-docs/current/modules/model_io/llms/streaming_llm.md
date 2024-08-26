---
translated: true
---

# Transmisión en secuencia

Todos los `LLM` implementan la interfaz `Runnable`, que viene con implementaciones predeterminadas de todos los métodos, es decir, `ainvoke`, `batch`, `abatch`, `stream`, `astream`. Esto brinda a todos los `LLM` un soporte básico para la transmisión en secuencia.

El soporte de transmisión en secuencia predeterminado consiste en devolver un Iterador (o AsyncIterator en el caso de la transmisión en secuencia asíncrona) de un solo valor, el resultado final devuelto por el proveedor `LLM` subyacente. Obviamente, esto no le da la transmisión token por token, que requiere un soporte nativo del proveedor `LLM`, pero asegura que su código que espera un iterador de tokens pueda funcionar para cualquiera de nuestras integraciones `LLM`.

Consulte qué [integraciones admiten la transmisión token por token aquí](/docs/integrations/llms/).

```python
from langchain_openai import OpenAI

llm = OpenAI(model="gpt-3.5-turbo-instruct", temperature=0, max_tokens=512)
for chunk in llm.stream("Write me a song about sparkling water."):
    print(chunk, end="", flush=True)
```

```output


Verse 1:
Bubbles dancing in my glass
Clear and crisp, it's such a blast
Refreshing taste, it's like a dream
Sparkling water, you make me beam

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Verse 2:
No sugar, no calories, just pure bliss
You're the perfect drink, I must confess
From lemon to lime, so many flavors to choose
Sparkling water, you never fail to amuse

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Bridge:
Some may say you're just plain water
But to me, you're so much more
You bring a sparkle to my day
In every single way

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Outro:
So here's to you, my dear sparkling water
You'll always be my go-to drink forever
With your effervescence and refreshing taste
You'll always have a special place.
```
