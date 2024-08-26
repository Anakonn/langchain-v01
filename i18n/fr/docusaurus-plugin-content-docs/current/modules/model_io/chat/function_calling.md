---
sidebar_position: 2
title: Appel d'outil/fonction
translated: true
---

# Appel d'outil

:::info
Nous utilisons le terme "appel d'outil" de manière interchangeable avec "appel de fonction". Bien que l'appel de fonction soit parfois destiné à faire référence à l'invocation d'une seule fonction, nous traitons tous les modèles comme s'ils pouvaient renvoyer plusieurs appels d'outils ou de fonctions dans chaque message.
:::

:::tip
Voir [ici](/docs/integrations/chat/) pour une liste de tous les modèles qui prennent en charge l'appel d'outil.
:::

L'appel d'outil permet à un modèle de répondre à un prompt donné en générant une sortie qui correspond à un schéma défini par l'utilisateur. Bien que le nom implique que le modèle effectue une action, ce n'est en fait pas le cas ! Le modèle élabore les arguments d'un outil, et le fait de réellement exécuter l'outil (ou non) dépend de l'utilisateur - par exemple, si vous voulez [extraire une sortie correspondant à un certain schéma](/docs/use_cases/extraction/) à partir d'un texte non structuré, vous pourriez donner au modèle un outil "d'extraction" qui prend des paramètres correspondant au schéma souhaité, puis traiter la sortie générée comme votre résultat final.

Un appel d'outil comprend un nom, un dictionnaire d'arguments et un identifiant optionnel. Le dictionnaire d'arguments est structuré `{nom_argument: valeur_argument}`.

