---
sidebar_position: 1.5
title: Diffusion en continu
translated: true
---

# Diffusion en continu avec LangChain

La diffusion en continu est essentielle pour rendre les applications basées sur les LLM réactives pour les utilisateurs finaux.

Les primitives importantes de LangChain comme les LLM, les parsers, les prompts, les retrieveurs et les agents implémentent l'[Interface Runnable](/docs/expression_language/interface) LangChain.

Cette interface propose deux approches générales pour diffuser du contenu :

1. sync `stream` et async `astream` : une **implémentation par défaut** de la diffusion en continu qui diffuse la **sortie finale** de la chaîne.
2. async `astream_events` et async `astream_log` : ceux-ci fournissent un moyen de diffuser à la fois les **étapes intermédiaires** et la **sortie finale** de la chaîne.

Examinons les deux approches et essayons de comprendre comment les utiliser. 🥷

## Utilisation de Stream

Tous les objets `Runnable` implémentent une méthode synchrone appelée `stream` et une variante asynchrone appelée `astream`.

Ces méthodes sont conçues pour diffuser la sortie finale en morceaux, en produisant chaque morceau dès qu'il est disponible.

La diffusion en continu n'est possible que si toutes les étapes du programme savent comment traiter un **flux d'entrée** ; c'est-à-dire traiter un morceau d'entrée un par un et produire un morceau de sortie correspondant.

La complexité de ce traitement peut varier, des tâches simples comme l'émission de jetons produits par un LLM, aux tâches plus difficiles comme la diffusion de parties de résultats JSON avant que l'ensemble du JSON ne soit complet.

Le meilleur endroit pour commencer à explorer la diffusion en continu est avec les composants les plus importants des applications LLM — les LLM eux-mêmes !

### LLMs et modèles de chat

Les grands modèles de langage et leurs variantes de chat sont le principal goulot d'étranglement dans les applications basées sur les LLM. 🙊

Les grands modèles de langage peuvent prendre **plusieurs secondes** pour générer une réponse complète à une requête. C'est beaucoup plus lent que le seuil **~200-300 ms** à partir duquel une application semble réactive pour un utilisateur final.

La stratégie clé pour rendre l'application plus réactive est de montrer les progrès intermédiaires ; à savoir, diffuser la sortie du modèle **jeton par jeton**.

Nous montrerons des exemples de diffusion en continu en utilisant le modèle de chat de [Anthropic](/docs/integrations/platforms/anthropic). Pour utiliser le modèle, vous devrez installer le package `langchain-anthropic`. Vous pouvez le faire avec la commande suivante :

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

Examinons l'un des morceaux

```python
chunks[0]
```

```output
AIMessageChunk(content=' Hello')
```

Nous avons récupéré quelque chose appelé un `AIMessageChunk`. Ce morceau représente une partie d'un `AIMessage`.

Les morceaux de message sont additifs par conception : on peut simplement les additionner pour obtenir l'état de la réponse jusqu'à présent !

```python
chunks[0] + chunks[1] + chunks[2] + chunks[3] + chunks[4]
```

```output
AIMessageChunk(content=' Hello! My name is')
```

### Chaînes

Pratiquement toutes les applications LLM impliquent plus d'étapes qu'un simple appel à un modèle de langage.

Construisons une chaîne simple en utilisant le `LangChain Expression Language` (`LCEL`) qui combine un prompt, un modèle et un parser et vérifions que la diffusion en continu fonctionne.

Nous utiliserons `StrOutputParser` pour analyser la sortie du modèle. Il s'agit d'un parser simple qui extrait le champ `content` d'un `AIMessageChunk`, nous donnant le `token` renvoyé par le modèle.

:::tip
LCEL est un moyen *déclaratif* de spécifier un "programme" en enchaînant différentes primitives LangChain. Les chaînes créées à l'aide de LCEL bénéficient d'une implémentation automatique de `stream` et `astream` permettant la diffusion de la sortie finale. En fait, les chaînes créées avec LCEL implémentent l'ensemble de l'interface Runnable standard.
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

Vous remarquerez peut-être ci-dessus que `parser` ne bloque en fait pas la sortie en continu du modèle, mais traite chaque morceau individuellement. De nombreuses [primitives LCEL](/docs/expression_language/primitives) prennent également en charge ce type de diffusion par transformation, ce qui peut être très pratique lors de la construction d'applications.

