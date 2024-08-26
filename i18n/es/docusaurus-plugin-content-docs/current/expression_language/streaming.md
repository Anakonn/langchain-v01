---
sidebar_position: 1.5
title: Transmisión
translated: true
---

# Transmisión Con LangChain

La transmisión es crítica para hacer que las aplicaciones basadas en LLMs se sientan receptivas para los usuarios finales.

Primitivas importantes de LangChain como LLMs, parsers, prompts, retrievers y agentes implementan la [Interfaz Runnable](/docs/expression_language/interface) de LangChain.

Esta interfaz proporciona dos enfoques generales para transmitir contenido:

1. sync `stream` y async `astream`: una **implementación predeterminada** de transmisión que transmite la **salida final** de la cadena.
2. async `astream_events` y async `astream_log`: estos proporcionan una forma de transmitir tanto **pasos intermedios** como **salida final** de la cadena.

Echemos un vistazo a ambos enfoques y tratemos de entender cómo usarlos. 🥷

## Usando Stream

Todos los objetos `Runnable` implementan un método sincrónico llamado `stream` y una variante asincrónica llamada `astream`.

Estos métodos están diseñados para transmitir la salida final en fragmentos, entregando cada fragmento tan pronto como esté disponible.

La transmisión solo es posible si todos los pasos en el programa saben cómo procesar un **input stream**; es decir, procesar un fragmento de entrada uno a la vez y producir un fragmento de salida correspondiente.

La complejidad de este procesamiento puede variar, desde tareas sencillas como emitir tokens producidos por un LLM, hasta más desafiantes como transmitir partes de resultados JSON antes de que el JSON completo esté listo.

El mejor lugar para comenzar a explorar la transmisión es con los componentes más importantes en las aplicaciones de LLMs: ¡los propios LLMs!

### LLMs y Modelos de Chat

Los modelos de lenguaje grande y sus variantes de chat son el principal cuello de botella en las aplicaciones basadas en LLM. 🙊

Los modelos de lenguaje grande pueden tardar **varios segundos** en generar una respuesta completa a una consulta. Esto es mucho más lento que el umbral de **~200-300 ms** en el cual una aplicación se siente receptiva para un usuario final.

La estrategia clave para hacer que la aplicación se sienta más receptiva es mostrar el progreso intermedio; es decir, transmitir la salida del modelo **token por token**.

Mostraremos ejemplos de transmisión usando el modelo de chat de [Anthropic](/docs/integrations/platforms/anthropic). Para usar el modelo, necesitarás instalar el paquete `langchain-anthropic`. Puedes hacerlo con el siguiente comando:

```python
pip install -qU langchain-anthropic
```

```python
# Showing the example using anthropic, but you can use
# your favorite chat model!
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic()

chunks = []
async for chunk in model.astream("hello. tell me something about yourself"):
    chunks.append(chunk)
    print(chunk.content, end="|", flush=True)
```

```output
 Hello|!| My| name| is| Claude|.| I|'m| an| AI| assistant| created| by| An|throp|ic| to| be| helpful|,| harmless|,| and| honest|.||
```

Vamos a inspeccionar uno de los fragmentos

```python
chunks[0]
```

```output
AIMessageChunk(content=' Hello')
```

Recibimos algo llamado `AIMessageChunk`. Este fragmento representa una parte de un `AIMessage`.

Los fragmentos de mensajes son aditivos por diseño: uno puede simplemente sumarlos para obtener el estado de la respuesta hasta el momento.

```python
chunks[0] + chunks[1] + chunks[2] + chunks[3] + chunks[4]
```

```output
AIMessageChunk(content=' Hello! My name is')
```

### Cadenas

Prácticamente todas las aplicaciones de LLMs implican más pasos que solo una llamada a un modelo de lenguaje.

Vamos a construir una cadena simple usando `LangChain Expression Language` (`LCEL`) que combina un prompt, modelo y un parser y verificar que la transmisión funcione.

