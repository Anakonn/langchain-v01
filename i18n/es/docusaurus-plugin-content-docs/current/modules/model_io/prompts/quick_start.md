---
sidebar_position: 0
title: Referencia rápida
translated: true
---

# Referencia rápida

Las plantillas de indicación son recetas predefinidas para generar indicaciones para modelos de lenguaje.

Una plantilla puede incluir instrucciones, ejemplos de pocos disparos y contexto específico y
preguntas apropiadas para una tarea determinada.

LangChain proporciona herramientas para crear y trabajar con plantillas de indicación.

LangChain se esfuerza por crear plantillas independientes del modelo para facilitar la reutilización
de las plantillas existentes en diferentes modelos de lenguaje.

Normalmente, los modelos de lenguaje esperan que la indicación sea una cadena o una lista de mensajes de chat.

## `PromptTemplate`

Utilice `PromptTemplate` para crear una plantilla para una indicación de cadena.

De forma predeterminada, `PromptTemplate` utiliza [la sintaxis str.format de Python](https://docs.python.org/3/library/stdtypes.html#str.format)
para la creación de plantillas.

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)
prompt_template.format(adjective="funny", content="chickens")
```

```output
'Tell me a funny joke about chickens.'
```

La plantilla admite cualquier número de variables, incluidas sin variables:

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template("Tell me a joke")
prompt_template.format()
```

```output
'Tell me a joke'
```

Puede crear plantillas de indicación personalizadas que den formato a la indicación de la manera que desee.
Para obtener más información, consulte [Composición de la plantilla de indicación](/docs/modules/model_io/prompts/composition/).

## `ChatPromptTemplate`

La indicación para [modelos de chat](/docs/modules/model_io/chat) es una lista de [mensajes de chat](/docs/modules/model_io/chat/message_types/).

Cada mensaje de chat se asocia con contenido y un parámetro adicional llamado `role`.
Por ejemplo, en la [API de finalización de chat de OpenAI](https://platform.openai.com/docs/guides/chat/introduction), un mensaje de chat se puede asociar con un asistente de IA, un rol humano o un rol de sistema.

Cree una plantilla de indicación de chat de la siguiente manera:

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI bot. Your name is {name}."),
        ("human", "Hello, how are you doing?"),
        ("ai", "I'm doing well, thanks!"),
        ("human", "{user_input}"),
    ]
)

messages = chat_template.format_messages(name="Bob", user_input="What is your name?")
```

Canalizar estos mensajes con formato en la clase `ChatOpenAI` de LangChain es aproximadamente equivalente a lo siguiente con el uso del cliente de OpenAI directamente:

```python
%pip install openai
```

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful AI bot. Your name is Bob."},
        {"role": "user", "content": "Hello, how are you doing?"},
        {"role": "assistant", "content": "I'm doing well, thanks!"},
        {"role": "user", "content": "What is your name?"},
    ],
)
```

El método estático `ChatPromptTemplate.from_messages` acepta una variedad de representaciones de mensajes y es una forma conveniente de dar formato a la entrada de los modelos de chat con exactamente los mensajes que desee.

Por ejemplo, además de usar la representación de 2 tuplas de (tipo, contenido) utilizada
anteriormente, puede pasar una instancia de `MessagePromptTemplate` o `BaseMessage`.

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import HumanMessagePromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)
messages = chat_template.format_messages(text="I don't like eating tasty things")
print(messages)
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."), HumanMessage(content="I don't like eating tasty things")]
```

Esto le proporciona una gran flexibilidad a la hora de construir sus indicaciones de chat.

## Indicaciones de mensaje

LangChain proporciona diferentes tipos de `MessagePromptTemplate`. Los más utilizados son `AIMessagePromptTemplate`, `SystemMessagePromptTemplate` y `HumanMessagePromptTemplate`, que crean un mensaje de IA, un mensaje de sistema y un mensaje humano respectivamente. Puede leer más sobre los [diferentes tipos de mensajes aquí](/docs/modules/model_io/chat/message_types).

En los casos en los que el modelo de chat admite tomar mensajes de chat con un rol arbitrario, puede utilizar `ChatMessagePromptTemplate`, que permite al usuario especificar el nombre del rol.

```python
from langchain_core.prompts import ChatMessagePromptTemplate

prompt = "May the {subject} be with you"

chat_message_prompt = ChatMessagePromptTemplate.from_template(
    role="Jedi", template=prompt
)
chat_message_prompt.format(subject="force")
```

```output
ChatMessage(content='May the force be with you', role='Jedi')
```

## `MessagesPlaceholder`

LangChain también proporciona `MessagesPlaceholder`, que le da el control total de qué mensajes se van a representar durante el formato. Esto puede ser útil cuando no está seguro de qué rol debe utilizar para sus plantillas de indicación de mensaje o cuando desea insertar una lista de mensajes durante el formato.

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)

human_prompt = "Summarize our conversation so far in {word_count} words."
human_message_template = HumanMessagePromptTemplate.from_template(human_prompt)

chat_prompt = ChatPromptTemplate.from_messages(
    [MessagesPlaceholder(variable_name="conversation"), human_message_template]
)
```

```python
from langchain_core.messages import AIMessage, HumanMessage

human_message = HumanMessage(content="What is the best way to learn programming?")
ai_message = AIMessage(
    content="""\
1. Choose a programming language: Decide on a programming language that you want to learn.

2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.

3. Practice, practice, practice: The best way to learn programming is through hands-on experience\
"""
)

chat_prompt.format_prompt(
    conversation=[human_message, ai_message], word_count="10"
).to_messages()
```

```output
[HumanMessage(content='What is the best way to learn programming?'),
 AIMessage(content='1. Choose a programming language: Decide on a programming language that you want to learn.\n\n2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.\n\n3. Practice, practice, practice: The best way to learn programming is through hands-on experience'),
 HumanMessage(content='Summarize our conversation so far in 10 words.')]
```

La lista completa de tipos de plantillas de indicación de mensaje incluye:

* [AIMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.AIMessagePromptTemplate.html), para mensajes de asistente de IA;
* [SystemMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.SystemMessagePromptTemplate.html), para mensajes del sistema;
* [HumanMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html), para mensajes de usuario;
* [ChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatMessagePromptTemplate.html), para mensajes con roles arbitrarios;
* [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html), que acomoda una lista de mensajes.

## LCEL

`PromptTemplate` y `ChatPromptTemplate` implementan la [interfaz Runnable](/docs/expression_language/interface), el bloque de construcción básico del [Lenguaje de Expresión de LangChain (LCEL)](/docs/expression_language/). Esto significa que admiten llamadas `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log`.

`PromptTemplate` acepta un diccionario (de las variables de indicación) y devuelve un `StringPromptValue`. Un `ChatPromptTemplate` acepta un diccionario y devuelve un `ChatPromptValue`.

```python
prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)

prompt_val = prompt_template.invoke({"adjective": "funny", "content": "chickens"})
prompt_val
```

```output
StringPromptValue(text='Tell me a funny joke about chickens.')
```

```python
prompt_val.to_string()
```

```output
'Tell me a funny joke about chickens.'
```

```python
prompt_val.to_messages()
```

```output
[HumanMessage(content='Tell me a funny joke about chickens.')]
```

```python
chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)

chat_val = chat_template.invoke({"text": "i dont like eating tasty things."})
```

```python
chat_val.to_messages()
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."),
 HumanMessage(content='i dont like eating tasty things.')]
```

```python
chat_val.to_string()
```

```output
"System: You are a helpful assistant that re-writes the user's text to sound more upbeat.\nHuman: i dont like eating tasty things."
```