Certaines runnables, comme [prompt templates](/docs/modules/model_io/prompts) et [chat models](/docs/modules/model_io/chat), ne peuvent pas traiter les morceaux individuels et agrègent à la place toutes les étapes précédentes. Cela interrompra le processus de diffusion en continu. Des fonctions personnalisées peuvent être [conçues pour renvoyer des générateurs](/docs/expression_language/primitives/functions#streaming), qui

:::note
Si la fonctionnalité ci-dessus n'est pas pertinente pour ce que vous construisez, vous n'avez pas besoin d'utiliser le `LangChain Expression Language` pour utiliser LangChain et pouvez à la place vous fier à une approche de programmation **impérative** standard en
appelant `invoke`, `batch` ou `stream` sur chaque composant individuellement, en assignant les résultats aux variables et en les utilisant en aval comme bon vous semble.

Si cela fonctionne pour vos besoins, alors c'est parfait pour nous 👌!
:::

### Travailler avec des flux d'entrée

Que faire si vous souhaitez diffuser du JSON à partir de la sortie au fur et à mesure de sa génération ?

Si vous deviez vous fier à `json.loads` pour analyser le json partiel, l'analyse échouerait car le json partiel ne serait pas un json valide.

Vous seriez probablement complètement perdu et prétendriez qu'il n'était pas possible de diffuser du JSON.

Eh bien, il s'avère qu'il existe un moyen de le faire : le parser doit fonctionner sur le **flux d'entrée** et tenter de "compléter automatiquement" le json partiel dans un état valide.

Voyons un tel parser en action pour comprendre ce que cela signifie.

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

Maintenant, **cassons** la diffusion en continu. Nous utiliserons l'exemple précédent et ajouterons une fonction d'extraction à la fin qui extrait les noms de pays du JSON finalisé.

:::warning
Toutes les étapes de la chaîne qui fonctionnent sur des **entrées finalisées** plutôt que sur des **flux d'entrée** peuvent casser la fonctionnalité de diffusion en continu via `stream` ou `astream`.
:::

:::tip
Plus tard, nous discuterons de l'API `astream_events` qui diffuse les résultats des étapes intermédiaires. Cette API diffusera les résultats des étapes intermédiaires même si la chaîne contient des étapes qui ne fonctionnent que sur des **entrées finalisées**.
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

#### Fonctions génératrices

Corrigeons la diffusion en continu à l'aide d'une fonction génératrice qui peut fonctionner sur le **flux d'entrée**.

:::tip
Une fonction génératrice (une fonction qui utilise `yield`) permet d'écrire du code qui fonctionne sur des **flux d'entrée**
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
Étant donné que le code ci-dessus se base sur l'auto-complétion JSON, vous pouvez voir des noms de pays partiels (par exemple, `Sp` et `Spain`), ce qui n'est pas ce que l'on voudrait pour un résultat d'extraction !

Nous nous concentrons sur les concepts de diffusion en continu, pas nécessairement sur les résultats des chaînes.
:::

### Composants non diffusants

Certains composants intégrés comme les Retrievers n'offrent pas de `diffusion en continu`. Que se passe-t-il si nous essayons de les `stream` ? 🤨

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

Stream a simplement produit le résultat final de ce composant.

C'est OK 🥹! Tous les composants n'ont pas à implémenter la diffusion en continu : dans certains cas, la diffusion en continu est soit inutile, difficile ou tout simplement n'a pas de sens.

:::tip
Une chaîne LCEL construite à l'aide de composants non diffusants pourra toujours diffuser dans de nombreux cas, avec la diffusion de la sortie partielle commençant après la dernière étape non diffusante de la chaîne.
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

Maintenant que nous avons vu comment fonctionnent `stream` et `astream`, explorons le monde de la diffusion d'événements. 🏞️

## Utilisation des événements de diffusion en continu

La diffusion d'événements est une API **bêta**. Cette API peut changer un peu en fonction des retours.

:::note
Introduit dans langchain-core **0.1.14**.
:::

```python
import langchain_core

langchain_core.__version__
```

```output
'0.1.18'
```

Pour que l'API `astream_events` fonctionne correctement :

* Utilisez `async` dans tout le code autant que possible (par exemple, outils async, etc.)
* Propager des callbacks si vous définissez des fonctions / runnables personnalisés
* Chaque fois que vous utilisez des runnables sans LCEL, assurez-vous d'appeler `.astream()` sur les LLM plutôt que `.ainvoke` pour forcer le LLM à diffuser des jetons.
* Faites-nous savoir si quelque chose ne fonctionne pas comme prévu ! :)

### Référence des Événements

Vous trouverez ci-dessous un tableau de référence qui montre certains événements pouvant être émis par les différents objets Runnable.

:::note
Lorsque le streaming est correctement implémenté, les entrées d'un runnable ne seront pas connues avant que le flux d'entrée ait été entièrement consommé. Cela signifie que `inputs` sera souvent inclus uniquement pour les événements `end` et non pour les événements `start`.
:::