Usaremos `StrOutputParser` para analizar la salida del modelo. Este es un parser simple que extrae el campo `content` de un `AIMessageChunk`, dándonos el `token` devuelto por el modelo.

:::tip
LCEL es una forma *declarativa* de especificar un "programa" encadenando diferentes primitivas de LangChain. Las cadenas creadas usando LCEL se benefician de una implementación automática de `stream` y `astream` que permite la transmisión de la salida final. De hecho, las cadenas creadas con LCEL implementan toda la interfaz estándar Runnable.
:::

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
parser = StrOutputParser()
chain = prompt | model | parser

async for chunk in chain.astream({"topic": "parrot"}):
    print(chunk, end="|", flush=True)
```

```output
 Here|'s| a| silly| joke| about| a| par|rot|:|

What| kind| of| teacher| gives| good| advice|?| An| ap|-|parent| (|app|arent|)| one|!||
```

Podrías notar arriba que `parser` en realidad no bloquea la salida de transmisión del modelo, y en su lugar procesa cada fragmento individualmente. Muchas de las [primitivas de LCEL](/docs/expression_language/primitives) también soportan este tipo de transmisión de paso a través de estilo transformador, lo cual puede ser muy conveniente al construir aplicaciones.

Ciertos runnables, como [plantillas de prompt](/docs/modules/model_io/prompts) y [modelos de chat](/docs/modules/model_io/chat), no pueden procesar fragmentos individuales y en su lugar agregan todos los pasos previos. Esto interrumpirá el proceso de transmisión. Las funciones personalizadas pueden ser [diseñadas para devolver generadores](/docs/expression_language/primitives/functions#streaming), lo cual

:::note
Si la funcionalidad anterior no es relevante para lo que estás construyendo, no tienes que usar el `Lenguaje de Expresión LangChain` para usar LangChain y en su lugar puedes confiar en un enfoque de programación **imperativa** estándar llamando `invoke`, `batch` o `stream` en cada componente individualmente, asignando los resultados a variables y luego usándolos a continuación según lo consideres necesario.

Si eso funciona para tus necesidades, ¡entonces está bien para nosotros 👌!
:::

### Trabajando con Input Streams

¿Qué pasa si quisieras transmitir JSON desde la salida a medida que se genera?

Si dependieras de `json.loads` para analizar el json parcial, el análisis fallaría ya que el json parcial no sería un json válido.

Probablemente estarías completamente perdido sobre qué hacer y afirmarías que no era posible transmitir JSON.

Bueno, resulta que hay una manera de hacerlo: el parser necesita operar en el **input stream** e intentar "autocompletar" el json parcial en un estado válido.

Veamos un parser de este tipo en acción para entender lo que esto significa.

```python
from langchain_core.output_parsers import JsonOutputParser

