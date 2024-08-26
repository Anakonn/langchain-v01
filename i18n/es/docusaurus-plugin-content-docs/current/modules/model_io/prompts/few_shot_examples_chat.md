---
translated: true
---

# Pocos ejemplos para modelos de chat

Este cuaderno cubre cómo usar pocos ejemplos en modelos de chat. No parece haber un consenso sólido sobre la mejor manera de hacer pocos ejemplos de solicitud, y la compilación de solicitud óptima probablemente variará según el modelo. Debido a esto, proporcionamos plantillas de solicitud de pocos ejemplos como [FewShotChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html?highlight=fewshot#langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate) como punto de partida flexible, y puede modificarlas o reemplazarlas según lo considere conveniente.

El objetivo de las plantillas de solicitud de pocos ejemplos es seleccionar dinámicamente ejemplos en función de una entrada y luego dar formato a los ejemplos en una solicitud final para proporcionarlos al modelo.

**Nota:** Los siguientes ejemplos de código son para modelos de chat. Para ejemplos similares de pocos ejemplos de solicitud para modelos de finalización (LLM), consulte la guía de [plantillas de solicitud de pocos ejemplos](/docs/modules/model_io/prompts/few_shot_examples/).

### Ejemplos fijos

La técnica de solicitud de pocos ejemplos más básica (y común) es usar un ejemplo de solicitud fijo. De esta manera, puede seleccionar una cadena, evaluarla y evitar preocuparse por partes móviles adicionales en producción.

Los componentes básicos de la plantilla son:
- `examples`: Una lista de ejemplos de diccionario para incluir en la solicitud final.
- `example_prompt`: convierte cada ejemplo en 1 o más mensajes a través de su método [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=format_messages#langchain_core.prompts.chat.ChatPromptTemplate.format_messages). Un ejemplo común sería convertir cada ejemplo en un mensaje humano y una respuesta de mensaje de IA, o un mensaje humano seguido de un mensaje de llamada a función.

A continuación se muestra una demostración simple. Primero, importe los módulos para este ejemplo:

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)
```

Luego, defina los ejemplos que le gustaría incluir.

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]
```

A continuación, reúnalos en la plantilla de solicitud de pocos ejemplos.

```python
# This is a prompt template used to format each individual example.
example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)
few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

print(few_shot_prompt.format())
```

```output
Human: 2+2
AI: 4
Human: 2+3
AI: 5
```

Finalmente, ensamble su solicitud final y úsela con un modelo.

```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's the square of a triangle?"})
```

```output
AIMessage(content=' Triangles do not have a "square". A square refers to a shape with 4 equal sides and 4 right angles. Triangles have 3 sides and 3 angles.\n\nThe area of a triangle can be calculated using the formula:\n\nA = 1/2 * b * h\n\nWhere:\n\nA is the area \nb is the base (the length of one of the sides)\nh is the height (the length from the base to the opposite vertex)\n\nSo the area depends on the specific dimensions of the triangle. There is no single "square of a triangle". The area can vary greatly depending on the base and height measurements.', additional_kwargs={}, example=False)
```

## Solicitud de pocos ejemplos dinámicos

A veces es posible que desee condicionar qué ejemplos se muestran en función de la entrada. Para esto, puede reemplazar los `examples` con un `example_selector`. ¡Los otros componentes permanecen iguales que los anteriores! Para revisar, la plantilla de solicitud de pocos ejemplos dinámicos se vería así:

- `example_selector`: responsable de seleccionar ejemplos de pocos ejemplos (y el orden en el que se devuelven) para una entrada dada. Estos implementan la interfaz [BaseExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.base.BaseExampleSelector.html?highlight=baseexampleselector#langchain_core.example_selectors.base.BaseExampleSelector). Un ejemplo común es el [SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html?highlight=semanticsimilarityexampleselector#langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector) respaldado por el vectorstore.
- `example_prompt`: convierte cada ejemplo en 1 o más mensajes a través de su método [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate#langchain_core.prompts.chat.ChatPromptTemplate.format_messages). Un ejemplo común sería convertir cada ejemplo en un mensaje humano y una respuesta de mensaje de IA, o un mensaje humano seguido de un mensaje de llamada a función.

Estos nuevamente se pueden componer con otros mensajes y plantillas de chat para ensamblar su solicitud final.

```python
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings
```

Como estamos usando un vectorstore para seleccionar ejemplos en función de la similitud semántica, primero querremos poblar la tienda.

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
    {"input": "2+4", "output": "6"},
    {"input": "What did the cow say to the moon?", "output": "nothing at all"},
    {
        "input": "Write me a poem about the moon",
        "output": "One for the moon, and one for me, who are we to talk about the moon?",
    },
]

to_vectorize = [" ".join(example.values()) for example in examples]
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(to_vectorize, embeddings, metadatas=examples)
```

#### Crear el `example_selector`

Con un vectorstore creado, puede crear el `example_selector`. Aquí le indicaremos que solo busque los 2 mejores ejemplos.

```python
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=2,
)

# The prompt template will load examples by passing the input do the `select_examples` method
example_selector.select_examples({"input": "horse"})
```

```output
[{'input': 'What did the cow say to the moon?', 'output': 'nothing at all'},
 {'input': '2+4', 'output': '6'}]
```

#### Crear plantilla de solicitud

Ensamble la plantilla de solicitud, usando el `example_selector` creado anteriormente.

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

# Define the few-shot prompt.
few_shot_prompt = FewShotChatMessagePromptTemplate(
    # The input variables select the values to pass to the example_selector
    input_variables=["input"],
    example_selector=example_selector,
    # Define how each example will be formatted.
    # In this case, each example will become 2 messages:
    # 1 human, and 1 AI
    example_prompt=ChatPromptTemplate.from_messages(
        [("human", "{input}"), ("ai", "{output}")]
    ),
)
```

A continuación se muestra un ejemplo de cómo se ensamblaría esto.

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

Ensamblar la plantilla de solicitud final:

```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

#### Usar con un LLM

Ahora puede conectar su modelo a la solicitud de pocos ejemplos.

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's 3+3?"})
```

```output
AIMessage(content=' 3 + 3 = 6', additional_kwargs={}, example=False)
```
