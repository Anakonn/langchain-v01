---
translated: true
---

# Analizadores de salida personalizados

En algunas situaciones, es posible que desee implementar un analizador personalizado para estructurar la salida del modelo en un formato personalizado.

Hay dos formas de implementar un analizador personalizado:

1. Usando `RunnableLambda` o `RunnableGenerator` en LCEL: recomendamos encarecidamente este enfoque para la mayoría de los casos de uso.
2. Heredando de una de las clases base para el análisis: esta es la forma difícil de hacer las cosas.

La diferencia entre los dos enfoques es principalmente superficial y se encuentra principalmente en términos de qué devoluciones de llamada se activan (por ejemplo, `on_chain_start` vs. `on_parser_start`) y cómo se puede visualizar una lambda ejecutable frente a un analizador en una plataforma de seguimiento como LangSmith.

## Lambdas y generadores ejecutables

¡La forma recomendada de analizar es usar **lambdas ejecutables** y **generadores ejecutables**!

Aquí, crearemos un análisis simple que invierte el caso de la salida del modelo.

Por ejemplo, si el modelo produce: "Meow", el analizador producirá "mEOW".

```python
from typing import Iterable

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage, AIMessageChunk

model = ChatAnthropic(model_name="claude-2.1")


def parse(ai_message: AIMessage) -> str:
    """Parse the AI message."""
    return ai_message.content.swapcase()


chain = model | parse
chain.invoke("hello")
```

```output
'hELLO!'
```

:::tip

LCEL actualiza automáticamente la función `parse` a `RunnableLambda(parse)` cuando se compone usando la sintaxis `|`.

Si no te gusta, puedes importar manualmente `RunnableLambda` y luego ejecutar `parse = RunnableLambda(parse)`.
:::

¿Funciona el streaming?

```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```

```output
i'M cLAUDE, AN ai ASSISTANT CREATED BY aNTHROPIC TO BE HELPFUL, HARMLESS, AND HONEST.|
```

No, no funciona porque el analizador agrega la entrada antes de analizar la salida.

Si queremos implementar un analizador de transmisión, podemos hacer que el analizador acepte un iterable sobre la entrada y generar los resultados a medida que estén disponibles.

```python
from langchain_core.runnables import RunnableGenerator


def streaming_parse(chunks: Iterable[AIMessageChunk]) -> Iterable[str]:
    for chunk in chunks:
        yield chunk.content.swapcase()


streaming_parse = RunnableGenerator(streaming_parse)
```

:::important

Envuelve el analizador de transmisión en `RunnableGenerator` ya que es posible que dejemos de actualizarlo automáticamente con la sintaxis `|`.
:::

```python
chain = model | streaming_parse
chain.invoke("hello")
```

```output
'hELLO!'
```

¡Confirmemos que la transmisión funciona!

```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```

```output
i|'M| cLAUDE|,| AN| ai| ASSISTANT| CREATED| BY| aN|THROP|IC| TO| BE| HELPFUL|,| HARMLESS|,| AND| HONEST|.|
```

## Heredar de las clases base de análisis

Otro enfoque para implementar un analizador es heredar de `BaseOutputParser`, `BaseGenerationOutputParser` u otro de los analizadores base, dependiendo de lo que necesite hacer.

En general, **no** recomendamos este enfoque para la mayoría de los casos de uso, ya que resulta en más código para escribir sin beneficios significativos.

El tipo más simple de analizador de salida extiende la clase `BaseOutputParser` y debe implementar los siguientes métodos:

* `parse`: toma la salida de cadena del modelo y la analiza.
* (opcional) `_type`: identifica el nombre del analizador.

Cuando la salida del modelo de chat o LLM está mal formada, puede lanzar una `OutputParserException` para indicar que el análisis falla debido a una entrada incorrecta. El uso de esta excepción permite que el código que utiliza el analizador la maneje de manera consistente.

:::tip ¡Los analizadores son ejecutables! 🏃

Debido a que `BaseOutputParser` implementa la interfaz `Runnable`, cualquier analizador personalizado que crees de esta manera se convertirá en Runnables válidos de LangChain y se beneficiará del soporte asíncrono automático, la interfaz por lotes, el soporte de registro, etc.
:::

### Analizador simple