chain = (
    model | JsonOutputParser()
)  # Due to a bug in older versions of Langchain, JsonOutputParser did not stream results from some models
async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, flush=True)
```

```output
{}
{'countries': []}
{'countries': [{}]}
{'countries': [{'name': ''}]}
{'countries': [{'name': 'France'}]}
{'countries': [{'name': 'France', 'population': 67}]}
{'countries': [{'name': 'France', 'population': 6739}]}
{'countries': [{'name': 'France', 'population': 673915}]}
{'countries': [{'name': 'France', 'population': 67391582}]}
{'countries': [{'name': 'France', 'population': 67391582}, {}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Sp'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 4675}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 467547}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 12}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 12647}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 1264764}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 126476461}]}
```

Ahora, vamos a **romper** la transmisión. Usaremos el ejemplo anterior y añadiremos una función de extracción al final que extrae los nombres de los países del JSON finalizado.

:::warning
Cualquier paso en la cadena que opere sobre **entradas finalizadas** en lugar de sobre **input streams** puede romper la funcionalidad de transmisión a través de `stream` o `astream`.
:::

:::tip
Más adelante, discutiremos la API `astream_events` que transmite resultados de pasos intermedios. Esta API transmitirá resultados de pasos intermedios incluso si la cadena contiene pasos que solo operan sobre **entradas finalizadas**.
:::

```python
from langchain_core.output_parsers import (
    JsonOutputParser,
)


# A function that operates on finalized inputs
# rather than on an input_stream
def _extract_country_names(inputs):
    """A function that does not operates on input streams and breaks streaming."""
    if not isinstance(inputs, dict):
        return ""

    if "countries" not in inputs:
        return ""

    countries = inputs["countries"]

    if not isinstance(countries, list):
        return ""

    country_names = [
        country.get("name") for country in countries if isinstance(country, dict)
    ]
    return country_names


chain = model | JsonOutputParser() | _extract_country_names

async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, end="|", flush=True)
```

```output
['France', 'Spain', 'Japan']|
```

#### Funciones Generadoras

Vamos a arreglar la transmisión usando una función generadora que puede operar sobre el **input stream**.

:::tip
Una función generadora (una función que usa `yield`) permite escribir código que opera sobre **input streams**
:::

```python
from langchain_core.output_parsers import JsonOutputParser


async def _extract_country_names_streaming(input_stream):
    """A function that operates on input streams."""
    country_names_so_far = set()

    async for input in input_stream:
        if not isinstance(input, dict):
            continue

        if "countries" not in input:
            continue

        countries = input["countries"]

        if not isinstance(countries, list):
            continue

        for country in countries:
            name = country.get("name")
            if not name:
                continue
            if name not in country_names_so_far:
                yield name
                country_names_so_far.add(name)


chain = model | JsonOutputParser() | _extract_country_names_streaming

async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, end="|", flush=True)
```

```output
France|Sp|Spain|Japan|
```

:::note
Debido a que el código anterior depende de la autocompleción de JSON, puede que veas nombres parciales de países (por ejemplo, `Sp` y `Spain`), lo cual no es lo que uno querría para un resultado de extracción.

Nos estamos enfocando en conceptos de transmisión, no necesariamente en los resultados de las cadenas.
:::

### Componentes que no son de transmisión

Algunos componentes integrados, como los Retrievers, no ofrecen ninguna `transmisión`. ¿Qué pasa si intentamos `stream` con ellos? 🤨

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho", "harrison likes spicy food"],
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()

chunks = [chunk for chunk in retriever.stream("where did harrison work?")]
chunks
```

```output
[[Document(page_content='harrison worked at kensho'),
  Document(page_content='harrison likes spicy food')]]
```

Stream simplemente entregó el resultado final de ese componente.

¡Esto está bien 🥹! No todos los componentes tienen que implementar transmisión: en algunos casos, la transmisión es innecesaria, difícil o simplemente no tiene sentido.

:::tip
Una cadena de LCEL construida usando componentes que no son de transmisión, aún podrá transmitir en muchos casos, con la transmisión de salida parcial comenzando después del último paso que no es de transmisión en la cadena.
:::

```python
retrieval_chain = (
    {
        "context": retriever.with_config(run_name="Docs"),
        "question": RunnablePassthrough(),
    }
    | prompt
    | model
    | StrOutputParser()
)
```

```python
for chunk in retrieval_chain.stream(
    "Where did harrison work? " "Write 3 made up sentences about this place."
):
    print(chunk, end="|", flush=True)
```

```output
 Based| on| the| given| context|,| the| only| information| provided| about| where| Harrison| worked| is| that| he| worked| at| Ken|sh|o|.| Since| there| are| no| other| details| provided| about| Ken|sh|o|,| I| do| not| have| enough| information| to| write| 3| additional| made| up| sentences| about| this| place|.| I| can| only| state| that| Harrison| worked| at| Ken|sh|o|.||
```

Ahora que hemos visto cómo funcionan `stream` y `astream`, aventurémonos en el mundo de los eventos de transmisión. 🏞️

