---
translated: true
---

# Retour d'un résultat structuré

Ce notebook couvre comment faire en sorte qu'un agent renvoie un résultat structuré.
Par défaut, la plupart des agents renvoient une seule chaîne de caractères.
Il peut souvent être utile d'avoir un agent qui renvoie quelque chose avec plus de structure.

Un bon exemple de cela est un agent chargé de faire de la réponse aux questions sur certaines sources.
Supposons que nous voulions que l'agent réponde non seulement avec la réponse, mais aussi avec une liste des sources utilisées.
Nous voulons alors que notre sortie suive approximativement le schéma ci-dessous :

```python
class Response(BaseModel):
    """Final response to the question being asked"""
    answer: str = Field(description = "The final answer to respond to the user")
    sources: List[int] = Field(description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information")
```

Dans ce notebook, nous allons passer en revue un agent qui a un outil de recherche et qui répond dans le bon format.

## Créer le moteur de recherche

Dans cette section, nous allons effectuer quelques travaux de configuration pour créer notre moteur de recherche sur des données factices contenant le "discours sur l'état de l'Union". Fait important, nous ajouterons une balise "page_chunk" aux métadonnées de chaque document. Il s'agit simplement de données factices destinées à simuler un champ source. En pratique, il s'agirait plus probablement de l'URL ou du chemin d'un document.

```python
%pip install -qU langchain langchain-community langchain-openai langchain-chroma
```

```python
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# Load in document to retrieve over
loader = TextLoader("../../state_of_the_union.txt")
documents = loader.load()

# Split document into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# Here is where we add in the fake source information
for i, doc in enumerate(texts):
    doc.metadata["page_chunk"] = i

# Create our retriever
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(texts, embeddings, collection_name="state-of-union")
retriever = vectorstore.as_retriever()
```

## Créer les outils

Nous allons maintenant créer les outils que nous voulons donner à l'agent. Dans ce cas, il n'y en a qu'un seul - un outil qui enveloppe notre moteur de recherche.

```python
from langchain.tools.retriever import create_retriever_tool

retriever_tool = create_retriever_tool(
    retriever,
    "state-of-union-retriever",
    "Query a retriever to get information about state of the union address",
)
```

## Créer le schéma de réponse

Voici où nous allons définir le schéma de réponse. Dans ce cas, nous voulons que la réponse finale ait deux champs : un pour la `réponse`, et un autre qui est une liste des `sources`.

```python
from typing import List

from langchain_core.pydantic_v1 import BaseModel, Field


class Response(BaseModel):
    """Final response to the question being asked"""

    answer: str = Field(description="The final answer to respond to the user")
    sources: List[int] = Field(
        description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information"
    )
```

## Créer la logique de parsing personnalisée

Nous créons maintenant une logique de parsing personnalisée.
Le fonctionnement est le suivant : nous allons transmettre le schéma `Response` au LLM d'OpenAI via leur paramètre `functions`.
C'est similaire à la façon dont nous transmettons des outils pour que l'agent les utilise.

Lorsque la fonction `Response` est appelée par OpenAI, nous voulons l'utiliser comme un signal pour renvoyer à l'utilisateur.
Lorsque toute autre fonction est appelée par OpenAI, nous la traitons comme une invocation d'outil.

Par conséquent, notre logique de parsing a les blocs suivants :

- Si aucune fonction n'est appelée, supposons que nous devrions utiliser la réponse pour répondre à l'utilisateur, et donc renvoyer `AgentFinish`
- Si la fonction `Response` est appelée, répondre à l'utilisateur avec les entrées de cette fonction (notre sortie structurée), et donc renvoyer `AgentFinish`
- Si toute autre fonction est appelée, la traiter comme une invocation d'outil, et donc renvoyer `AgentActionMessageLog`

Notez que nous utilisons `AgentActionMessageLog` plutôt que `AgentAction` car cela nous permet de joindre un journal de messages que nous pourrons utiliser à l'avenir pour le réinjecter dans l'invite de l'agent.

```python
import json

from langchain_core.agents import AgentActionMessageLog, AgentFinish
```

```python
def parse(output):
    # If no function was invoked, return to user
    if "function_call" not in output.additional_kwargs:
        return AgentFinish(return_values={"output": output.content}, log=output.content)

    # Parse out the function call
    function_call = output.additional_kwargs["function_call"]
    name = function_call["name"]
    inputs = json.loads(function_call["arguments"])

    # If the Response function was invoked, return to the user with the function inputs
    if name == "Response":
        return AgentFinish(return_values=inputs, log=str(function_call))
    # Otherwise, return an agent action
    else:
        return AgentActionMessageLog(
            tool=name, tool_input=inputs, log="", message_log=[output]
        )
```

## Créer l'agent

Nous pouvons maintenant tout rassembler ! Les composants de cet agent sont :

- invite : une invite simple avec des espaces réservés pour la question de l'utilisateur et ensuite le `agent_scratchpad` (toutes les étapes intermédiaires)
- outils : nous pouvons attacher les outils et le format `Response` à l'LLM en tant que fonctions
- format du brouillon : afin de formater le `agent_scratchpad` à partir des étapes intermédiaires, nous utiliserons le `format_to_openai_function_messages` standard. Cela prend les étapes intermédiaires et les formate en tant que AIMessages et FunctionMessages.
- analyseur de sortie : nous utiliserons notre analyseur personnalisé ci-dessus pour analyser la réponse de l'LLM
- AgentExecutor : nous utiliserons le AgentExecutor standard pour exécuter la boucle agent-outil-agent-outil...

```python
from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

```python
llm = ChatOpenAI(temperature=0)
```

```python
llm_with_tools = llm.bind_functions([retriever_tool, Response])
```

```python
agent = (
    {
        "input": lambda x: x["input"],
        # Format agent scratchpad from intermediate steps
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | parse
)
```

```python
agent_executor = AgentExecutor(tools=[retriever_tool], agent=agent, verbose=True)
```

## Exécuter l'agent

Nous pouvons maintenant exécuter l'agent ! Notez comment il répond avec un dictionnaire avec deux clés : `answer` et `sources`

```python
agent_executor.invoke(
    {"input": "what did the president say about ketanji brown jackson"},
    return_only_outputs=True,
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m[0m[36;1m[1;3mTonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.

Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.

Last year COVID-19 kept us apart. This year we are finally together again.

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.

With a duty to one another to the American people to the Constitution.

And with an unwavering resolve that freedom will always triumph over tyranny.

Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated.

He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined.

He met the Ukrainian people.

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.[0m[32;1m[1;3m{'arguments': '{\n"answer": "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation\'s top legal minds who will continue Justice Breyer\'s legacy of excellence.",\n"sources": [6]\n}', 'name': 'Response'}[0m

[1m> Finished chain.[0m
```

```output
{'answer': "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation's top legal minds who will continue Justice Breyer's legacy of excellence.",
 'sources': [6]}
```
