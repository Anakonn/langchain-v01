---
translated: true
---

# Ajouter l'historique des messages (mémoire)

Le `RunnableWithMessageHistory` nous permet d'ajouter l'historique des messages à certains types de chaînes. Il enveloppe un autre Runnable et gère l'historique des messages de discussion pour lui.

Plus précisément, il peut être utilisé pour tout Runnable qui prend en entrée l'un des éléments suivants :

* une séquence de `BaseMessage`
* un dictionnaire avec une clé qui prend une séquence de `BaseMessage`
* un dictionnaire avec une clé qui prend le(s) dernier(s) message(s) sous forme de chaîne de caractères ou de séquence de `BaseMessage`, et une clé séparée qui prend les messages historiques

Et renvoie en sortie l'un des éléments suivants :

* une chaîne de caractères pouvant être traitée comme le contenu d'un `AIMessage`
* une séquence de `BaseMessage`
* un dictionnaire avec une clé contenant une séquence de `BaseMessage`

Examinons quelques exemples pour voir comment cela fonctionne. Tout d'abord, nous construisons un runnable (qui ici accepte un dictionnaire en entrée et renvoie un message en sortie) :

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai.chat_models import ChatOpenAI

model = ChatOpenAI()
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're an assistant who's good at {ability}. Respond in 20 words or fewer",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)
runnable = prompt | model
```

Pour gérer l'historique des messages, nous aurons besoin :
1. De ce runnable ;
2. D'un appelable qui renvoie une instance de `BaseChatMessageHistory`.

Consultez la page [intégrations de mémoire](https://integrations.langchain.com/memory) pour des implémentations d'historiques de messages de discussion utilisant Redis et d'autres fournisseurs. Ici, nous démontrons l'utilisation d'un `ChatMessageHistory` en mémoire ainsi qu'un stockage plus persistant à l'aide de `RedisChatMessageHistory`.

## En mémoire

Ci-dessous, nous montrons un exemple simple dans lequel l'historique de discussion est stocké en mémoire, dans ce cas via un dictionnaire Python global.

Nous construisons un appelable `get_session_history` qui fait référence à ce dictionnaire pour renvoyer une instance de `ChatMessageHistory`. Les arguments de l'appelable peuvent être spécifiés en passant une configuration à `RunnableWithMessageHistory` au moment de l'exécution. Par défaut, le paramètre de configuration attendu est une seule chaîne de caractères `session_id`. Cela peut être ajusté via le paramètre `history_factory_config`.

En utilisant le paramètre par défaut à un seul paramètre :

```python
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