## Usando Eventos de Transmisión

La transmisión de eventos es una API **beta**. Esta API puede cambiar un poco según los comentarios.

:::note
Introducido en langchain-core **0.1.14**.
:::

```python
import langchain_core

langchain_core.__version__
```

```output
'0.1.18'
```

Para que la API `astream_events` funcione correctamente:

* Usa `async` en todo el código en la medida de lo posible (por ejemplo, herramientas async, etc.)
* Propaga callbacks si defines funciones personalizadas / runnables
* Siempre que uses runnables sin LCEL, asegúrate de llamar a `.astream()` en los LLMs en lugar de `.ainvoke` para forzar al LLM a transmitir tokens.
* ¡Háznos saber si algo no funciona como se esperaba! :)

### Referencia de Eventos

A continuación se muestra una tabla de referencia que muestra algunos eventos que podrían ser emitidos por los diversos objetos Runnable.

:::note
Cuando la transmisión se implementa correctamente, las entradas a un runnable no se conocerán hasta que el flujo de entrada se haya consumido por completo. Esto significa que `inputs` a menudo se incluirán solo para eventos de `end` y no para eventos de `start`.
:::

| evento              | nombre           | chunk                           | entrada                                        | salida                                          |
|---------------------|------------------|---------------------------------|------------------------------------------------|-------------------------------------------------|
| on_chat_model_start | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]}  |                                                 |
| on_chat_model_stream| [model name]     | AIMessageChunk(content="hello") |                                                |                                                 |
| on_chat_model_end   | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]}  | {"generations": [...], "llm_output": None, ...} |
| on_llm_start        | [model name]     |                                 | {'input': 'hello'}                             |                                                 |
| on_llm_stream       | [model name]     | 'Hello'                         |                                                |                                                 |
| on_llm_end          | [model name]     |                                 | 'Hello human!'                                 |
| on_chain_start      | format_docs      |                                 |                                                |                                                 |
| on_chain_stream     | format_docs      | "hello world!, goodbye world!"  |                                                |                                                 |
| on_chain_end        | format_docs      |                                 | [Document(...)]                                | "hello world!, goodbye world!"                  |
| on_tool_start       | some_tool        |                                 | {"x": 1, "y": "2"}                             |                                                 |
| on_tool_stream      | some_tool        | {"x": 1, "y": "2"}              |                                                |                                                 |
| on_tool_end         | some_tool        |                                 |                                                | {"x": 1, "y": "2"}                              |
| on_retriever_start  | [retriever name] |                                 | {"query": "hello"}                             |                                                 |
| on_retriever_chunk  | [retriever name] | {documents: [...]}              |                                                |                                                 |
| on_retriever_end    | [retriever name] |                                 | {"query": "hello"}                             | {documents: [...]}                              |
| on_prompt_start     | [template_name]  |                                 | {"question": "hello"}                          |                                                 |
| on_prompt_end       | [template_name]  |                                 | {"question": "hello"}                          | ChatPromptValue(messages: [SystemMessage, ...]) |

### Modelo de Chat

Comencemos viendo los eventos producidos por un modelo de chat.

```python
events = []
async for event in model.astream_events("hello", version="v1"):
    events.append(event)
```

