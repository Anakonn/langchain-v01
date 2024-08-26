---
sidebar_position: 5
translated: true
---

# Composition

LangChain fournit une interface conviviale pour composer différentes parties des invites ensemble. Vous pouvez le faire avec des invites de chaîne de caractères ou des invites de conversation. La construction d'invites de cette manière permet une réutilisation facile des composants.

## Composition d'invites de chaîne de caractères

Lors du travail avec des invites de chaîne de caractères, chaque modèle est joint ensemble. Vous pouvez travailler directement avec les invites ou les chaînes de caractères (le premier élément de la liste doit être une invite).

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

Vous pouvez également l'utiliser dans un LLMChain, comme avant.

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

## Composition d'invites de conversation

Une invite de conversation se compose d'une liste de messages. Purement pour l'expérience du développeur, nous avons ajouté un moyen pratique de créer ces invites. Dans ce pipeline, chaque nouvel élément est un nouveau message dans l'invite finale.

```python
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

Tout d'abord, initialisons le modèle d'invite de conversation de base avec un message système. Il n'est pas obligatoire de commencer par un système, mais c'est souvent une bonne pratique.

```python
prompt = SystemMessage(content="You are a nice pirate")
```

Vous pouvez ensuite facilement créer un pipeline en le combinant avec d'autres messages *ou* modèles de messages.
Utilisez un `Message` lorsqu'il n'y a pas de variables à formater, utilisez un `MessageTemplate` lorsqu'il y a des variables à formater. Vous pouvez également utiliser une simple chaîne de caractères (remarque : cela sera automatiquement interprété comme un HumanMessagePromptTemplate).

```python
new_prompt = (
    prompt + HumanMessage(content="hi") + AIMessage(content="what?") + "{input}"
)
```

En interne, cela crée une instance de la classe ChatPromptTemplate, que vous pouvez donc utiliser comme vous l'avez fait auparavant !

```python
new_prompt.format_messages(input="i said hi")
```

```output
[SystemMessage(content='You are a nice pirate', additional_kwargs={}),
 HumanMessage(content='hi', additional_kwargs={}, example=False),
 AIMessage(content='what?', additional_kwargs={}, example=False),
 HumanMessage(content='i said hi', additional_kwargs={}, example=False)]
```

Vous pouvez également l'utiliser dans un LLMChain, comme avant.

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

## Utilisation de PipelinePrompt

LangChain inclut une abstraction [PipelinePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.pipeline.PipelinePromptTemplate.html), qui peut être utile lorsque vous voulez réutiliser des parties d'invites. Un PipelinePrompt se compose de deux parties principales :

- Invite finale : l'invite finale qui est renvoyée
- Invites de pipeline : une liste de tuples, composée d'un nom de chaîne et d'un modèle d'invite. Chaque modèle d'invite sera formaté, puis transmis aux modèles d'invite futurs en tant que variable avec le même nom.

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
