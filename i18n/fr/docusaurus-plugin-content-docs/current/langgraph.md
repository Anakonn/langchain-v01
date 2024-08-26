---
fixed: true
translated: true
---

# 🦜🕸️LangGraph

[![Téléchargements](https://static.pepy.tech/badge/langgraph/month)](https://pepy.tech/project/langgraph)
[![Problèmes ouverts](https://img.shields.io/github/issues-raw/langchain-ai/langgraph)](https://github.com/langchain-ai/langgraph/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)
[![Documentation](https://img.shields.io/badge/docs-latest-blue)](https://langchain-ai.github.io/langgraph/)

⚡ Création d'agents linguistiques sous forme de graphes ⚡

## Aperçu

[LangGraph](https://langchain-ai.github.io/langgraph/) est une bibliothèque permettant de créer des applications multiacteurs avec états à l'aide de LLM.
Inspiré par [Pregel](https://research.google/pubs/pub37252/) et [Apache Beam](https://beam.apache.org/), LangGraph vous permet de coordonner et de sauvegarder plusieurs chaînes (ou acteurs) à travers des étapes de calcul cycliques à l'aide de fonctions Python régulières (ou [JS](https://github.com/langchain-ai/langgraphjs))). L'interface publique s'inspire de [NetworkX](https://networkx.org/documentation/latest/).

L'utilisation principale est d'ajouter des **cycles** et de la **persistance** à votre application LLM. Si vous n'avez besoin que de Directed Acyclic Graphs (DAGs) rapides, vous pouvez déjà y arriver en utilisant le [LangChain Expression Language](https://python.langchain.com/docs/expression_language/).

Les cycles sont importants pour les comportements agentiques, où vous appelez un LLM en boucle, lui demandant quelle action prendre ensuite.

## Installation

```shell
pip install -U langgraph
```

## Démarrage rapide

L'un des concepts centraux de LangGraph est l'état. Chaque exécution de graphe crée un état qui est transmis entre les nœuds du graphe lors de leur exécution, et chaque nœud met à jour cet état interne avec sa valeur de retour après son exécution. La façon dont le graphe met à jour son état interne est définie soit par le type de graphe choisi, soit par une fonction personnalisée.

L'état dans LangGraph peut être assez général, mais pour simplifier les choses au début, nous allons montrer un exemple où l'état du graphe se limite à une liste de messages de discussion à l'aide de la classe `MessageGraph` intégrée. Cela est pratique lors de l'utilisation de LangGraph avec les modèles de discussion LangChain, car nous pouvons directement renvoyer la sortie du modèle de discussion.

Commençons par installer le package d'intégration OpenAI de LangChain :

```python
pip install langchain_openai
```

Nous devons également exporter quelques variables d'environnement :

```shell
export OPENAI_API_KEY=sk-...
```

Et maintenant, nous sommes prêts ! Le graphe ci-dessous contient un seul nœud appelé `"oracle"` qui exécute un modèle de discussion, puis renvoie le résultat :

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.graph import END, MessageGraph

model = ChatOpenAI(temperature=0)

graph = MessageGraph()

graph.add_node("oracle", model)
graph.add_edge("oracle", END)

graph.set_entry_point("oracle")

runnable = graph.compile()
```

Exécutons-le !

```python
runnable.invoke(HumanMessage("What is 1 + 1?"))
```

```python
[HumanMessage(content='What is 1 + 1?'), AIMessage(content='1 + 1 equals 2.')]
```

Que venons-nous de faire ici ? Décomposons-le étape par étape :

1. Tout d'abord, nous initialisons notre modèle et un `MessageGraph`.
2. Ensuite, nous ajoutons un seul nœud au graphe, appelé `"oracle"`, qui appelle simplement le modèle avec l'entrée donnée.
3. Nous ajoutons une arête de ce nœud `"oracle"` à la chaîne spéciale `END` (`"__end__"`). Cela signifie que l'exécution se terminera après le nœud actuel.
4. Nous définissons `"oracle"` comme point d'entrée du graphe.
5. Nous compilons le graphe, le traduisant en opérations [pregel](https://research.google/pubs/pregel-a-system-for-large-scale-graph-processing/) de bas niveau, assurant ainsi qu'il peut être exécuté.

Ensuite, lors de l'exécution du graphe :

1. LangGraph ajoute le message d'entrée à l'état interne, puis transmet l'état au nœud d'entrée, `"oracle"`.
2. Le nœud `"oracle"` s'exécute, invoquant le modèle de discussion.
3. Le modèle de discussion renvoie un `AIMessage`. LangGraph l'ajoute à l'état.
4. L'exécution progresse jusqu'à la valeur spéciale `END` et renvoie l'état final.

Et en résultat, nous obtenons une liste de deux messages de discussion en sortie.

### Interaction avec LCEL

Pour ceux qui connaissent déjà LangChain - `add_node` accepte en fait n'importe quelle fonction ou [runnable](https://python.langchain.com/docs/expression_language/interface/) en entrée. Dans l'exemple ci-dessus, le modèle est utilisé "tel quel", mais nous aurions également pu passer une fonction :

```python
def call_oracle(messages: list):
    return model.invoke(messages)

graph.add_node("oracle", call_oracle)
```

Assurez-vous simplement d'être attentif au fait que l'entrée du [runnable](https://python.langchain.com/docs/expression_language/interface/) est l'**état actuel complet**. Donc cela échouera :

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
# This will not work with MessageGraph!
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant named {name} who always speaks in pirate dialect"),
    MessagesPlaceholder(variable_name="messages"),
])

chain = prompt | model

# State is a list of messages, but our chain expects a dict input:
#
# { "name": some_string, "messages": [] }
#
# Therefore, the graph will throw an exception when it executes here.
graph.add_node("oracle", chain)
```

## Arêtes conditionnelles

Passons maintenant à quelque chose de légèrement moins trivial. Les LLM ont du mal avec les mathématiques, alors permettons à l'LLM d'appeler conditionnellement un nœud `"multiply"` en utilisant l'[appel d'outils](https://python.langchain.com/docs/modules/model_io/chat/function_calling/).

Nous allons recréer notre graphe avec un `"multiply"` supplémentaire qui prendra le résultat du message le plus récent, s'il s'agit d'un appel d'outil, et calculera le résultat.
Nous [lierons](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools) également le schéma de la calculatrice au modèle OpenAI en tant qu'outil pour permettre au modèle d'utiliser l'outil nécessaire pour répondre à l'état actuel :

```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def multiply(first_number: int, second_number: int):
    """Multiplies two numbers together."""
    return first_number * second_number

model = ChatOpenAI(temperature=0)
model_with_tools = model.bind_tools([multiply])

builder = MessageGraph()

builder.add_node("oracle", model_with_tools)

tool_node = ToolNode([multiply])
builder.add_node("multiply", tool_node)

builder.add_edge("multiply", END)

builder.set_entry_point("oracle")
```

Réfléchissons maintenant - que voulons-nous qu'il se passe ?

- Si le nœud `"oracle"` renvoie un message attendant un appel d'outil, nous voulons exécuter le nœud `"multiply"`
- Sinon, nous pouvons simplement terminer l'exécution

Nous pouvons y parvenir à l'aide d'**arêtes conditionnelles**, qui appellent une fonction sur l'état actuel et acheminent l'exécution vers un nœud en fonction de la sortie de la fonction.

Voici à quoi cela ressemble :

```python
from typing import Literal

def router(state: List[BaseMessage]) -> Literal["multiply", "__end__"]:
    tool_calls = state[-1].additional_kwargs.get("tool_calls", [])
    if len(tool_calls):
        return "multiply"
    else:
        return "__end__"

builder.add_conditional_edges("oracle", router)
```

Si la sortie du modèle contient un appel d'outil, nous passons au nœud `"multiply"`. Sinon, nous terminons l'exécution.

Parfait ! Il ne reste plus qu'à compiler le graphe et à l'essayer. Les questions liées aux mathématiques sont acheminées vers l'outil de calculatrice :

```python
runnable = builder.compile()

runnable.invoke(HumanMessage("What is 123 * 456?"))
```

```output

[HumanMessage(content='What is 123 * 456?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_OPbdlm8Ih1mNOObGf3tMcNgb', 'function': {'arguments': '{"first_number":123,"second_number":456}', 'name': 'multiply'}, 'type': 'function'}]}),
 ToolMessage(content='56088', tool_call_id='call_OPbdlm8Ih1mNOObGf3tMcNgb')]
```

Tandis que les réponses conversationnelles sont directement renvoyées :

```python
runnable.invoke(HumanMessage("What is your name?"))
```

```output
[HumanMessage(content='What is your name?'),
 AIMessage(content='My name is Assistant. How can I assist you today?')]
```

## Cycles

Maintenant, examinons un exemple cyclique plus général. Nous allons recréer la classe `AgentExecutor` de LangChain. L'agent lui-même utilisera des modèles de chat et l'appel d'outils.
Cet agent représentera tout son état sous forme de liste de messages.

Nous devrons installer quelques packages communautaires LangChain, ainsi que [Tavily](https://app.tavily.com/sign-in) pour l'utiliser comme outil d'exemple.

```shell
pip install -U langgraph langchain_openai tavily-python
```

Nous devons également exporter quelques variables d'environnement supplémentaires pour l'accès à l'API OpenAI et Tavily.

```shell
export OPENAI_API_KEY=sk-...
export TAVILY_API_KEY=tvly-...
```

Facultativement, nous pouvons configurer [LangSmith](https://docs.smith.langchain.com/) pour une observabilité de classe mondiale.

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=ls__...
```

### Configurer les outils

Comme ci-dessus, nous allons d'abord définir les outils que nous voulons utiliser.
Pour cet exemple simple, nous utiliserons un outil de recherche web.
Cependant, il est très facile de créer vos propres outils - consultez la documentation [ici](https://python.langchain.com/docs/modules/agents/tools/custom_tools) pour savoir comment procéder.

```python
<!--IMPORTS:[{"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
```

Nous pouvons maintenant envelopper ces outils dans un simple [ToolNode](https://langchain-ai.github.io/langgraph/reference/prebuilt/#toolnode) LangGraph.
Cette classe reçoit la liste des messages (contenant [tool_calls](/html-tag/20]), appelle le(s) outil(s) que le LLM a demandé d'exécuter et renvoie la sortie sous forme de nouveau [ToolMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolMessage.html#langchain_core.messages.tool.ToolMessage)(s).

```python
from langgraph.prebuilt import ToolNode

tool_node = ToolNode(tools)
```

### Configurer le modèle

Maintenant, nous devons charger le modèle de chat à utiliser.

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_openai import ChatOpenAI

# We will set streaming=True so that we can stream tokens
# See the streaming section for more information on this.
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, streaming=True)
```

Après avoir fait cela, nous devrions nous assurer que le modèle sait qu'il a ces outils disponibles à appeler.
Nous pouvons le faire en convertissant les outils LangChain dans le format pour l'appel d'outils OpenAI à l'aide de la méthode [bind_tools()](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools).

```python
model = model.bind_tools(tools)
```

### Définir l'état de l'agent

Cette fois, nous utiliserons le `StateGraph` plus général.
Ce graphe est paramétré par un objet d'état qu'il fait circuler dans chaque nœud.
Rappelez-vous que chaque nœud renvoie ensuite des opérations pour mettre à jour cet état.
Ces opérations peuvent soit DÉFINIR des attributs spécifiques sur l'état (par exemple, écraser les valeurs existantes), soit AJOUTER à l'attribut existant.
S'il faut définir ou ajouter est indiqué en annotant l'objet d'état avec lequel vous construisez le graphe.

Pour cet exemple, l'état que nous suivrons sera simplement une liste de messages.
Nous voulons que chaque nœud ajoute simplement des messages à cette liste.
Par conséquent, nous utiliserons un `TypedDict` avec une seule clé (`messages`) et l'annoter afin que nous ajoutions toujours à la clé `messages` lors de la mise à jour à l'aide du second paramètre (`operator.add`).
(Remarque : l'état peut être de n'importe quel [type](https://docs.python.org/3/library/stdtypes.html#type-objects), y compris les [pydantic BaseModel](https://docs.pydantic.dev/latest/api/base_model/)).

```python
from typing import TypedDict, Annotated

def add_messages(left: list, right: list):
    """Add-don't-overwrite."""
    return left + right

class AgentState(TypedDict):
    # The `add_messages` function within the annotation defines
    # *how* updates should be merged into the state.
    messages: Annotated[list, add_messages]
```

Vous pouvez considérer le `MessageGraph` utilisé dans l'exemple initial comme une version préconfigurée de ce graphe, où l'état est directement un tableau de messages,
et l'étape de mise à jour ajoute toujours les valeurs renvoyées d'un nœud à l'état interne.

### Définir les nœuds

Nous devons maintenant définir quelques nœuds différents dans notre graphe.
Dans `langgraph`, un nœud peut être soit une fonction Python régulière, soit un [runnable](https://python.langchain.com/docs/expression_language/).

Il y a deux nœuds principaux dont nous avons besoin pour cela :

1. L'agent : responsable de décider quelles actions (le cas échéant) à entreprendre.
2. Une fonction pour invoquer les outils : si l'agent décide de prendre une action, ce nœud exécutera alors cette action. Nous l'avons déjà défini ci-dessus.

Nous devrons également définir quelques arêtes.
Certaines de ces arêtes peuvent être conditionnelles.
La raison pour laquelle elles sont conditionnelles est que la destination dépend du contenu de l'`État` du graphe.

Le chemin emprunté n'est pas connu avant que ce nœud ne soit exécuté (le LLM décide). Pour notre cas d'utilisation, nous aurons besoin d'un de chaque type d'arête :

1. Arête conditionnelle : après avoir appelé l'agent, nous devrions soit :

   a. Exécuter les outils si l'agent a demandé de prendre une action, OU

   b. Terminer (répondre à l'utilisateur) si l'agent n'a pas demandé d'exécuter des outils

2. Arête normale : après avoir invoqué les outils, le graphe devrait toujours revenir à l'agent pour décider de ce qu'il faut faire ensuite

Définissons les nœuds, ainsi qu'une fonction pour définir l'arête conditionnelle à emprunter.

```python
from typing import Literal

# Define the function that determines whether to continue or not
def should_continue(state: AgentState) -> Literal["action", "__end__"]:
    messages = state['messages']
    last_message = messages[-1]
    # If the LLM makes a tool call, then we route to the "action" node
    if last_message.tool_calls:
        return "action"
    # Otherwise, we stop (reply to the user)
    return "__end__"


# Define the function that calls the model
def call_model(state: AgentState):
    messages = state['messages']
    response = model.invoke(messages)
    # We return a list, because this will get added to the existing list
    return {"messages": [response]}
```

### Définir le graphe

Nous pouvons maintenant tout rassembler et définir le graphe !

```python
from langgraph.graph import StateGraph, END
# Define a new graph
workflow = StateGraph(AgentState)

# Define the two nodes we will cycle between
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)

# Set the entrypoint as `agent`
# This means that this node is the first one called
workflow.set_entry_point("agent")

# We now add a conditional edge
workflow.add_conditional_edges(
    # First, we define the start node. We use `agent`.
    # This means these are the edges taken after the `agent` node is called.
    "agent",
    # Next, we pass in the function that will determine which node is called next.
    should_continue,
)

# We now add a normal edge from `tools` to `agent`.
# This means that after `tools` is called, `agent` node is called next.
workflow.add_edge('action', 'agent')

# Finally, we compile it!
# This compiles it into a LangChain Runnable,
# meaning you can use it as you would any other runnable
app = workflow.compile()
```

### L'utiliser !

Nous pouvons maintenant l'utiliser !
Cela expose maintenant l'[interface](https://python.langchain.com/docs/expression_language/) identique à tous les autres runnables LangChain.
Ce [runnable](https://python.langchain.com/docs/expression_language/interface/) accepte une liste de messages.

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_core.messages import HumanMessage

inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
app.invoke(inputs)
```

Cela peut prendre un peu de temps - il effectue quelques appels en coulisses.
Afin de commencer à voir quelques résultats intermédiaires au fur et à mesure, nous pouvons utiliser le streaming - voir ci-dessous pour plus d'informations à ce sujet.

## Streaming

LangGraph prend en charge plusieurs types de streaming différents.

### Streaming de la sortie des nœuds

L'un des avantages de l'utilisation de LangGraph est qu'il est facile de diffuser la sortie au fur et à mesure qu'elle est produite par chaque nœud.

```python
inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
for output in app.stream(inputs, stream_mode="updates"):
    # stream() yields dictionaries with output keyed by node name
    for key, value in output.items():
        print(f"Output from node '{key}':")
        print("---")
        print(value)
    print("\n---\n")
```

```output
Output from node 'agent':
---
{'messages': [AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}})]}

---

Output from node 'action':
---
{'messages': [FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json')]}

---

Output from node 'agent':
---
{'messages': [AIMessage(content="I couldn't find the current weather in San Francisco. However, you can visit [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States) to check the historical weather data for January 2024 in San Francisco.")]}

---

Output from node '__end__':
---
{'messages': [HumanMessage(content='what is the weather in sf'), AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}}), FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json'), AIMessage(content="I couldn't find the current weather in San Francisco. However, you can visit [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States) to check the historical weather data for January 2024 in San Francisco.")]}

---
```

### Streaming des jetons LLM

Vous pouvez également accéder aux jetons LLM au fur et à mesure qu'ils sont produits par chaque nœud.
Dans ce cas, seul le nœud "agent" produit des jetons LLM.
Pour que cela fonctionne correctement, vous devez utiliser un LLM qui prend en charge le streaming et l'avoir défini lors de la construction du LLM (par exemple, `ChatOpenAI(model="gpt-3.5-turbo-1106", streaming=True)`)

```python
inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
async for output in app.astream_log(inputs, include_types=["llm"]):
    # astream_log() yields the requested logs (here LLMs) in JSONPatch format
    for op in output.ops:
        if op["path"] == "/streamed_output/-":
            # this is the output from .stream()
            ...
        elif op["path"].startswith("/logs/") and op["path"].endswith(
            "/streamed_output/-"
        ):
            # because we chose to only include LLMs, these are LLM tokens
            print(op["value"])
```

```output
content='' additional_kwargs={'function_call': {'arguments': '', 'name': 'tavily_search_results_json'}}
content='' additional_kwargs={'function_call': {'arguments': '{\n', 'name': ''}}}
content='' additional_kwargs={'function_call': {'arguments': ' ', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': ' "', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': 'query', 'name': ''}}
...
```

## Quand utiliser

Quand devriez-vous utiliser ceci par rapport à [LangChain Expression Language](https://python.langchain.com/docs/expression_language/) ?

Si vous avez besoin de cycles.

LangChain Expression Language vous permet de définir facilement des chaînes (DAG) mais n'a pas de bon mécanisme pour ajouter des cycles.
`langgraph` ajoute cette syntaxe.

## Documentation

Nous espérons que cela vous a donné un aperçu de ce que vous pouvez construire ! Consultez le reste de la documentation pour en savoir plus.

### Tutoriels

Apprenez à construire avec LangGraph grâce à des exemples guidés dans les [Tutoriels LangGraph](https://langchain-ai.github.io/langgraph/tutorials/).

Nous vous recommandons de commencer par l'[Introduction à LangGraph](https://langchain-ai.github.io/langgraph/tutorials/introduction/) avant d'essayer les guides plus avancés.

### Guides pratiques

Les [guides pratiques LangGraph](https://langchain-ai.github.io/langgraph/how-tos/) montrent comment accomplir des choses spécifiques dans LangGraph, du streaming, à l'ajout de mémoire et de persistance, en passant par les modèles de conception courants (branchement, sous-graphes, etc.), c'est là que vous devez aller si vous voulez copier et exécuter un extrait de code spécifique.

### Référence

L'API LangGraph a quelques classes et méthodes importantes qui sont toutes couvertes dans les [Documents de référence](https://langchain-ai.github.io/langgraph/reference/graphs/). Consultez-les pour voir les arguments de fonction spécifiques et des exemples simples sur la façon d'utiliser l'API du graphe et du checkpointing, ou pour voir certains des composants prédéfinis de plus haut niveau.