```output
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

:::note

Oye, ¿qué es ese parámetro funny version="v1" en la API?! 😾

Esta es una **API beta**, y casi seguro que haremos algunos cambios en ella.

Este parámetro de versión nos permitirá minimizar tales cambios que rompan tu código.

En resumen, te estamos molestando ahora, para no tener que molestarte después.
:::

Vamos a echar un vistazo a algunos de los eventos de inicio y algunos de los eventos de finalización.

```python
events[:3]
```

```output
[{'event': 'on_chat_model_start',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'name': 'ChatAnthropic',
  'tags': [],
  'metadata': {},
  'data': {'input': 'hello'}},
 {'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content=' Hello')}},
 {'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content='!')}}]
```

```python
events[-2:]
```

```output
[{'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content='')}},
 {'event': 'on_chat_model_end',
  'name': 'ChatAnthropic',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'data': {'output': AIMessageChunk(content=' Hello!')}}]
```

### Cadena

Volvamos al ejemplo de cadena que analizaba JSON de transmisión para explorar la API de eventos de transmisión.

```python
chain = (
    model | JsonOutputParser()
)  # Due to a bug in older versions of Langchain, JsonOutputParser did not stream results from some models

events = [
    event
    async for event in chain.astream_events(
        'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
        version="v1",
    )
]
```

Si examinas los primeros eventos, notarás que hay **3** eventos de inicio diferentes en lugar de **2** eventos de inicio.

Los tres eventos de inicio corresponden a:

1. La cadena (modelo + parser)
2. El modelo
3. El parser

```python
events[:3]
```

```output
[{'event': 'on_chain_start',
  'run_id': 'b1074bff-2a17-458b-9e7b-625211710df4',
  'name': 'RunnableSequence',
  'tags': [],
  'metadata': {},
  'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}},
 {'event': 'on_chat_model_start',
  'name': 'ChatAnthropic',
  'run_id': '6072be59-1f43-4f1c-9470-3b92e8406a99',
  'tags': ['seq:step:1'],
  'metadata': {},
  'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}},
 {'event': 'on_parser_start',
  'name': 'JsonOutputParser',
  'run_id': 'bf978194-0eda-4494-ad15-3a5bfe69cd59',
  'tags': ['seq:step:2'],
  'metadata': {},
  'data': {}}]
```

¿Qué crees que verías si miraras los últimos 3 eventos? ¿y los del medio?

Vamos a usar esta API para sacar los eventos de transmisión del modelo y el parser. Estamos ignorando eventos de inicio, eventos de finalización y eventos de la cadena.

```python
num_events = 0

async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(
            f"Chat model chunk: {repr(event['data']['chunk'].content)}",
            flush=True,
        )
    if kind == "on_parser_stream":
        print(f"Parser chunk: {event['data']['chunk']}", flush=True)
    num_events += 1
    if num_events > 30:
        # Truncate the output
        print("...")
        break
```

```output
Chat model chunk: ' Here'
Chat model chunk: ' is'
Chat model chunk: ' the'
Chat model chunk: ' JSON'
Chat model chunk: ' with'
Chat model chunk: ' the'
Chat model chunk: ' requested'
Chat model chunk: ' countries'
Chat model chunk: ' and'
Chat model chunk: ' their'
Chat model chunk: ' populations'
Chat model chunk: ':'
Chat model chunk: '\n\n```'
Chat model chunk: 'json'
Parser chunk: {}
Chat model chunk: '\n{'
Chat model chunk: '\n '
Chat model chunk: ' "'
Chat model chunk: 'countries'
Chat model chunk: '":'
Parser chunk: {'countries': []}
Chat model chunk: ' ['
Chat model chunk: '\n   '
Parser chunk: {'countries': [{}]}
Chat model chunk: ' {'
...
```

¡Debido a que tanto el modelo como el parser soportan transmisión, vemos eventos de transmisión de ambos componentes en tiempo real! ¡Algo genial, ¿no?! 🦜

### Filtrando Eventos

Debido a que esta API produce tantos eventos, es útil poder filtrar eventos.

Puedes filtrar por nombre del componente, etiquetas del componente o tipo de componente.

#### Por Nombre

```python
chain = model.with_config({"run_name": "model"}) | JsonOutputParser().with_config(
    {"run_name": "my_parser"}
)

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_names=["my_parser"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_parser_start', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': []}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': ''}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France'}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 6739}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 673915}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67391582}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67391582}, {}]}}}
...
```

#### Por Tipo

```python
chain = model.with_config({"run_name": "model"}) | JsonOutputParser().with_config(
    {"run_name": "my_parser"}
)

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_types=["chat_model"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_chat_model_start', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' Here')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' is')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' JSON')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' with')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' requested')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' countries')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' and')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' their')}}
...
```

#### Por Etiquetas

:::caution

Las etiquetas son heredadas por los componentes hijos de un runnable dado.

Si estás usando etiquetas para filtrar, asegúrate de que esto es lo que deseas.
:::

```python
chain = (model | JsonOutputParser()).with_config({"tags": ["my_chain"]})

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_tags=["my_chain"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # Truncate output
        print("...")
        break
```

```output
{'event': 'on_chain_start', 'run_id': '190875f3-3fb7-49ad-9b6e-f49da22f3e49', 'name': 'RunnableSequence', 'tags': ['my_chain'], 'metadata': {}, 'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}}
{'event': 'on_chat_model_start', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}}
{'event': 'on_parser_start', 'name': 'JsonOutputParser', 'run_id': '3b5e4ca1-40fe-4a02-9a19-ba2a43a6115c', 'tags': ['seq:step:2', 'my_chain'], 'metadata': {}, 'data': {}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' Here')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' is')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' JSON')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' with')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' requested')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' countries')}}
...
```

### Componentes no de transmisión

¿Recuerdas cómo algunos componentes no transmiten bien porque no operan en **flujos de entrada**?

Aunque tales componentes pueden romper la transmisión de la salida final al usar `astream`, `astream_events` aún generará eventos de transmisión de pasos intermedios que soportan transmisión.

```python
# Function that does not support streaming.
# It operates on the finalizes inputs rather than
# operating on the input stream.
def _extract_country_names(inputs):
    """A function that does not operates on input streams and breaks streaming."""
    if not isinstance(inputs, dict):
        return ""

    if "countries" not in inputs:
        return ""

    countries = inputs["countries"]

    if not isinstance(countries, list):
        return ""

    country_names = [
        country.get("name") for country in countries if isinstance(country, dict)
    ]
    return country_names


