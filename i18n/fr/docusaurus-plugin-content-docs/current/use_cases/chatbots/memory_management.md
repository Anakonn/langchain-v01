---
sidebar_position: 1
translated: true
---

# Gestion de la mémoire

Une caractéristique clé des chatbots est leur capacité à utiliser le contenu des tours de conversation précédents comme contexte. Cette gestion de l'état peut prendre plusieurs formes, notamment :

- Simplement insérer les messages précédents dans l'invite du modèle de chat.
- Ce qui précède, mais en réduisant les anciens messages pour réduire la quantité d'informations distractives que le modèle doit traiter.
- Des modifications plus complexes comme la synthèse de résumés pour les conversations de longue durée.

Nous entrerons plus en détail sur quelques techniques ci-dessous !

## Configuration

Vous devrez installer quelques packages et définir votre clé d'API OpenAI en tant que variable d'environnement nommée `OPENAI_API_KEY` :

```python
%pip install --upgrade --quiet langchain langchain-openai

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

Configurons également un modèle de chat que nous utiliserons pour les exemples ci-dessous.

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106")
```

## Passage de messages

La forme la plus simple de mémoire consiste simplement à transmettre les messages de l'historique du chat dans une chaîne. Voici un exemple :

```python
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat

chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

Nous pouvons voir qu'en transmettant la conversation précédente à une chaîne, elle peut l'utiliser comme contexte pour répondre aux questions. C'est le concept de base de la mémoire des chatbots - le reste du guide démontrera des techniques pratiques pour transmettre ou reformater les messages.

## Historique du chat

Il est tout à fait acceptable de stocker et de transmettre les messages directement sous forme de tableau, mais nous pouvons également utiliser la classe `message history` intégrée à LangChain pour stocker et charger les messages. Les instances de cette classe sont responsables du stockage et du chargement des messages de chat à partir d'un stockage persistant. LangChain s'intègre à de nombreux fournisseurs - vous pouvez voir une [liste des intégrations ici](/docs/integrations/memory) - mais pour cette démonstration, nous utiliserons une classe de démonstration éphémère.

Voici un exemple de l'API :

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

demo_ephemeral_chat_history.add_ai_message("J'adore la programmation.")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Translate this sentence from English to French: I love programming.'),
 AIMessage(content="J'adore la programmation.")]
```

Nous pouvons l'utiliser directement pour stocker les tours de conversation pour notre chaîne :

```python
demo_ephemeral_chat_history = ChatMessageHistory()

input1 = "Translate this sentence from English to French: I love programming."

demo_ephemeral_chat_history.add_user_message(input1)

response = chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

demo_ephemeral_chat_history.add_ai_message(response)

input2 = "What did I just ask you?"

demo_ephemeral_chat_history.add_user_message(input2)

chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)
```

```output
AIMessage(content='You asked me to translate the sentence "I love programming" from English to French.')
```

## Gestion automatique de l'historique

Les exemples précédents transmettent explicitement les messages à la chaîne. Il s'agit d'une approche tout à fait acceptable, mais elle nécessite une gestion externe des nouveaux messages. LangChain inclut également un wrapper pour les chaînes LCEL qui peuvent gérer ce processus automatiquement, appelé `RunnableWithMessageHistory`.

Pour montrer comment cela fonctionne, modifions légèrement l'invite ci-dessus pour qu'elle prenne une variable `input` finale qui remplisse un modèle `HumanMessage` après l'historique du chat. Cela signifie que nous attendrons un paramètre `chat_history` qui contient tous les messages AVANT le message actuel, au lieu de tous les messages.

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat
```

Nous transmettrons la dernière entrée à la conversation ici et laisserons la classe `RunnableWithMessageHistory` envelopper notre chaîne et faire le travail d'ajouter cette variable `input` à l'historique du chat.

Ensuite, déclarons notre chaîne enveloppée :

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

Cette classe prend quelques paramètres supplémentaires en plus de la chaîne que nous voulons envelopper :

- Une fonction d'usine qui renvoie un historique de messages pour un identifiant de session donné. Cela permet à votre chaîne de gérer plusieurs utilisateurs à la fois en chargeant différents messages pour différentes conversations.
- Une `input_messages_key` qui spécifie quelle partie de l'entrée doit être suivie et stockée dans l'historique du chat. Dans cet exemple, nous voulons suivre la chaîne passée en tant que `input`.
- Une `history_messages_key` qui spécifie dans quelle partie de l'invite les messages précédents doivent être insérés. Notre invite a un `MessagesPlaceholder` nommé `chat_history`, nous spécifions donc cette propriété pour qu'elle corresponde.
- (Pour les chaînes avec plusieurs sorties) une `output_messages_key` qui spécifie quelle sortie stocker dans l'historique. C'est l'inverse de `input_messages_key`.

Nous pouvons invoquer cette nouvelle chaîne normalement, avec un champ `configurable` supplémentaire qui spécifie l'`identifiant de session` particulier à transmettre à la fonction d'usine. Cela est inutilisé pour la démonstration, mais dans les chaînes du monde réel, vous voudrez renvoyer un historique de chat correspondant à la session passée :

```python
chain_with_message_history.invoke(
    {"input": "Translate this sentence from English to French: I love programming."},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='The translation of "I love programming" in French is "J\'adore la programmation."')
