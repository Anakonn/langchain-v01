---
translated: true
---

# TiDB

> [TiDB Cloud](https://tidbcloud.com/), es una solución integral de Database-as-a-Service (DBaaS), que ofrece opciones dedicadas y sin servidor. TiDB Serverless ahora está integrando una búsqueda vectorial integrada en el panorama de MySQL. Con esta mejora, puede desarrollar aplicaciones de IA utilizando TiDB Serverless sin necesidad de una nueva base de datos o pilas técnicas adicionales. Sea de los primeros en experimentarlo uniéndose a la lista de espera para la versión beta privada en https://tidb.cloud/ai.

Este cuaderno presenta cómo usar TiDB para almacenar el historial de mensajes de chat.

## Configuración

En primer lugar, instalaremos las siguientes dependencias:

```python
%pip install --upgrade --quiet langchain langchain_openai
```

Configuración de tu clave de OpenAI

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Input your OpenAI API key:")
```

Finalmente, configuraremos la conexión a un TiDB. En este cuaderno, seguiremos el método de conexión estándar proporcionado por TiDB Cloud para establecer una conexión de base de datos segura y eficiente.

```python
# copy from tidb cloud console
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## Generación de datos históricos

Creación de un conjunto de datos históricos, que servirá como base para nuestras próximas demostraciones.

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

## Chatear con datos históricos

Construyamos sobre los datos históricos generados anteriormente para crear una interacción de chat dinámica.

Primero, creando una cadena de chat con LangChain:

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

Construyendo un Runnable sobre la historia:

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

Iniciando el chat:

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

## Verificar los datos históricos

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