chain = (
    model | JsonOutputParser() | _extract_country_names
)  # This parser only works with OpenAI right now
```

Como se esperaba, la API `astream` no funciona correctamente porque `_extract_country_names` no opera en flujos.

```python
async for chunk in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
):
    print(chunk, flush=True)
```

```output
['France', 'Spain', 'Japan']
```

Ahora, confirmemos que con astream_events seguimos viendo salida de transmisión del modelo y el parser.

```python
num_events = 0

async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(
            f"Chat model chunk: {repr(event['data']['chunk'].content)}",
            flush=True,
        )
    if kind == "on_parser_stream":
        print(f"Parser chunk: {event['data']['chunk']}", flush=True)
    num_events += 1
    if num_events > 30:
        # Truncate the output
        print("...")
        break
```

```output
Chat model chunk: ' Here'
Chat model chunk: ' is'
Chat model chunk: ' the'
Chat model chunk: ' JSON'
Chat model chunk: ' with'
Chat model chunk: ' the'
Chat model chunk: ' requested'
Chat model chunk: ' countries'
Chat model chunk: ' and'
Chat model chunk: ' their'
Chat model chunk: ' populations'
Chat model chunk: ':'
Chat model chunk: '\n\n```'
Chat model chunk: 'json'
Parser chunk: {}
Chat model chunk: '\n{'
Chat model chunk: '\n '
Chat model chunk: ' "'
Chat model chunk: 'countries'
Chat model chunk: '":'
Parser chunk: {'countries': []}
Chat model chunk: ' ['
Chat model chunk: '\n   '
Parser chunk: {'countries': [{}]}
Chat model chunk: ' {'
Chat model chunk: '\n     '
Chat model chunk: ' "'
...
```

### Propagación de Callbacks

:::caution
Si estás invocando runnables dentro de tus herramientas, necesitas propagar callbacks al runnable; de lo contrario, no se generarán eventos de transmisión.
:::

:::note
Cuando usas RunnableLambdas o el decorador @chain, los callbacks se propagan automáticamente en segundo plano.
:::

```python
from langchain_core.runnables import RunnableLambda
from langchain_core.tools import tool