De nombreux fournisseurs de LLM, notamment [Anthropic](https://www.anthropic.com/), [Cohere](https://cohere.com/), [Google](https://cloud.google.com/vertex-ai), [Mistral](https://mistral.ai/), [OpenAI](https://openai.com/) et d'autres, prennent en charge des variantes d'une fonctionnalité d'appel d'outil. Ces fonctionnalités permettent généralement aux requêtes adressées au LLM d'inclure les outils disponibles et leurs schémas, et aux réponses d'inclure des appels à ces outils. Par exemple, étant donné un outil de moteur de recherche, un LLM pourrait gérer une requête en émettant d'abord un appel à ce moteur de recherche. Le système appelant le LLM peut recevoir l'appel d'outil, l'exécuter et renvoyer la sortie au LLM pour l'informer de sa réponse. LangChain inclut une suite d'[outils intégrés](/docs/integrations/tools/) et prend en charge plusieurs méthodes pour définir vos propres [outils personnalisés](/docs/modules/tools/custom_tools). L'appel d'outil est extrêmement utile pour construire des [chaînes et des agents utilisant des outils](/docs/use_cases/tool_use), et pour obtenir des sorties structurées des modèles de manière plus générale.

Les fournisseurs adoptent différentes conventions pour formater les schémas d'outils et les appels d'outils. Par exemple, Anthropic renvoie les appels d'outils sous forme de structures analysées dans un bloc de contenu plus large :

```python
[
  {
    "text": "<thinking>\nI should use a tool.\n</thinking>",
    "type": "text"
  },
  {
    "id": "id_value",
    "input": {"arg_name": "arg_value"},
    "name": "tool_name",
    "type": "tool_use"
  }
]
```

tandis qu'OpenAI sépare les appels d'outils dans un paramètre distinct, avec les arguments sous forme de chaînes JSON :

```python
{
  "tool_calls": [
    {
      "id": "id_value",
      "function": {
        "arguments": '{"arg_name": "arg_value"}',
        "name": "tool_name"
      },
      "type": "function"
    }
  ]
}
```

LangChain met en œuvre des interfaces standard pour définir des outils, les transmettre aux LLM et représenter les appels d'outils.

## Requête : Transmettre des outils au modèle

Pour qu'un modèle puisse invoquer des outils, vous devez lui transmettre les schémas d'outils lors de la réalisation d'une requête de chat. Les modèles de chat LangChain prenant en charge les fonctionnalités d'appel d'outil mettent en œuvre une méthode `.bind_tools` qui reçoit une liste d'objets [outil](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.BaseTool.html#langchain_core.tools.BaseTool) LangChain, de classes Pydantic ou de schémas JSON et les lie au modèle de chat dans le format attendu par le fournisseur. Les invocations ultérieures du modèle de chat lié incluront les schémas d'outils dans chaque appel à l'API du modèle.

### Définition des schémas d'outils : Outil LangChain

Par exemple, nous pouvons définir le schéma pour les outils personnalisés à l'aide du décorateur `@tool` sur les fonctions Python :

```python
from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
```

### Définition des schémas d'outils : Classe Pydantic

Nous pouvons également définir le schéma à l'aide de Pydantic. Pydantic est utile lorsque les entrées de vos outils sont plus complexes :

```python
from langchain_core.pydantic_v1 import BaseModel, Field


# Note that the docstrings here are crucial, as they will be passed along
# to the model along with the class name.
class add(BaseModel):
    """Add two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


tools = [add, multiply]
```

Nous pouvons les lier aux modèles de chat comme suit :

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>

### Liaison des schémas d'outils

Nous pouvons utiliser la méthode `bind_tools()` pour gérer la conversion de `Multiply` en "outil" et le lier au modèle (c'est-à-dire le transmettre à chaque fois que le modèle est invoqué).

```python
# | echo: false
# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

```python
llm_with_tools = llm.bind_tools(tools)
```

## Requête : Forcer un appel d'outil

Lorsque vous utilisez simplement `bind_tools(tools)`, le modèle peut choisir de renvoyer un seul appel d'outil, plusieurs appels d'outils ou aucun appel d'outil. Certains modèles prennent en charge un paramètre `tool_choice` qui vous permet d'obliger le modèle à appeler un outil. Pour les modèles qui prennent en charge cette fonctionnalité, vous pouvez transmettre le nom de l'outil que vous voulez que le modèle appelle toujours `tool_choice="nom_outil_xyz"`. Ou vous pouvez transmettre `tool_choice="any"` pour forcer le modèle à appeler au moins un outil, sans préciser lequel spécifiquement.

:::note
Actuellement, la fonctionnalité `tool_choice="any"` est prise en charge par OpenAI, MistralAI, FireworksAI et Groq.

Actuellement, Anthropic ne prend pas en charge `tool_choice` du tout.
:::

Si nous voulions que notre modèle appelle toujours l'outil de multiplication, nous pourrions faire :

```python
always_multiply_llm = llm.bind_tools([multiply], tool_choice="multiply")
```

Et si nous voulions qu'il appelle au moins l'un des outils d'addition ou de multiplication, nous pourrions faire :

```python
always_call_tool_llm = llm.bind_tools([add, multiply], tool_choice="any")
```

## Réponse : Lecture des appels d'outils à partir de la sortie du modèle

Si les appels d'outils sont inclus dans la réponse d'un LLM, ils sont attachés à l'[AIMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage) ou à l'[AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) correspondant (lors du streaming) sous forme de liste d'objets [ToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCall.html#langchain_core.messages.tool.ToolCall) dans l'attribut `.tool_calls`. Un `ToolCall` est un dictionnaire typé qui inclut un nom d'outil, un dictionnaire de valeurs d'arguments et (facultativement) un identifiant. Les messages sans appels d'outils ont une liste vide pour cet attribut.

Exemple :

```python
query = "What is 3 * 12? Also, what is 11 + 49?"

llm_with_tools.invoke(query).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_UL7E2232GfDHIQGOM4gJfEDD'},
 {'name': 'add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_VKw8t5tpAuzvbHgdAXe9mjUx'}]
```

L'attribut `.tool_calls` doit contenir des appels d'outils valides. Notez que parfois, les fournisseurs de modèles peuvent produire des appels d'outils mal formés (par exemple, des arguments qui ne sont pas du JSON valide). Lorsque l'analyse échoue dans ces cas, des instances d'[InvalidToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.InvalidToolCall.html#langchain_core.messages.tool.InvalidToolCall) sont remplies dans l'attribut `.invalid_tool_calls`. Un `InvalidToolCall` peut avoir un nom, des arguments sous forme de chaîne, un identifiant et un message d'erreur.

Si nécessaire, les [analyseurs de sortie](/docs/modules/model_io/output_parsers) peuvent traiter davantage la sortie. Par exemple, nous pouvons la convertir en classe Pydantic d'origine :

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser

chain = llm_with_tools | PydanticToolsParser(tools=[multiply, add])
chain.invoke(query)
```

```output
[multiply(a=3, b=12), add(a=11, b=49)]
```

## Réponse : Streaming

Lorsque des outils sont appelés dans un contexte de streaming, les [morceaux de message](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) seront remplis avec des objets [morceaux d'appel d'outil](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCallChunk.html#langchain_core.messages.tool.ToolCallChunk) dans une liste via l'attribut `.tool_call_chunks`. Un `ToolCallChunk` inclut des champs de chaîne facultatifs pour le `nom` de l'outil, les `args` et l'`id`, et inclut un champ entier facultatif `index` qui peut être utilisé pour joindre les morceaux ensemble. Les champs sont facultatifs car des parties d'un appel d'outil peuvent être diffusées sur différents morceaux (par exemple, un morceau qui inclut une sous-chaîne des arguments peut avoir des valeurs nulles pour le nom et l'identifiant de l'outil).

Comme les morceaux de message héritent de leur classe de message parent, un [AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) avec des morceaux d'appel d'outil inclura également les champs `.tool_calls` et `.invalid_tool_calls`. Ces champs sont analysés au mieux à partir des morceaux d'appel d'outil du message.

Notez que tous les fournisseurs ne prennent pas encore en charge le streaming pour les appels d'outils.

Exemple :

```python
async for chunk in llm_with_tools.astream(query):
    print(chunk.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_5Gdgx3R2z97qIycWKixgD2OU', 'index': 0}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 0}]
[{'name': None, 'args': ': 3, ', 'id': None, 'index': 0}]
[{'name': None, 'args': '"b": 1', 'id': None, 'index': 0}]
[{'name': None, 'args': '2}', 'id': None, 'index': 0}]
[{'name': 'add', 'args': '', 'id': 'call_DpeKaF8pUCmLP0tkinhdmBgD', 'index': 1}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 1}]
[{'name': None, 'args': ': 11,', 'id': None, 'index': 1}]
[{'name': None, 'args': ' "b": ', 'id': None, 'index': 1}]
[{'name': None, 'args': '49}', 'id': None, 'index': 1}]
[]
```

Notez que l'ajout de morceaux de message fusionnera leurs morceaux d'appel d'outil correspondants. C'est le principe par lequel les divers [analyseurs de sortie d'outils](/docs/modules/model_io/output_parsers/types/openai_tools/) de LangChain prennent en charge le streaming.

Par exemple, ci-dessous nous accumulons des morceaux d'appel d'outil :

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a"', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, ', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 1', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a"', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11,', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": ', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
```

```python
print(type(gathered.tool_call_chunks[0]["args"]))
```

```output
<class 'str'>
```

Et ci-dessous, nous accumulons des appels d'outils pour démontrer l'analyse partielle :

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_calls)
```

```output
[]
[]
[{'name': 'multiply', 'args': {}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 1}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
```

```python
print(type(gathered.tool_calls[0]["args"]))
```

```output
<class 'dict'>
```

## Demande : Transmettre les sorties d'outils au modèle

Si nous utilisons les invocations d'outils générées par le modèle pour appeler réellement les outils et que nous voulons transmettre les résultats des outils au modèle, nous pouvons le faire à l'aide de `ToolMessage`.

```python
from langchain_core.messages import HumanMessage, ToolMessage


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
llm_with_tools = llm.bind_tools(tools)

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_output = selected_tool.invoke(tool_call["args"])
    messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))

messages
```

```output
[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_Jja7J89XsjrOLA5rAjULqTSL', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 49, 'prompt_tokens': 144, 'total_tokens': 193}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_a450710239', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-9db7e8e1-86d5-4015-9f43-f1d33abea64d-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_Jja7J89XsjrOLA5rAjULqTSL'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ'}]),
 ToolMessage(content='36', tool_call_id='call_Jja7J89XsjrOLA5rAjULqTSL'),
 ToolMessage(content='60', tool_call_id='call_K4ArVEUjhl36EcSuxGN1nwvZ')]
```

```python
llm_with_tools.invoke(messages)
```

```output
AIMessage(content='3 * 12 = 36\n11 + 49 = 60', response_metadata={'token_usage': {'completion_tokens': 16, 'prompt_tokens': 209, 'total_tokens': 225}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'stop', 'logprobs': None}, id='run-a55f8cb5-6d6d-4835-9c6b-7de36b2590c7-0')
```

## Demande : Prompt few-shot

Pour une utilisation plus complexe des outils, il est très utile d'ajouter des exemples few-shot au prompt. Nous pouvons le faire en ajoutant des `AIMessage` avec des `ToolCall` et des `ToolMessage` correspondants à notre prompt.

:::note
Pour la plupart des modèles, il est important que les identifiants ToolCall et ToolMessage correspondent, afin que chaque AIMessage avec ToolCalls soit suivi de ToolMessages avec les identifiants correspondants.

Par exemple, même avec quelques instructions spéciales, notre modèle peut se tromper sur l'ordre des opérations :

```python
llm_with_tools.invoke(
    "Whats 119 times 8 minus 20. Don't do any math yourself, only use tools for math. Respect order of operations"
).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_RofMKNQ2qbWAFaMsef4cpTS9'},
 {'name': 'add',
  'args': {'a': 952, 'b': -20},
  'id': 'call_HjOfoF8ceMCHmO3cpwG6oB3X'}]
```

Le modèle ne devrait pas essayer d'ajouter quoi que ce soit pour le moment, car techniquement il ne peut pas encore connaître les résultats de 119 * 8.

En ajoutant un prompt avec quelques exemples, nous pouvons corriger ce comportement :

```python
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

examples = [
    HumanMessage(
        "What's the product of 317253 and 128472 plus four", name="example_user"
    ),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {"name": "multiply", "args": {"x": 317253, "y": 128472}, "id": "1"}
        ],
    ),
    ToolMessage("16505054784", tool_call_id="1"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[{"name": "add", "args": {"x": 16505054784, "y": 4}, "id": "2"}],
    ),
    ToolMessage("16505054788", tool_call_id="2"),
    AIMessage(
        "The product of 317253 and 128472 plus four is 16505054788",
        name="example_assistant",
    ),
]

system = """You are bad at math but are an expert at using a calculator.

Use past tool usage as an example of how to correctly use the tools."""
few_shot_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        *examples,
        ("human", "{query}"),
    ]
)

chain = {"query": RunnablePassthrough()} | few_shot_prompt | llm_with_tools
chain.invoke("Whats 119 times 8 minus 20").tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_tWwpzWqqc8dQtN13CyKZCVMe'}]
```

Il semble que nous obtenions la sortie correcte cette fois-ci.

Voici à quoi ressemble la [trace LangSmith](https://smith.langchain.com/public/f70550a1-585f-4c9d-a643-13148ab1616f/r).

## Prochaines étapes

- **Analyse de la sortie** : Consultez les [analyseurs de sortie d'outils OpenAI](/docs/modules/model_io/output_parsers/types/openai_tools/) et les [analyseurs de sortie de fonctions OpenAI](/docs/modules/model_io/output_parsers/types/openai_functions/) pour apprendre à extraire les réponses de l'API d'appel de fonction dans divers formats.
- **Chaînes de sortie structurées** : [Certains modèles ont des constructeurs](/docs/modules/model_io/chat/structured_output/) qui gèrent la création d'une chaîne de sortie structurée pour vous.
- **Utilisation des outils** : Découvrez comment construire des chaînes et des agents qui appellent les outils invoqués dans [ces guides](/docs/use_cases/tool_use/).
