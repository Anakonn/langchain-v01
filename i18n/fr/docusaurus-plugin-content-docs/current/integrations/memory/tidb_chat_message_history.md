---
translated: true
---

# TiDB

> [TiDB Cloud](https://tidbcloud.com/) est une solution complète de base de données en tant que service (DBaaS) qui propose des options dédiées et sans serveur. TiDB Serverless intègre désormais une recherche vectorielle intégrée dans le paysage MySQL. Avec cette amélioration, vous pouvez développer des applications d'IA à l'aide de TiDB Serverless sans avoir besoin d'une nouvelle base de données ou de piles techniques supplémentaires. Soyez parmi les premiers à en faire l'expérience en rejoignant la liste d'attente pour la version bêta privée sur https://tidb.cloud/ai.

Ce notebook présente comment utiliser TiDB pour stocker l'historique des messages de discussion.

## Configuration

Tout d'abord, nous allons installer les dépendances suivantes :

```python
%pip install --upgrade --quiet langchain langchain_openai
```

Configuration de votre clé OpenAI

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Input your OpenAI API key:")
```

Enfin, nous configurerons la connexion à un TiDB. Dans ce notebook, nous suivrons la méthode de connexion standard fournie par TiDB Cloud pour établir une connexion de base de données sécurisée et efficace.

```python
# copy from tidb cloud console
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## Génération de données historiques

Création d'un ensemble de données historiques, qui servira de base à nos prochaines démonstrations.

```python
from datetime import datetime

from langchain_community.chat_message_histories import TiDBChatMessageHistory

history = TiDBChatMessageHistory(
    connection_string=tidb_connection_string,
    session_id="code_gen",
    earliest_time=datetime.utcnow(),  # Optional to set earliest_time to load messages after this time point.
)

history.add_user_message("How's our feature going?")
history.add_ai_message(
    "It's going well. We are working on testing now. It will be released in Feb."
)
```

```python
history.messages
```

```output
[HumanMessage(content="How's our feature going?"),
 AIMessage(content="It's going well. We are working on testing now. It will be released in Feb.")]
```

## Discussion avec des données historiques

Construisons sur les données historiques générées précédemment pour créer une interaction de discussion dynamique.

Tout d'abord, création d'une chaîne de discussion avec LangChain :

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're an assistant who's good at coding. You're helping a startup build",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)
chain = prompt | ChatOpenAI()
```

Construction d'un exécutable sur l'historique :

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: TiDBChatMessageHistory(
        session_id=session_id, connection_string=tidb_connection_string
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

Lancement de la discussion :

```python
response = chain_with_history.invoke(
    {"question": "Today is Jan 1st. How many days until our feature is released?"},
    config={"configurable": {"session_id": "code_gen"}},
)
response
```

```output
AIMessage(content='There are 31 days in January, so there are 30 days until our feature is released in February.')
```

## Vérification des données d'historique

```python
history.reload_cache()
history.messages
```

```output
[HumanMessage(content="How's our feature going?"),
 AIMessage(content="It's going well. We are working on testing now. It will be released in Feb."),
 HumanMessage(content='Today is Jan 1st. How many days until our feature is released?'),
 AIMessage(content='There are 31 days in January, so there are 30 days until our feature is released in February.')]
```