```

```python
chain_with_message_history.invoke(
    {"input": "What did I just ask you?"}, {"configurable": {"session_id": "unused"}}
)
```

```output
AIMessage(content='You just asked me to translate the sentence "I love programming" from English to French.')
```

## Modification de l'historique du chat

La modification des messages de chat stockés peut aider votre chatbot à gérer une variété de situations. Voici quelques exemples :

### Réduction des messages

Les LLM et les modèles de chat ont des fenêtres de contexte limitées, et même si vous n'atteignez pas directement les limites, vous voudrez peut-être limiter la quantité de distraction que le modèle doit gérer. Une solution consiste à ne charger et à ne stocker que les `n` messages les plus récents. Utilisons un exemple d'historique avec quelques messages préchargés :

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

Utilisons cet historique de messages avec la chaîne `RunnableWithMessageHistory` que nous avons déclarée ci-dessus :

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

chain_with_message_history.invoke(
    {"input": "What's my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='Your name is Nemo.')
```

Nous pouvons voir que la chaîne se souvient du nom préchargé.

Mais supposons que nous ayons une très petite fenêtre de contexte et que nous voulions réduire le nombre de messages transmis à la chaîne aux 2 plus récents. Nous pouvons utiliser la méthode `clear` pour supprimer les messages et les réajouter à l'historique. Nous n'avons pas besoin de le faire, mais plaçons cette méthode au début de notre chaîne pour nous assurer qu'elle est toujours appelée :

```python
from langchain_core.runnables import RunnablePassthrough


def trim_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) <= 2:
        return False

    demo_ephemeral_chat_history.clear()

    for message in stored_messages[-2:]:
        demo_ephemeral_chat_history.add_message(message)

    return True


chain_with_trimming = (
    RunnablePassthrough.assign(messages_trimmed=trim_messages)
    | chain_with_message_history
)
```

Appelons cette nouvelle chaîne et vérifions les messages par la suite :

```python
chain_with_trimming.invoke(
    {"input": "Where does P. Sherman live?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="What's my name?"),
 AIMessage(content='Your name is Nemo.'),
 HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")]
```

Et nous pouvons voir que notre historique a supprimé les deux messages les plus anciens tout en ajoutant la conversation la plus récente à la fin. La prochaine fois que la chaîne sera appelée, `trim_messages` sera appelée à nouveau, et seuls les deux messages les plus récents seront transmis au modèle. Dans ce cas, cela signifie que le modèle oubliera le nom que nous lui avons donné la prochaine fois que nous l'invoquerons :

```python
chain_with_trimming.invoke(
    {"input": "What is my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="I'm sorry, I don't have access to your personal information.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney."),
 HumanMessage(content='What is my name?'),
 AIMessage(content="I'm sorry, I don't have access to your personal information.")]
```

### Résumé de la mémoire

Nous pouvons utiliser ce même modèle de manière différente. Par exemple, nous pourrions utiliser un appel LLM supplémentaire pour générer un résumé de la conversation avant d'appeler notre chaîne. Recréons notre historique de chat et notre chaîne de chatbot :

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

Nous modifierons légèrement l'invite pour que le LLM sache qu'il recevra un résumé condensé au lieu d'un historique de chat :

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability. The provided chat history includes facts about the user you are speaking with.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

Et maintenant, créons une fonction qui distillera les interactions précédentes en un résumé. Nous pouvons ajouter celle-ci au début de la chaîne également :

```python
def summarize_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) == 0:
        return False
    summarization_prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="chat_history"),
            (
                "user",
                "Distill the above chat messages into a single summary message. Include as many specific details as you can.",
            ),
        ]
    )
    summarization_chain = summarization_prompt | chat

    summary_message = summarization_chain.invoke({"chat_history": stored_messages})

    demo_ephemeral_chat_history.clear()

    demo_ephemeral_chat_history.add_message(summary_message)

    return True


chain_with_summarization = (
    RunnablePassthrough.assign(messages_summarized=summarize_messages)
    | chain_with_message_history
)
```

Voyons s'il se souvient du nom que nous lui avons donné :

```python
chain_with_summarization.invoke(
    {"input": "What did I say my name was?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')
```

```python
demo_ephemeral_chat_history.messages
```

```output
[AIMessage(content='The conversation is between Nemo and an AI. Nemo introduces himself and the AI responds with a greeting. Nemo then asks the AI how it is doing, and the AI responds that it is fine.'),
 HumanMessage(content='What did I say my name was?'),
 AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')]
```

Notez que l'invocation de la chaîne à nouveau générera un autre résumé généré à partir du résumé initial plus les nouveaux messages, et ainsi de suite. Vous pourriez également concevoir une approche hybride où un certain nombre de messages sont conservés dans l'historique du chat tandis que d'autres sont résumés.
