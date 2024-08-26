---
sidebar_position: 5
translated: true
---

# Composición

LangChain proporciona una interfaz de usuario amigable para componer diferentes partes de los mensajes juntos. Puede hacer esto con mensajes de texto o mensajes de chat. Construir mensajes de esta manera permite un fácil reuso de componentes.

## Composición de mensajes de texto

Cuando se trabaja con mensajes de texto, cada plantilla se une. Puede trabajar con mensajes directamente o con cadenas (el primer elemento de la lista debe ser un mensaje).

```python
from langchain_core.prompts import PromptTemplate
```

```python
prompt = (
    PromptTemplate.from_template("Tell me a joke about {topic}")
    + ", make it funny"
    + "\n\nand in {language}"
)
```

```python
prompt
```

```output
PromptTemplate(input_variables=['language', 'topic'], template='Tell me a joke about {topic}, make it funny\n\nand in {language}')
```

```python
prompt.format(topic="sports", language="spanish")
```

```output
'Tell me a joke about sports, make it funny\n\nand in spanish'
```

También puede usarlo en un LLMChain, al igual que antes.

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI()
```

```python
chain = LLMChain(llm=model, prompt=prompt)
```

```python
chain.run(topic="sports", language="spanish")
```

```output
'¿Por qué el futbolista llevaba un paraguas al partido?\n\nPorque pronosticaban lluvia de goles.'
```

## Composición de mensajes de chat

Un mensaje de chat se compone de una lista de mensajes. Puramente por experiencia de desarrollador, hemos agregado una forma conveniente de crear estos mensajes. En esta canalización, cada nuevo elemento es un nuevo mensaje en el mensaje final.

```python
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

Primero, inicialicemos la plantilla de mensaje de chat base con un mensaje de sistema. No tiene que comenzar con un sistema, pero a menudo es una buena práctica.

```python
prompt = SystemMessage(content="You are a nice pirate")
```

Luego puede crear fácilmente una canalización combinándola con otros mensajes *o* plantillas de mensaje.
Use un `Message` cuando no haya variables que formatear, use un `MessageTemplate` cuando haya variables que formatear. También puede usar solo una cadena (nota: esto se inferirá automáticamente como un HumanMessagePromptTemplate).

```python
new_prompt = (
    prompt + HumanMessage(content="hi") + AIMessage(content="what?") + "{input}"
)
```

Debajo de la capucha, esto crea una instancia de la clase ChatPromptTemplate, ¡así que puede usarla como lo hizo antes!

```python
new_prompt.format_messages(input="i said hi")
```

```output
[SystemMessage(content='You are a nice pirate', additional_kwargs={}),
 HumanMessage(content='hi', additional_kwargs={}, example=False),
 AIMessage(content='what?', additional_kwargs={}, example=False),
 HumanMessage(content='i said hi', additional_kwargs={}, example=False)]
```

También puede usarlo en un LLMChain, al igual que antes.

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI()
```

```python
chain = LLMChain(llm=model, prompt=new_prompt)
```

```python
chain.run("i said hi")
```

```output
'Oh, hello! How can I assist you today?'
```

## Uso de PipelinePrompt

LangChain incluye una abstracción [PipelinePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.pipeline.PipelinePromptTemplate.html), que puede ser útil cuando desea reutilizar partes de los mensajes. Un PipelinePrompt consta de dos partes principales:

- Mensaje final: el mensaje final que se devuelve
- Mensajes de la canalización: una lista de tuplas, que consta de un nombre de cadena y una plantilla de mensaje. Cada plantilla de mensaje se formateará y luego se pasará a las plantillas de mensaje futuras como una variable con el mismo nombre.

```python
from langchain_core.prompts.pipeline import PipelinePromptTemplate
from langchain_core.prompts.prompt import PromptTemplate
```

```python
full_template = """{introduction}

{example}

{start}"""
full_prompt = PromptTemplate.from_template(full_template)
```

```python
introduction_template = """You are impersonating {person}."""
introduction_prompt = PromptTemplate.from_template(introduction_template)
```

```python
example_template = """Here's an example of an interaction:

Q: {example_q}
A: {example_a}"""
example_prompt = PromptTemplate.from_template(example_template)
```

```python
start_template = """Now, do this for real!

Q: {input}
A:"""
start_prompt = PromptTemplate.from_template(start_template)
```

```python
input_prompts = [
    ("introduction", introduction_prompt),
    ("example", example_prompt),
    ("start", start_prompt),
]
pipeline_prompt = PipelinePromptTemplate(
    final_prompt=full_prompt, pipeline_prompts=input_prompts
)
```

```python
pipeline_prompt.input_variables
```

```output
['example_q', 'person', 'input', 'example_a']
```

```python
print(
    pipeline_prompt.format(
        person="Elon Musk",
        example_q="What's your favorite car?",
        example_a="Tesla",
        input="What's your favorite social media site?",
    )
)
```

```output
You are impersonating Elon Musk.

Here's an example of an interaction:

Q: What's your favorite car?
A: Tesla

Now, do this for real!

Q: What's your favorite social media site?
A:
```
