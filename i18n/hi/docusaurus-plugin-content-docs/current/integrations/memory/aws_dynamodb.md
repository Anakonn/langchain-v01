---
translated: true
---

# AWS DynamoDB

>[Amazon AWS DynamoDB](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/index.html) एक पूरी तरह से प्रबंधित `NoSQL` डेटाबेस सेवा है जो तेज़ और भविष्यवाणी योग्य प्रदर्शन प्रदान करती है और सुचारु रूप से स्केलेबल है।

यह नोटबुक `DynamoDB` का उपयोग करके चैट संदेश इतिहास को `DynamoDBChatMessageHistory` क्लास के साथ संग्रहीत करने के बारे में चर्चा करता है।

## सेटअप

सबसे पहले सुनिश्चित करें कि आपने [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) को सही ढंग से कॉन्फ़िगर किया है। फिर सुनिश्चित करें कि आपने `langchain-community` पैकेज इंस्टॉल किया है, इसलिए हमें इसे इंस्टॉल करना होगा। हमें `boto3` पैकेज भी इंस्टॉल करना होगा।

```bash
pip install -U langchain-community boto3
```

यह भी उपयोगी (लेकिन आवश्यक नहीं) है कि [LangSmith](https://smith.langchain.com/) को बेस्ट-इन-क्लास ऑब्जर्वेबिलिटी के लिए सेट अप करें।

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

```python
from langchain_community.chat_message_histories import (
    DynamoDBChatMessageHistory,
)
```

## टेबल बनाएं

अब, `DynamoDB` टेबल बनाएं जहां हम संदेशों को संग्रहीत करेंगे:

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

## कस्टम एंडपॉइंट URL के साथ DynamoDBChatMessageHistory

कभी-कभी AWS एंडपॉइंट का URL निर्दिष्ट करना उपयोगी होता है। उदाहरण के लिए, जब आप [Localstack](https://localstack.cloud/) के खिलाफ स्थानीय रूप से चला रहे हों। ऐसे मामलों में आप निर्माता में `endpoint_url` पैरामीटर के माध्यम से URL निर्दिष्ट कर सकते हैं।

```python
history = DynamoDBChatMessageHistory(
    table_name="SessionTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
)
```

## कंपोजिट कीज के साथ DynamoDBChatMessageHistory

DynamoDBChatMessageHistory के लिए डिफ़ॉल्ट कुंजी `{"SessionId": self.session_id}` है, लेकिन आप अपने टेबल डिज़ाइन से मेल खाने के लिए इसे संशोधित कर सकते हैं।

### प्राथमिक कुंजी नाम

आप निर्माता में `primary_key_name` मान पारित करके प्राथमिक कुंजी को संशोधित कर सकते हैं, जिसका परिणाम `{self.primary_key_name: self.session_id}` होगा।

### कंपोजिट कीज

मौजूदा DynamoDB टेबल का उपयोग करते समय, आपको डिफ़ॉल्ट से `{self.primary_key_name: self.session_id}` के अलावा कुछ अन्य कुंजी संरचना का उपयोग करना पड़ सकता है। ऐसा करने के लिए आप `key` पैरामीटर का उपयोग कर सकते हैं।

`key` के लिए मान पारित करने से `primary_key` पैरामीटर अधिलिखित हो जाएगा, और परिणामी कुंजी संरचना पारित मान होगी।

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

## श्रृंखलाबद्ध करना

हम आसानी से इस संदेश इतिहास क्लास को [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ जोड़ सकते हैं।

ऐसा करने के लिए हम OpenAI का उपयोग करना चाहेंगे, इसलिए हमें उसे इंस्टॉल करना होगा।

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