| événement            | nom              | chunk                           | input                                         | output                                          |
|----------------------|------------------|---------------------------------|-----------------------------------------------|-------------------------------------------------|
| on_chat_model_start  | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]} |                                                 |
| on_chat_model_stream | [model name]     | AIMessageChunk(content="hello") |                                               |                                                 |
| on_chat_model_end    | [model name]     |                                 | {"messages": [[SystemMessage, HumanMessage]]} | {"generations": [...], "llm_output": None, ...} |
| on_llm_start         | [model name]     |                                 | {'input': 'hello'}                            |                                                 |
| on_llm_stream        | [model name]     | 'Hello'                         |                                               |                                                 |
| on_llm_end           | [model name]     |                                 | 'Hello human!'                                |
| on_chain_start       | format_docs      |                                 |                                               |                                                 |
| on_chain_stream      | format_docs      | "hello world!, goodbye world!"  |                                               |                                                 |
| on_chain_end         | format_docs      |                                 | [Document(...)]                               | "hello world!, goodbye world!"                  |
| on_tool_start        | some_tool        |                                 | {"x": 1, "y": "2"}                            |                                                 |
| on_tool_stream       | some_tool        | {"x": 1, "y": "2"}              |                                               |                                                 |
| on_tool_end          | some_tool        |                                 |                                               | {"x": 1, "y": "2"}                              |
| on_retriever_start   | [retriever name] |                                 | {"query": "hello"}                            |                                                 |
| on_retriever_chunk   | [retriever name] | {documents: [...]}              |                                               |                                                 |
| on_retriever_end     | [retriever name] |                                 | {"query": "hello"}                            | {documents: [...]}                              |
| on_prompt_start      | [template_name]  |                                 | {"question": "hello"}                         |                                                 |
| on_prompt_end        | [template_name]  |                                 | {"question": "hello"}                         | ChatPromptValue(messages: [SystemMessage, ...]) |

### Modèle de Chat

Commençons par examiner les événements produits par un modèle de chat.

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

Hé, c'est quoi ce drôle de paramètre version="v1" dans l'API ? 😾

C'est une **API bêta**, et nous allons presque certainement y apporter des modifications.

Ce paramètre de version nous permettra de minimiser les changements perturbateurs pour votre code.

En bref, nous vous ennuyons maintenant, afin de ne pas vous ennuyer plus tard.
:::

Jetons un coup d'œil à quelques événements de début et à quelques événements de fin.

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

### Chaîne

Revisons l'exemple de chaîne qui analysait le JSON en streaming pour explorer l'API des événements de streaming.

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

Si vous examinez les premiers événements, vous remarquerez qu'il y a **3** événements de début différents au lieu de **2** événements de début.

Les trois événements de début correspondent à :

1. La chaîne (modèle + parseur)
2. Le modèle
3. Le parseur

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

Que pensez-vous que vous verriez si vous regardiez les 3 derniers événements ? Et pour le milieu ?

Utilisons cette API pour extraire les événements de streaming du modèle et du parseur. Nous ignorons les événements de début, de fin et les événements de la chaîne.

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

Comme le modèle et le parseur prennent en charge le streaming, nous voyons les événements de streaming des deux composants en temps réel ! C'est plutôt cool, n'est-ce pas ? 🦜

### Filtrage des Événements

Étant donné que cette API produit de nombreux événements, il est utile de pouvoir filtrer les événements.

Vous pouvez filtrer par `name` du composant, par `tags` du composant ou par `type` du composant.

#### Par Nom

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

#### Par Type

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

#### Par Tags

:::caution

Les tags sont hérités par les composants enfants d'un runnable donné.

Si vous utilisez des tags pour filtrer, assurez-vous que c'est bien ce que vous voulez.
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

### Composants non-streaming

Vous vous souvenez comment certains composants ne fonctionnent pas bien en streaming car ils n'opèrent pas sur des **flux d'entrée** ?

Bien que ces composants puissent interrompre le streaming de la sortie finale lors de l'utilisation de `astream`, `astream_events` continuera à produire des événements de streaming à partir des étapes intermédiaires qui prennent en charge le streaming !

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

Comme prévu, l'API `astream` ne fonctionne pas correctement car `_extract_country_names` n'opère pas sur des flux.

```python
async for chunk in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
):
    print(chunk, flush=True)
```

```output
['France', 'Spain', 'Japan']
```

Maintenant, confirmons qu'avec astream_events nous voyons toujours la sortie en streaming du modèle et du parseur.

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

### Propagation des Callbacks

:::caution
Si vous utilisez des runnables à l'intérieur de vos outils, vous devez propager les callbacks au runnable ; sinon, aucun événement de streaming ne sera généré.
:::

:::note
Lorsque vous utilisez des RunnableLambdas ou le décorateur @chain, les callbacks sont propagés automatiquement en arrière-plan.
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

Voici une ré-implémentation qui propage correctement les callbacks. Vous remarquerez que maintenant nous recevons également des événements du runnable `reverse_word`.

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

Si vous invoquez des runnables depuis des Runnable Lambdas ou @chains, alors les callbacks seront passés automatiquement en votre nom.

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

Et avec le décorateur @chain :

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