Notez que nous avons spécifié `input_messages_key` (la clé à traiter comme le dernier message d'entrée) et `history_messages_key` (la clé à ajouter aux messages historiques).

Lors de l'invocation de ce nouveau runnable, nous spécifions l'historique de discussion correspondant via un paramètre de configuration :

```python
with_message_history.invoke(
    {"ability": "math", "input": "What does cosine mean?"},
    config={"configurable": {"session_id": "abc123"}},
)
```

```output
AIMessage(content='Cosine is a trigonometric function that calculates the ratio of the adjacent side to the hypotenuse of a right triangle.')
```

```python
# Remembers
with_message_history.invoke(
    {"ability": "math", "input": "What?"},
    config={"configurable": {"session_id": "abc123"}},
)
```

```output
AIMessage(content='Cosine is a mathematical function used to calculate the length of a side in a right triangle.')
```

```python
# New session_id --> does not remember.
with_message_history.invoke(
    {"ability": "math", "input": "What?"},
    config={"configurable": {"session_id": "def234"}},
)
```

```output
AIMessage(content='I can help with math problems. What do you need assistance with?')
```

Les paramètres de configuration par lesquels nous suivons les historiques de messages peuvent être personnalisés en passant une liste d'objets `ConfigurableFieldSpec` au paramètre `history_factory_config`. Ci-dessous, nous utilisons deux paramètres : un `user_id` et un `conversation_id`.

```python
from langchain_core.runnables import ConfigurableFieldSpec

store = {}


def get_session_history(user_id: str, conversation_id: str) -> BaseChatMessageHistory:
    if (user_id, conversation_id) not in store:
        store[(user_id, conversation_id)] = ChatMessageHistory()
    return store[(user_id, conversation_id)]


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
    history_factory_config=[
        ConfigurableFieldSpec(
            id="user_id",
            annotation=str,
            name="User ID",
            description="Unique identifier for the user.",
            default="",
            is_shared=True,
        ),
        ConfigurableFieldSpec(
            id="conversation_id",
            annotation=str,
            name="Conversation ID",
            description="Unique identifier for the conversation.",
            default="",
            is_shared=True,
        ),
    ],
)
```

```python
with_message_history.invoke(
    {"ability": "math", "input": "Hello"},
    config={"configurable": {"user_id": "123", "conversation_id": "1"}},
)
```

### Exemples avec des runnables de signatures différentes

Le runnable ci-dessus prend un dictionnaire en entrée et renvoie un BaseMessage. Ci-dessous, nous montrons quelques alternatives.

#### Messages en entrée, dictionnaire en sortie

```python
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableParallel

chain = RunnableParallel({"output_message": ChatOpenAI()})


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    output_messages_key="output_message",
)

with_message_history.invoke(
    [HumanMessage(content="What did Simone de Beauvoir believe about free will")],
    config={"configurable": {"session_id": "baz"}},
)
```

```output
{'output_message': AIMessage(content="Simone de Beauvoir believed in the existence of free will. She argued that individuals have the ability to make choices and determine their own actions, even in the face of social and cultural constraints. She rejected the idea that individuals are purely products of their environment or predetermined by biology or destiny. Instead, she emphasized the importance of personal responsibility and the need for individuals to actively engage in creating their own lives and defining their own existence. De Beauvoir believed that freedom and agency come from recognizing one's own freedom and actively exercising it in the pursuit of personal and collective liberation.")}
```

```python
with_message_history.invoke(
    [HumanMessage(content="How did this compare to Sartre")],
    config={"configurable": {"session_id": "baz"}},
)
```

```output
{'output_message': AIMessage(content='Simone de Beauvoir\'s views on free will were closely aligned with those of her contemporary and partner Jean-Paul Sartre. Both de Beauvoir and Sartre were existentialist philosophers who emphasized the importance of individual freedom and the rejection of determinism. They believed that human beings have the capacity to transcend their circumstances and create their own meaning and values.\n\nSartre, in his famous work "Being and Nothingness," argued that human beings are condemned to be free, meaning that we are burdened with the responsibility of making choices and defining ourselves in a world that lacks inherent meaning. Like de Beauvoir, Sartre believed that individuals have the ability to exercise their freedom and make choices in the face of external and internal constraints.\n\nWhile there may be some nuanced differences in their philosophical writings, overall, de Beauvoir and Sartre shared a similar belief in the existence of free will and the importance of individual agency in shaping one\'s own life.')}
```

#### Messages en entrée, messages en sortie

```python
RunnableWithMessageHistory(
    ChatOpenAI(),
    get_session_history,
)
```

#### Dictionnaire avec une seule clé pour tous les messages en entrée, messages en sortie

```python
from operator import itemgetter

RunnableWithMessageHistory(
    itemgetter("input_messages") | ChatOpenAI(),
    get_session_history,
    input_messages_key="input_messages",
)
```

## Stockage persistant

Dans de nombreux cas, il est préférable de conserver les historiques de conversation. `RunnableWithMessageHistory` est indépendant de la manière dont l'appelable `get_session_history` récupère ses historiques de messages de discussion. Voir [ici](https://github.com/langchain-ai/langserve/blob/main/examples/chat_with_persistence_and_user/server.py) pour un exemple utilisant un système de fichiers local. Ci-dessous, nous démontrons comment on pourrait utiliser Redis. Consultez la page [intégrations de mémoire](https://integrations.langchain.com/memory) pour des implémentations d'historiques de messages de discussion utilisant d'autres fournisseurs.

### Configuration

Nous devrons installer Redis s'il n'est pas déjà installé :

```python
%pip install --upgrade --quiet redis
```

Démarrez un serveur Redis Stack local si nous n'avons pas de déploiement Redis existant auquel nous connecter :

```bash
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

```python
REDIS_URL = "redis://localhost:6379/0"
```

### [LangSmith](/docs/langsmith)

LangSmith est particulièrement utile pour quelque chose comme l'injection d'historique de messages, où il peut être difficile de comprendre autrement quels sont les intrants de diverses parties de la chaîne.

Notez que LangSmith n'est pas nécessaire, mais il est utile.
Si vous voulez utiliser LangSmith, après vous être inscrit au lien ci-dessus, assurez-vous de décommenter le code ci-dessous et de définir vos variables d'environnement pour commencer à enregistrer les traces :

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

La mise à jour de l'implémentation de l'historique des messages nécessite simplement de définir un nouvel appelable, cette fois en renvoyant une instance de `RedisChatMessageHistory` :

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory


def get_message_history(session_id: str) -> RedisChatMessageHistory:
    return RedisChatMessageHistory(session_id, url=REDIS_URL)


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_message_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

Nous pouvons invoquer comme avant :

```python
with_message_history.invoke(
    {"ability": "math", "input": "What does cosine mean?"},
    config={"configurable": {"session_id": "foobar"}},
)
```

```output
AIMessage(content='Cosine is a trigonometric function that represents the ratio of the adjacent side to the hypotenuse in a right triangle.')
```

```python
with_message_history.invoke(
    {"ability": "math", "input": "What's its inverse"},
    config={"configurable": {"session_id": "foobar"}},
)
```

```output
AIMessage(content='The inverse of cosine is the arccosine function, denoted as acos or cos^-1, which gives the angle corresponding to a given cosine value.')
```

:::tip

[Trace LangSmith](https://smith.langchain.com/public/bd73e122-6ec1-48b2-82df-e6483dc9cb63/r)

:::

En examinant la trace LangSmith pour le deuxième appel, nous pouvons voir que lors de la construction de l'invite, une variable "history" a été injectée, qui est une liste de deux messages (notre première entrée et notre première sortie).
