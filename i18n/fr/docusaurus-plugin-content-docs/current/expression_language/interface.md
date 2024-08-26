---
sidebar_position: 1
title: Interface exécutable
translated: true
---

Pour rendre la création de chaînes personnalisées aussi facile que possible, nous avons implémenté un protocole ["Exécutable"](https://api.python.langchain.com/en/stable/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable). De nombreux composants LangChain implémentent le protocole `Exécutable`, notamment les modèles de discussion, les LLM, les analyseurs de sortie, les récupérateurs, les modèles d'invite et bien d'autres. Il existe également plusieurs primitives utiles pour travailler avec les exécutables, que vous pouvez lire dans cette section (/docs/expression_language/primitives).

Il s'agit d'une interface standard, ce qui facilite la définition de chaînes personnalisées ainsi que leur invocation d'une manière standard.
L'interface standard comprend :

- [`stream`](#stream) : diffuser des fragments de la réponse
- [`invoke`](#invoke) : appeler la chaîne sur une entrée
- [`batch`](#batch) : appeler la chaîne sur une liste d'entrées

Ceux-ci ont également des méthodes asynchrones correspondantes qui doivent être utilisées avec la syntaxe `await` [asyncio](https://docs.python.org/3/library/asyncio.html) pour la concurrence :

- [`astream`](#async-stream) : diffuser des fragments de la réponse de manière asynchrone
- [`ainvoke`](#async-invoke) : appeler la chaîne sur une entrée de manière asynchrone
- [`abatch`](#async-batch) : appeler la chaîne sur une liste d'entrées de manière asynchrone
- [`astream_log`](#async-stream-intermediate-steps) : diffuser les étapes intermédiaires au fur et à mesure, en plus de la réponse finale
- [`astream_events`](#async-stream-events) : **bêta** diffuser les événements au fur et à mesure qu'ils se produisent dans la chaîne (introduit dans `langchain-core` 0.1.14)

Le **type d'entrée** et le **type de sortie** varient selon le composant :

| Composant | Type d'entrée | Type de sortie |
| --- | --- | --- |
| Invite | Dictionnaire | PromptValue |
| Modèle de discussion | Chaîne unique, liste de messages de discussion ou PromptValue | ChatMessage |
| LLM | Chaîne unique, liste de messages de discussion ou PromptValue | Chaîne |
| Analyseur de sortie | La sortie d'un LLM ou d'un modèle de discussion | Dépend de l'analyseur |
| Récupérateur | Chaîne unique | Liste de documents |
| Outil | Chaîne unique ou dictionnaire, selon l'outil | Dépend de l'outil |

Tous les exécutables exposent des schémas d'entrée et de sortie pour inspecter les entrées et les sorties :
- [`input_schema`](#input-schema) : un modèle Pydantic d'entrée généré automatiquement à partir de la structure de l'Exécutable
- [`output_schema`](#output-schema) : un modèle Pydantic de sortie généré automatiquement à partir de la structure de l'Exécutable

Examinons ces méthodes. Pour ce faire, nous allons créer une chaîne PromptTemplate + ChatModel super simple.

```python
%pip install --upgrade --quiet  langchain-core langchain-community langchain-openai
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
chain = prompt | model
```

## Schéma d'entrée

Une description des entrées acceptées par un Exécutable.
Il s'agit d'un modèle Pydantic généré dynamiquement à partir de la structure de n'importe quel Exécutable.
Vous pouvez appeler `.schema()` dessus pour obtenir une représentation JSONSchema.

```python
# The input schema of the chain is the input schema of its first part, the prompt.
chain.input_schema.schema()
```

```output
{'title': 'PromptInput',
 'type': 'object',
 'properties': {'topic': {'title': 'Topic', 'type': 'string'}}}
```

```python
prompt.input_schema.schema()
```

```output
{'title': 'PromptInput',
 'type': 'object',
 'properties': {'topic': {'title': 'Topic', 'type': 'string'}}}
```

```python
model.input_schema.schema()
```

```output
{'title': 'ChatOpenAIInput',
 'anyOf': [{'type': 'string'},
  {'$ref': '#/definitions/StringPromptValue'},
  {'$ref': '#/definitions/ChatPromptValueConcrete'},
  {'type': 'array',
   'items': {'anyOf': [{'$ref': '#/definitions/AIMessage'},
     {'$ref': '#/definitions/HumanMessage'},
     {'$ref': '#/definitions/ChatMessage'},
     {'$ref': '#/definitions/SystemMessage'},
     {'$ref': '#/definitions/FunctionMessage'},
     {'$ref': '#/definitions/ToolMessage'}]}}],
 'definitions': {'StringPromptValue': {'title': 'StringPromptValue',
   'description': 'String prompt value.',
   'type': 'object',
   'properties': {'text': {'title': 'Text', 'type': 'string'},
    'type': {'title': 'Type',
     'default': 'StringPromptValue',
     'enum': ['StringPromptValue'],
     'type': 'string'}},
   'required': ['text']},
  'AIMessage': {'title': 'AIMessage',
   'description': 'A Message from an AI.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'ai',
     'enum': ['ai'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'HumanMessage': {'title': 'HumanMessage',
   'description': 'A Message from a human.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'human',
     'enum': ['human'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'ChatMessage': {'title': 'ChatMessage',
   'description': 'A Message that can be assigned an arbitrary speaker (i.e. role).',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'chat',
     'enum': ['chat'],
     'type': 'string'},
    'role': {'title': 'Role', 'type': 'string'}},
   'required': ['content', 'role']},
  'SystemMessage': {'title': 'SystemMessage',
   'description': 'A Message for priming AI behavior, usually passed in as the first of a sequence\nof input messages.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'system',
     'enum': ['system'],
     'type': 'string'}},
   'required': ['content']},
  'FunctionMessage': {'title': 'FunctionMessage',
   'description': 'A Message for passing the result of executing a function back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'function',
     'enum': ['function'],
     'type': 'string'},
    'name': {'title': 'Name', 'type': 'string'}},
   'required': ['content', 'name']},
  'ToolMessage': {'title': 'ToolMessage',
   'description': 'A Message for passing the result of executing a tool back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'tool',
     'enum': ['tool'],
     'type': 'string'},
    'tool_call_id': {'title': 'Tool Call Id', 'type': 'string'}},
   'required': ['content', 'tool_call_id']},
  'ChatPromptValueConcrete': {'title': 'ChatPromptValueConcrete',
   'description': 'Chat prompt value which explicitly lists out the message types it accepts.\nFor use in external schemas.',
   'type': 'object',
   'properties': {'messages': {'title': 'Messages',
     'type': 'array',
     'items': {'anyOf': [{'$ref': '#/definitions/AIMessage'},
       {'$ref': '#/definitions/HumanMessage'},
       {'$ref': '#/definitions/ChatMessage'},
       {'$ref': '#/definitions/SystemMessage'},
       {'$ref': '#/definitions/FunctionMessage'},
       {'$ref': '#/definitions/ToolMessage'}]}},
    'type': {'title': 'Type',
     'default': 'ChatPromptValueConcrete',
     'enum': ['ChatPromptValueConcrete'],
     'type': 'string'}},
   'required': ['messages']}}}
```

## Schéma de sortie

Une description des sorties produites par un Exécutable.
Il s'agit d'un modèle Pydantic généré dynamiquement à partir de la structure de n'importe quel Exécutable.
Vous pouvez appeler `.schema()` dessus pour obtenir une représentation JSONSchema.

```python
# The output schema of the chain is the output schema of its last part, in this case a ChatModel, which outputs a ChatMessage
chain.output_schema.schema()
```

```output
{'title': 'ChatOpenAIOutput',
 'anyOf': [{'$ref': '#/definitions/AIMessage'},
  {'$ref': '#/definitions/HumanMessage'},
  {'$ref': '#/definitions/ChatMessage'},
  {'$ref': '#/definitions/SystemMessage'},
  {'$ref': '#/definitions/FunctionMessage'},
  {'$ref': '#/definitions/ToolMessage'}],
 'definitions': {'AIMessage': {'title': 'AIMessage',
   'description': 'A Message from an AI.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'ai',
     'enum': ['ai'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'HumanMessage': {'title': 'HumanMessage',
   'description': 'A Message from a human.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'human',
     'enum': ['human'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'ChatMessage': {'title': 'ChatMessage',
   'description': 'A Message that can be assigned an arbitrary speaker (i.e. role).',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'chat',
     'enum': ['chat'],
     'type': 'string'},
    'role': {'title': 'Role', 'type': 'string'}},
   'required': ['content', 'role']},
  'SystemMessage': {'title': 'SystemMessage',
   'description': 'A Message for priming AI behavior, usually passed in as the first of a sequence\nof input messages.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'system',
     'enum': ['system'],
     'type': 'string'}},
   'required': ['content']},
  'FunctionMessage': {'title': 'FunctionMessage',
   'description': 'A Message for passing the result of executing a function back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'function',
     'enum': ['function'],
     'type': 'string'},
    'name': {'title': 'Name', 'type': 'string'}},
   'required': ['content', 'name']},
  'ToolMessage': {'title': 'ToolMessage',
   'description': 'A Message for passing the result of executing a tool back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'tool',
     'enum': ['tool'],
     'type': 'string'},
    'tool_call_id': {'title': 'Tool Call Id', 'type': 'string'}},
   'required': ['content', 'tool_call_id']}}}
```

## Diffuser

```python
for s in chain.stream({"topic": "bears"}):
    print(s.content, end="", flush=True)
```

```output
Sure, here's a bear-themed joke for you:

Why don't bears wear shoes?

Because they already have bear feet!
```

## Invoquer

```python
chain.invoke({"topic": "bears"})
```

```output
AIMessage(content="Why don't bears wear shoes? \n\nBecause they have bear feet!")
```

## Batch

```python
chain.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
[AIMessage(content="Sure, here's a bear joke for you:\n\nWhy don't bears wear shoes?\n\nBecause they already have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!")]
```

Vous pouvez définir le nombre de requêtes simultanées à l'aide du paramètre `max_concurrency`

```python
chain.batch([{"topic": "bears"}, {"topic": "cats"}], config={"max_concurrency": 5})
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild? Too many cheetahs!")]
```

## Diffusion asynchrone

```python
async for s in chain.astream({"topic": "bears"}):
    print(s.content, end="", flush=True)
```

```output
Why don't bears wear shoes?

Because they have bear feet!
```

## Invocation asynchrone

```python
await chain.ainvoke({"topic": "bears"})
```

```output
AIMessage(content="Why don't bears ever wear shoes?\n\nBecause they already have bear feet!")
```

## Batch asynchrone

```python
await chain.abatch([{"topic": "bears"}])
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!")]
```

## Diffusion d'événements asynchrone (bêta)

La diffusion d'événements est une API **bêta** et peut être amenée à changer un peu en fonction des commentaires.

Remarque : Introduit dans langchain-core 0.2.0

Pour l'instant, lors de l'utilisation de l'API astream_events, pour que tout fonctionne correctement, veuillez :

* Utiliser `async` dans tout le code (y compris les outils async, etc.)
* Propager les rappels si vous définissez des fonctions/exécutables personnalisés.
* Chaque fois que vous utilisez des exécutables sans LCEL, assurez-vous d'appeler `.astream()` sur les LLM plutôt que `.ainvoke` pour forcer le LLM à diffuser les jetons.

Voici la traduction en français (fr) du texte fourni, conformément aux directives données :

### Référence des événements

Voici un tableau de référence qui montre certains événements qui peuvent être émis par les différents objets Runnable.
Les définitions de certains des Runnable sont incluses après le tableau.

⚠️ Lors de la diffusion en continu des entrées pour le runnable, elles ne seront pas disponibles tant que le flux d'entrée n'aura pas été entièrement consommé. Cela signifie que les entrées seront disponibles pour le crochet `end` correspondant plutôt que pour l'événement `start`.

| événement             | nom              | chunk                           | entrée                                        | sortie                                         |
|----------------------|------------------|----------------------------------|-----------------------------------------------|------------------------------------------------|
| on_chat_model_start   | [nom du modèle]  |                                 | {"messages": [[SystemMessage, HumanMessage]]} |                                                |
| on_chat_model_stream  | [nom du modèle]  | AIMessageChunk(content="hello") |                                              |                                                |
| on_chat_model_end     | [nom du modèle]  |                                 | {"messages": [[SystemMessage, HumanMessage]]} | {"generations": [...], "llm_output": None, ...} |
| on_llm_start          | [nom du modèle]  |                                 | {'input': 'hello'}                           |                                                |
| on_llm_stream         | [nom du modèle]  | 'Hello'                         |                                              |                                                |
| on_llm_end            | [nom du modèle]  |                                 | 'Hello human!'                               |
| on_chain_start        | format_docs      |                                 |                                              |                                                |
| on_chain_stream       | format_docs      | "hello world!, goodbye world!"  |                                              |                                                |
| on_chain_end          | format_docs      |                                 | [Document(...)]                              | "hello world!, goodbye world!"                 |
| on_tool_start         | some_tool        |                                 | {"x": 1, "y": "2"}                           |                                                |
| on_tool_stream        | some_tool        | {"x": 1, "y": "2"}              |                                              |                                                |
| on_tool_end           | some_tool        |                                 |                                              | {"x": 1, "y": "2"}                             |
| on_retriever_start    | [nom du récupérateur] |                            | {"query": "hello"}                           |                                                |
| on_retriever_chunk    | [nom du récupérateur] | {documents: [...]}         |                                              |                                                |
| on_retriever_end      | [nom du récupérateur] |                            | {"query": "hello"}                           | {documents: [...]}                             |
| on_prompt_start       | [nom du modèle]  |                                 | {"question": "hello"}                        |                                                |
| on_prompt_end         | [nom du modèle]  |                                 | {"question": "hello"}                        | ChatPromptValue(messages: [SystemMessage, ...]) |

Voici les déclarations associées aux événements ci-dessus :

`format_docs` :

```python
def format_docs(docs: List[Document]) -> str:
    '''Format the docs.'''
    return ", ".join([doc.page_content for doc in docs])

format_docs = RunnableLambda(format_docs)
```

`some_tool` :

```python
@tool
def some_tool(x: int, y: str) -> dict:
    '''Some_tool.'''
    return {"x": x, "y": y}
```

`prompt` :

```python
template = ChatPromptTemplate.from_messages(
    [("system", "You are Cat Agent 007"), ("human", "{question}")]
).with_config({"run_name": "my_template", "tags": ["my_template"]})
```

Définissons une nouvelle chaîne pour la rendre plus intéressante et montrer l'interface `astream_events` (et plus tard l'interface `astream_log`).

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

retrieval_chain = (
    {
        "context": retriever.with_config(run_name="Docs"),
        "question": RunnablePassthrough(),
    }
    | prompt
    | model.with_config(run_name="my_llm")
    | StrOutputParser()
)
```

Maintenant, utilisons `astream_events` pour obtenir des événements du récupérateur et du LLM.

```python
async for event in retrieval_chain.astream_events(
    "where did harrison work?", version="v1", include_names=["Docs", "my_llm"]
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="|")
    elif kind in {"on_chat_model_start"}:
        print()
        print("Streaming LLM:")
    elif kind in {"on_chat_model_end"}:
        print()
        print("Done streaming LLM.")
    elif kind == "on_retriever_end":
        print("--")
        print("Retrieved the following documents:")
        print(event["data"]["output"]["documents"])
    elif kind == "on_tool_end":
        print(f"Ended tool: {event['name']}")
    else:
        pass
```

```output
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(

--
Retrieved the following documents:
[Document(page_content='harrison worked at kensho')]

Streaming LLM:
|H|arrison| worked| at| Kens|ho|.||
Done streaming LLM.
```

## Étapes intermédiaires du flux asynchrone

Tous les runnables ont également une méthode `.astream_log()` qui est utilisée pour diffuser (au fur et à mesure) tout ou partie des étapes intermédiaires de votre chaîne/séquence.

Cela est utile pour montrer la progression à l'utilisateur, pour utiliser les résultats intermédiaires ou pour déboguer votre chaîne.

Vous pouvez diffuser toutes les étapes (par défaut) ou inclure/exclure des étapes par nom, balises ou métadonnées.

Cette méthode produit des opérations [JSONPatch](https://jsonpatch.com) qui, lorsqu'elles sont appliquées dans le même ordre que reçues, construisent l'état d'exécution RunState.

```python
class LogEntry(TypedDict):
    id: str
    """ID of the sub-run."""
    name: str
    """Name of the object being run."""
    type: str
    """Type of the object being run, eg. prompt, chain, llm, etc."""
    tags: List[str]
    """List of tags for the run."""
    metadata: Dict[str, Any]
    """Key-value pairs of metadata for the run."""
    start_time: str
    """ISO-8601 timestamp of when the run started."""

    streamed_output_str: List[str]
    """List of LLM tokens streamed by this run, if applicable."""
    final_output: Optional[Any]
    """Final output of this run.
    Only available after the run has finished successfully."""
    end_time: Optional[str]
    """ISO-8601 timestamp of when the run ended.
    Only available after the run has finished."""


class RunState(TypedDict):
    id: str
    """ID of the run."""
    streamed_output: List[Any]
    """List of output chunks streamed by Runnable.stream()"""
    final_output: Optional[Any]
    """Final output of the run, usually the result of aggregating (`+`) streamed_output.
    Only available after the run has finished successfully."""

    logs: Dict[str, LogEntry]
    """Map of run names to sub-runs. If filters were supplied, this list will
    contain only the runs that matched the filters."""
```

### Diffusion de morceaux de JSONPatch

Cela est utile, par exemple, pour diffuser le `JSONPatch` dans un serveur HTTP, puis appliquer les opérations sur le client pour reconstruire l'état d'exécution. Voir [LangServe](https://github.com/langchain-ai/langserve) pour des outils permettant de faciliter la construction d'un serveur web à partir de n'importe quel Runnable.

```python
async for chunk in retrieval_chain.astream_log(
    "where did harrison work?", include_names=["Docs"]
):
    print("-" * 40)
    print(chunk)
```

```output
----------------------------------------
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': '82e9b4b1-3dd6-4732-8db9-90e79c4da48c',
            'logs': {},
            'name': 'RunnableSequence',
            'streamed_output': [],
            'type': 'chain'}})
----------------------------------------
RunLogPatch({'op': 'add',
  'path': '/logs/Docs',
  'value': {'end_time': None,
            'final_output': None,
            'id': '9206e94a-57bd-48ee-8c5e-fdd1c52a6da2',
            'metadata': {},
            'name': 'Docs',
            'start_time': '2024-01-19T22:33:55.902+00:00',
            'streamed_output': [],
            'streamed_output_str': [],
            'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
            'type': 'retriever'}})
----------------------------------------
RunLogPatch({'op': 'add',
  'path': '/logs/Docs/final_output',
  'value': {'documents': [Document(page_content='harrison worked at kensho')]}},
 {'op': 'add',
  'path': '/logs/Docs/end_time',
  'value': '2024-01-19T22:33:56.064+00:00'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ''},
 {'op': 'replace', 'path': '/final_output', 'value': ''})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'H'},
 {'op': 'replace', 'path': '/final_output', 'value': 'H'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'arrison'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' worked'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' at'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked at'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Kens'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked at Kens'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'ho'},
 {'op': 'replace',
  'path': '/final_output',
  'value': 'Harrison worked at Kensho'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'},
 {'op': 'replace',
  'path': '/final_output',
  'value': 'Harrison worked at Kensho.'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ''})
```

### Diffusion de l'état d'exécution incrémentiel

Vous pouvez simplement passer `diff=False` pour obtenir des valeurs incrémentales de `RunState`.
Vous obtenez une sortie plus détaillée avec des parties plus répétitives.

```python
async for chunk in retrieval_chain.astream_log(
    "where did harrison work?", include_names=["Docs"], diff=False
):
    print("-" * 70)
    print(chunk)
```

```output
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': None,
                   'final_output': None,
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': '',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [''],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'H',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kens',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens', 'ho'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho.',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens', 'ho', '.'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho.',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['',
                     'H',
                     'arrison',
                     ' worked',
                     ' at',
                     ' Kens',
                     'ho',
                     '.',
                     ''],
 'type': 'chain'})
```

## Parallélisme

Examinons comment le langage d'expression LangChain prend en charge les requêtes parallèles.
Par exemple, lors de l'utilisation d'un `RunnableParallel` (souvent écrit sous forme de dictionnaire), il exécute chaque élément en parallèle.

```python
from langchain_core.runnables import RunnableParallel

chain1 = ChatPromptTemplate.from_template("tell me a joke about {topic}") | model
chain2 = (
    ChatPromptTemplate.from_template("write a short (2 line) poem about {topic}")
    | model
)
combined = RunnableParallel(joke=chain1, poem=chain2)
```

```python
%%time
chain1.invoke({"topic": "bears"})
```

```output
CPU times: user 18 ms, sys: 1.27 ms, total: 19.3 ms
Wall time: 692 ms
```

```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they already have bear feet!")
```

```python
%%time
chain2.invoke({"topic": "bears"})
```

```output
CPU times: user 10.5 ms, sys: 166 µs, total: 10.7 ms
Wall time: 579 ms
```

```output
AIMessage(content="In forest's embrace,\nMajestic bears pace.")
```

```python
%%time
combined.invoke({"topic": "bears"})
```

```output
CPU times: user 32 ms, sys: 2.59 ms, total: 34.6 ms
Wall time: 816 ms
```

```output
{'joke': AIMessage(content="Sure, here's a bear-related joke for you:\n\nWhy did the bear bring a ladder to the bar?\n\nBecause he heard the drinks were on the house!"),
 'poem': AIMessage(content="In wilderness they roam,\nMajestic strength, nature's throne.")}
```

### Parallélisme sur les lots

Le parallélisme peut être combiné avec d'autres runnables.
Essayons d'utiliser le parallélisme avec des lots.

```python
%%time
chain1.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 17.3 ms, sys: 4.84 ms, total: 22.2 ms
Wall time: 628 ms
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!")]
```

```python
%%time
chain2.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 15.8 ms, sys: 3.83 ms, total: 19.7 ms
Wall time: 718 ms
```

```output
[AIMessage(content='In the wild, bears roam,\nMajestic guardians of ancient home.'),
 AIMessage(content='Whiskers grace, eyes gleam,\nCats dance through the moonbeam.')]
```

```python
%%time
combined.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 44.8 ms, sys: 3.17 ms, total: 48 ms
Wall time: 721 ms
```

```output
[{'joke': AIMessage(content="Sure, here's a bear joke for you:\n\nWhy don't bears wear shoes?\n\nBecause they have bear feet!"),
  'poem': AIMessage(content="Majestic bears roam,\nNature's strength, beauty shown.")},
 {'joke': AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!"),
  'poem': AIMessage(content="Whiskers dance, eyes aglow,\nCats embrace the night's gentle flow.")}]
```