Aquí hay un analizador simple que puede analizar una representación de **cadena** de un booleano (por ejemplo, `YES` o `NO`) y convertirlo en el tipo `boolean` correspondiente.

```python
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import BaseOutputParser


# The [bool] desribes a parameterization of a generic.
# It's basically indicating what the return type of parse is
# in this case the return type is either True or False
class BooleanOutputParser(BaseOutputParser[bool]):
    """Custom boolean parser."""

    true_val: str = "YES"
    false_val: str = "NO"

    def parse(self, text: str) -> bool:
        cleaned_text = text.strip().upper()
        if cleaned_text not in (self.true_val.upper(), self.false_val.upper()):
            raise OutputParserException(
                f"BooleanOutputParser expected output value to either be "
                f"{self.true_val} or {self.false_val} (case-insensitive). "
                f"Received {cleaned_text}."
            )
        return cleaned_text == self.true_val.upper()

    @property
    def _type(self) -> str:
        return "boolean_output_parser"
```

```python
parser = BooleanOutputParser()
parser.invoke("YES")
```

```output
True
```

```python
try:
    parser.invoke("MEOW")
except Exception as e:
    print(f"Triggered an exception of type: {type(e)}")
```

```output
Triggered an exception of type: <class 'langchain_core.exceptions.OutputParserException'>
```

Probemos cambiar la parametrización

```python
parser = BooleanOutputParser(true_val="OKAY")
parser.invoke("OKAY")
```

```output
True
```

Confirmemos que otros métodos LCEL están presentes

```python
parser.batch(["OKAY", "NO"])
```

```output
[True, False]
```

```python
await parser.abatch(["OKAY", "NO"])
```

```output
[True, False]
```

```python
from langchain_anthropic.chat_models import ChatAnthropic

anthropic = ChatAnthropic(model_name="claude-2.1")
anthropic.invoke("say OKAY or NO")
```

```output
AIMessage(content='OKAY')
```

¡Probemos que nuestro analizador funciona!

```python
chain = anthropic | parser
chain.invoke("say OKAY or NO")
```

```output
True
```

:::note
¡El analizador funcionará tanto con la salida de un LLM (una cadena) como con la salida de un modelo de chat (un `AIMessage`)!
:::

### Analizar las salidas crudas del modelo

A veces hay metadatos adicionales en la salida del modelo que son importantes además del texto sin procesar. Un ejemplo de esto es la llamada de herramientas, donde los argumentos destinados a pasarse a las funciones llamadas se devuelven en una propiedad separada. Si necesita este control más detallado, puede subclasificar la clase `BaseGenerationOutputParser`.

Esta clase requiere un solo método `parse_result`. Este método toma la salida cruda del modelo (por ejemplo, una lista de `Generation` o `ChatGeneration`) y devuelve la salida analizada.

Admitir tanto `Generation` como `ChatGeneration` permite que el analizador funcione tanto con LLM regulares como con modelos de chat.

```python
from typing import List

from langchain_core.exceptions import OutputParserException
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import BaseGenerationOutputParser
from langchain_core.outputs import ChatGeneration, Generation


class StrInvertCase(BaseGenerationOutputParser[str]):
    """An example parser that inverts the case of the characters in the message.

    This is an example parse shown just for demonstration purposes and to keep
    the example as simple as possible.
    """

    def parse_result(self, result: List[Generation], *, partial: bool = False) -> str:
        """Parse a list of model Generations into a specific format.

        Args:
            result: A list of Generations to be parsed. The Generations are assumed
                to be different candidate outputs for a single model input.
                Many parsers assume that only a single generation is passed it in.
                We will assert for that
            partial: Whether to allow partial results. This is used for parsers
                     that support streaming
        """
        if len(result) != 1:
            raise NotImplementedError(
                "This output parser can only be used with a single generation."
            )
        generation = result[0]
        if not isinstance(generation, ChatGeneration):
            # Say that this one only works with chat generations
            raise OutputParserException(
                "This output parser can only be used with a chat generation."
            )
        return generation.message.content.swapcase()


chain = anthropic | StrInvertCase()
```

¡Probemos el nuevo analizador! Debería estar invirtiendo la salida del modelo.

```python
chain.invoke("Tell me a short sentence about yourself")
```

```output
'hELLO! mY NAME IS cLAUDE.'
```
