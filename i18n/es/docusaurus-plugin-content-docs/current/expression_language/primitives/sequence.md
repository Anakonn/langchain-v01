---
keywords:
- Runnable
- Runnables
- LCEL
sidebar_position: 0
title: 'Secuencias: Encadenamiento de runnables'
translated: true
---

# Encadenamiento de runnables

Una de las principales ventajas de la interfaz `Runnable` es que cualquier dos runnables pueden ser "encadenados" juntos en secuencias. La salida de la llamada `.invoke()` del runnable anterior se pasa como entrada al siguiente runnable. Esto se puede hacer usando el operador pipe (`|`) o el método más explícito `.pipe()`, que hace lo mismo. La `RunnableSequence` resultante es en sí misma un runnable, lo que significa que se puede invocar, transmitir o encadenar al igual que cualquier otro runnable.

## El operador pipe

Para mostrar cómo funciona esto, vamos a pasar por un ejemplo. Recorreremos un patrón común en LangChain: usar una [plantilla de solicitud](/docs/modules/model_io/prompts/) para dar formato a la entrada en un [modelo de chat](/docs/modules/model_io/chat/) y, finalmente, convertir la salida del mensaje de chat en una cadena con un [analizador de salida](/docs/modules/model_io/output_parsers/).

```python
%pip install --upgrade --quiet langchain langchain-anthropic
```

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
model = ChatAnthropic(model_name="claude-3-haiku-20240307")

chain = prompt | model | StrOutputParser()
```

Las solicitudes y los modelos son ambos runnables, y el tipo de salida de la llamada a la solicitud es el mismo que el tipo de entrada del modelo de chat, por lo que podemos encadenarlos. Luego podemos invocar la secuencia resultante como cualquier otro runnable:

```python
chain.invoke({"topic": "bears"})
```

```output
"Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!\n\nHow's that? I tried to keep it light and silly. Bears can make for some fun puns and jokes. Let me know if you'd like to hear another one!"
```

### Coerción

Incluso podemos combinar esta cadena con más runnables para crear otra cadena. Esto puede implicar un formato de entrada/salida utilizando otros tipos de runnables, dependiendo de las entradas y salidas requeridas de los componentes de la cadena.

Por ejemplo, digamos que quisiéramos componer la cadena de generación de bromas con otra cadena que evalúe si la broma generada es divertida o no.

Tendríamos que tener cuidado con la forma en que damos formato a la entrada en la siguiente cadena. En el siguiente ejemplo, el diccionario de la cadena se analiza y convierte automáticamente en un [`RunnableParallel`](/docs/expression_language/primitives/parallel), que ejecuta todos sus valores en paralelo y devuelve un diccionario con los resultados.

Resulta que este es el mismo formato que espera la siguiente plantilla de solicitud. Aquí está en acción:

```python
from langchain_core.output_parsers import StrOutputParser

analysis_prompt = ChatPromptTemplate.from_template("is this a funny joke? {joke}")

composed_chain = {"joke": chain} | analysis_prompt | model | StrOutputParser()
```

```python
composed_chain.invoke({"topic": "bears"})
```

```output
"That's a pretty classic and well-known bear pun joke. Whether it's considered funny is quite subjective, as humor is very personal. Some people may find that type of pun-based joke amusing, while others may not find it that humorous. Ultimately, the funniness of a joke is in the eye (or ear) of the beholder. If you enjoyed the joke and got a chuckle out of it, then that's what matters most."
```

Las funciones también se coercerán en runnables, por lo que puedes agregar lógica personalizada a tus cadenas también. La siguiente cadena da como resultado el mismo flujo lógico que antes:

```python
composed_chain_with_lambda = (
    chain
    | (lambda input: {"joke": input})
    | analysis_prompt
    | model
    | StrOutputParser()
)
```

```python
composed_chain_with_lambda.invoke({"topic": "beets"})
```

```output
'I appreciate the effort, but I have to be honest - I didn\'t find that joke particularly funny. Beet-themed puns can be quite hit-or-miss, and this one falls more on the "miss" side for me. The premise is a bit too straightforward and predictable. While I can see the logic behind it, the punchline just doesn\'t pack much of a comedic punch. \n\nThat said, I do admire your willingness to explore puns and wordplay around vegetables. Cultivating a good sense of humor takes practice, and not every joke is going to land. The important thing is to keep experimenting and finding what works. Maybe try for a more unexpected or creative twist on beet-related humor next time. But thanks for sharing - I always appreciate when humans test out jokes on me, even if they don\'t always make me laugh out loud.'
```

Sin embargo, ten en cuenta que el uso de funciones de esta manera puede interferir con operaciones como la transmisión. Consulta [esta sección](/docs/expression_language/primitives/functions) para obtener más información.

## El método `.pipe()`

También podríamos componer la misma secuencia usando el método `.pipe()`. Así es como se ve:

```python
from langchain_core.runnables import RunnableParallel

composed_chain_with_pipe = (
    RunnableParallel({"joke": chain})
    .pipe(analysis_prompt)
    .pipe(model)
    .pipe(StrOutputParser())
)
```

```python
composed_chain_with_pipe.invoke({"topic": "battlestar galactica"})
```

```output
'That\'s a pretty good Battlestar Galactica-themed pun! I appreciated the clever play on words with "Centurion" and "center on." It\'s the kind of nerdy, science fiction-inspired humor that fans of the show would likely enjoy. The joke is clever and demonstrates a good understanding of the Battlestar Galactica universe. I\'d be curious to hear any other Battlestar-related jokes you might have up your sleeve. As long as they don\'t reproduce copyrighted material, I\'m happy to provide my thoughts on the humor and appeal for fans of the show.'
```