def reverse_word(word: str):
    return word[::-1]


reverse_word = RunnableLambda(reverse_word)


@tool
def bad_tool(word: str):
    """Custom tool that doesn't propagate callbacks."""
    return reverse_word.invoke(word)


async for event in bad_tool.astream_events("hello", version="v1"):
    print(event)
```

```output
{'event': 'on_tool_start', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'name': 'bad_tool', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_tool_stream', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'tags': [], 'metadata': {}, 'name': 'bad_tool', 'data': {'chunk': 'olleh'}}
{'event': 'on_tool_end', 'name': 'bad_tool', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'tags': [], 'metadata': {}, 'data': {'output': 'olleh'}}
```

Aquí hay una re-implementación que propaga correctamente los callbacks. Notarás que ahora estamos recibiendo eventos del runnable `reverse_word` también.

```python
@tool
def correct_tool(word: str, callbacks):
    """A tool that correctly propagates callbacks."""
    return reverse_word.invoke(word, {"callbacks": callbacks})


async for event in correct_tool.astream_events("hello", version="v1"):
    print(event)
```

```output
{'event': 'on_tool_start', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'name': 'correct_tool', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': 'c4882303-8867-4dff-b031-7d9499b39dda', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': 'c4882303-8867-4dff-b031-7d9499b39dda', 'tags': [], 'metadata': {}, 'data': {'input': 'hello', 'output': 'olleh'}}
{'event': 'on_tool_stream', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'tags': [], 'metadata': {}, 'name': 'correct_tool', 'data': {'chunk': 'olleh'}}
{'event': 'on_tool_end', 'name': 'correct_tool', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'tags': [], 'metadata': {}, 'data': {'output': 'olleh'}}
```

Si estás invocando runnables desde dentro de Runnable Lambdas o @chains, entonces los callbacks se pasarán automáticamente en tu nombre.

```python
from langchain_core.runnables import RunnableLambda


async def reverse_and_double(word: str):
    return await reverse_word.ainvoke(word) * 2


reverse_and_double = RunnableLambda(reverse_and_double)

await reverse_and_double.ainvoke("1234")

async for event in reverse_and_double.astream_events("1234", version="v1"):
    print(event)
```

```output
{'event': 'on_chain_start', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': '335fe781-8944-4464-8d2e-81f61d1f85f5', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': '335fe781-8944-4464-8d2e-81f61d1f85f5', 'tags': [], 'metadata': {}, 'data': {'input': '1234', 'output': '4321'}}
{'event': 'on_chain_stream', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'tags': [], 'metadata': {}, 'name': 'reverse_and_double', 'data': {'chunk': '43214321'}}
{'event': 'on_chain_end', 'name': 'reverse_and_double', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'tags': [], 'metadata': {}, 'data': {'output': '43214321'}}
```

Y con el decorador @chain:

```python
from langchain_core.runnables import chain


@chain
async def reverse_and_double(word: str):
    return await reverse_word.ainvoke(word) * 2


await reverse_and_double.ainvoke("1234")

async for event in reverse_and_double.astream_events("1234", version="v1"):
    print(event)
```

```output
{'event': 'on_chain_start', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': 'e7cddab2-9b95-4e80-abaf-4b2429117835', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': 'e7cddab2-9b95-4e80-abaf-4b2429117835', 'tags': [], 'metadata': {}, 'data': {'input': '1234', 'output': '4321'}}
{'event': 'on_chain_stream', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'tags': [], 'metadata': {}, 'name': 'reverse_and_double', 'data': {'chunk': '43214321'}}
{'event': 'on_chain_end', 'name': 'reverse_and_double', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'tags': [], 'metadata': {}, 'data': {'output': '43214321'}}
```
