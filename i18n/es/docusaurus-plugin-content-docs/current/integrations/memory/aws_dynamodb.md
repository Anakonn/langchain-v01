---
translated: true
---

# AWS DynamoDB

>[Amazon AWS DynamoDB](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/index.html) es un servicio de base de datos `NoSQL` totalmente administrado que proporciona un rendimiento rápido y predecible con escalabilidad sin problemas.

Este cuaderno analiza cómo usar `DynamoDB` para almacenar el historial de mensajes de chat con la clase `DynamoDBChatMessageHistory`.

## Configuración

Primero, asegúrese de haber configurado correctamente la [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). Luego, asegúrese de haber instalado el paquete `langchain-community`, por lo que necesitamos instalarlo. También necesitamos instalar el paquete `boto3`.

```bash
pip install -U langchain-community boto3
```

También es útil (pero no necesario) configurar [LangSmith](https://smith.langchain.com/) para una observabilidad de primera clase.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

```python
from langchain_community.chat_message_histories import (
    DynamoDBChatMessageHistory,
)
```

## Crear tabla

Ahora, cree la tabla `DynamoDB` donde almacenaremos los mensajes:

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

## DynamoDBChatMessageHistory con URL de punto final personalizada

A veces es útil especificar la URL del punto final de AWS al que conectarse. Por ejemplo, cuando se ejecuta localmente contra [Localstack](https://localstack.cloud/). Para esos casos, puede especificar la URL a través del parámetro `endpoint_url` en el constructor.

```python
history = DynamoDBChatMessageHistory(
    table_name="SessionTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
)
```

## DynamoDBChatMessageHistory con claves compuestas

La clave predeterminada para DynamoDBChatMessageHistory es `{"SessionId": self.session_id}`, pero puede modificarla para que coincida con el diseño de su tabla.

### Nombre de la clave principal

Puede modificar la clave principal pasando un valor de `primary_key_name` en el constructor, lo que dará como resultado lo siguiente:
`{self.primary_key_name: self.session_id}`

### Claves compuestas

Cuando se usa una tabla DynamoDB existente, es posible que deba modificar la estructura de la clave desde el valor predeterminado a algo que incluya una clave de clasificación. Para hacer esto, puede usar el parámetro `key`.

Pasar un valor para `key` anulará el parámetro `primary_key`, y la estructura de clave resultante será el valor pasado.

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

## Encadenamiento

Podemos combinar fácilmente esta clase de historial de mensajes con [LCEL Runnables](/docs/expression_language/how_to/message_history)

Para hacer esto, querremos usar OpenAI, así que necesitamos instalarlo.

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
