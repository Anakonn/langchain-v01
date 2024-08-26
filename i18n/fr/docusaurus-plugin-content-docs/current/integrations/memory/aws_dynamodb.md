---
translated: true
---

# AWS DynamoDB

>[Amazon AWS DynamoDB](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/index.html) est un service de base de données `NoSQL` entièrement géré qui offre des performances rapides et prévisibles avec une mise à l'échelle transparente.

Ce notebook explique comment utiliser `DynamoDB` pour stocker l'historique des messages de discussion avec la classe `DynamoDBChatMessageHistory`.

## Configuration

Assurez-vous d'abord d'avoir correctement configuré [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). Ensuite, assurez-vous d'avoir installé le package `langchain-community`, donc nous devons l'installer. Nous devons également installer le package `boto3`.

```bash
pip install -U langchain-community boto3
```

Il est également utile (mais pas nécessaire) de configurer [LangSmith](https://smith.langchain.com/) pour une observabilité de premier ordre.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

```python
from langchain_community.chat_message_histories import (
    DynamoDBChatMessageHistory,
)
```

## Créer une table

Maintenant, créez la table `DynamoDB` où nous stockerons les messages :

```python
import boto3

# Get the service resource.
dynamodb = boto3.resource("dynamodb")

# Create the DynamoDB table.
table = dynamodb.create_table(
    TableName="SessionTable",
    KeySchema=[{"AttributeName": "SessionId", "KeyType": "HASH"}],
    AttributeDefinitions=[{"AttributeName": "SessionId", "AttributeType": "S"}],
    BillingMode="PAY_PER_REQUEST",
)

# Wait until the table exists.
table.meta.client.get_waiter("table_exists").wait(TableName="SessionTable")

# Print out some data about the table.
print(table.item_count)
```

```output
0
```

## DynamoDBChatMessageHistory

```python
history = DynamoDBChatMessageHistory(table_name="SessionTable", session_id="0")

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

## DynamoDBChatMessageHistory avec une URL d'endpoint personnalisée

Il est parfois utile de spécifier l'URL du point de terminaison AWS à laquelle se connecter. Par exemple, lorsque vous exécutez localement contre [Localstack](https://localstack.cloud/). Dans ces cas, vous pouvez spécifier l'URL via le paramètre `endpoint_url` dans le constructeur.

```python
history = DynamoDBChatMessageHistory(
    table_name="SessionTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
)
```

## DynamoDBChatMessageHistory avec des clés composites

La clé par défaut pour DynamoDBChatMessageHistory est `{"SessionId": self.session_id}`, mais vous pouvez la modifier pour qu'elle corresponde à la conception de votre table.

### Nom de la clé primaire

Vous pouvez modifier la clé primaire en transmettant une valeur `primary_key_name` dans le constructeur, ce qui donnera :
`{self.primary_key_name: self.session_id}`

### Clés composites

Lors de l'utilisation d'une table DynamoDB existante, vous devrez peut-être modifier la structure de la clé par défaut pour inclure une clé de tri. Pour ce faire, vous pouvez utiliser le paramètre `key`.

La transmission d'une valeur pour `key` remplacera le paramètre `primary_key`, et la structure de clé résultante sera la valeur transmise.

```python
composite_table = dynamodb.create_table(
    TableName="CompositeTable",
    KeySchema=[
        {"AttributeName": "PK", "KeyType": "HASH"},
        {"AttributeName": "SK", "KeyType": "RANGE"},
    ],
    AttributeDefinitions=[
        {"AttributeName": "PK", "AttributeType": "S"},
        {"AttributeName": "SK", "AttributeType": "S"},
    ],
    BillingMode="PAY_PER_REQUEST",
)

# Wait until the table exists.
composite_table.meta.client.get_waiter("table_exists").wait(TableName="CompositeTable")

# Print out some data about the table.
print(composite_table.item_count)
```

```output
0
```

```python
my_key = {
    "PK": "session_id::0",
    "SK": "langchain_history",
}

composite_key_history = DynamoDBChatMessageHistory(
    table_name="CompositeTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
    key=my_key,
)

composite_key_history.add_user_message("hello, composite dynamodb table!")

composite_key_history.messages
```

```output
[HumanMessage(content='hello, composite dynamodb table!')]
```

## Enchaînement

Nous pouvons facilement combiner cette classe d'historique des messages avec [LCEL Runnables](/docs/expression_language/how_to/message_history)

Pour ce faire, nous voudrons utiliser OpenAI, donc nous devons l'installer.

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: DynamoDBChatMessageHistory(
        table_name="SessionTable", session_id=session_id
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SESSION_ID>"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content='Hello Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob! Is there anything specific you would like assistance with, Bob?')
```
