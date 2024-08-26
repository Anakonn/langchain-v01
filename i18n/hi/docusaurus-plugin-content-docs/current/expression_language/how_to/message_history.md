---
translated: true
---

# संदेश इतिहास (मेमोरी) जोड़ें

`RunnableWithMessageHistory` हमें कुछ प्रकार की श्रृंखलाओं में संदेश इतिहास जोड़ने देता है। यह किसी अन्य Runnable को लपेटता है और उसके लिए चैट संदेश इतिहास का प्रबंधन करता है।

विशेष रूप से, इसका उपयोग किसी भी Runnable के लिए किया जा सकता है जो इनपुट के रूप में लेता है:

* `BaseMessage` का एक अनुक्रम
* `BaseMessage` का अनुक्रम लेने वाली कुंजी वाला एक डिक्शनरी
* `BaseMessage` का अनुक्रम या स्ट्रिंग लेने वाली कुंजी वाला एक डिक्शनरी, और एक अलग कुंजी जो ऐतिहासिक संदेशों को लेती है

और आउटपुट के रूप में देता है:

* `AIMessage` की सामग्री के रूप में माना जा सकने वाला एक स्ट्रिंग
* `BaseMessage` का एक अनुक्रम
* `BaseMessage` का अनुक्रम लेने वाली कुंजी वाला एक डिक्शनरी

चलो कुछ उदाहरणों को देखकर यह कैसे काम करता है, देखते हैं। पहले हम एक runnable बनाते हैं (जो यहां एक डिक्शनरी को इनपुट के रूप में लेता है और एक संदेश को आउटपुट के रूप में देता है):

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

संदेश इतिहास का प्रबंधन करने के लिए हमें चाहिए:
1. यह runnable;
2. एक कॉलेबल जो `BaseChatMessageHistory` का एक उदाहरण लौटाता है।

[मेमोरी एकीकरण](https://integrations.langchain.com/memory) पृष्ठ पर Redis और अन्य प्रदाताओं का उपयोग करके चैट संदेश इतिहास के कार्यान्वयनों के लिए देखें। यहां हम मेमोरी में `ChatMessageHistory` का उपयोग करने के साथ-साथ `RedisChatMessageHistory` का उपयोग करके अधिक स्थायी संग्रहण का प्रदर्शन करते हैं।

## मेमोरी में

नीचे हम एक सरल उदाहरण दिखाते हैं जिसमें चैट इतिहास मेमोरी में रहता है, इस मामले में एक वैश्विक Python डिक्शनरी के माध्यम से।

हम एक कॉलेबल `get_session_history` बनाते हैं जो इस डिक्शनरी का संदर्भ लेता है ताकि `ChatMessageHistory` का एक उदाहरण लौटाया जा सके। कॉलेबल के तर्कों को `RunnableWithMessageHistory` में रन टाइम पर एक कॉन्फ़िगरेशन पास करके निर्दिष्ट किया जा सकता है। डिफ़ॉल्ट रूप से, कॉन्फ़िगरेशन पैरामीटर एक एकल स्ट्रिंग `session_id` की उम्मीद करता है। यह `history_factory_config` kwarg के माध्यम से समायोजित किया जा सकता है।

एकल-पैरामीटर डिफ़ॉल्ट का उपयोग करते हुए:

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

ध्यान दें कि हमने `input_messages_key` (नवीनतम इनपुट संदेश के रूप में माना जाने वाली कुंजी) और `history_messages_key` (ऐतिहासिक संदेशों को जोड़ने के लिए कुंजी) निर्दिष्ट किए हैं।

इस नए runnable को कॉल करते समय, हम एक कॉन्फ़िगरेशन पैरामीटर के माध्यम से संबंधित चैट इतिहास निर्दिष्ट करते हैं:

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

संदेश इतिहास ट्रैक करने के लिए जिन कॉन्फ़िगरेशन पैरामीटरों का उपयोग किया जाता है, उन्हें `history_factory_config` पैरामीटर में `ConfigurableFieldSpec` ऑब्जेक्ट्स की एक सूची पास करके अनुकूलित किया जा सकता है। नीचे, हम दो पैरामीटर का उपयोग करते हैं: `user_id` और `conversation_id`।

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

### विभिन्न हस्ताक्षरों के साथ रनेबल्स के उदाहरण

उपरोक्त runnable एक डिक्शनरी को इनपुट के रूप में लेता है और एक BaseMessage को लौटाता है। नीचे हम कुछ वैकल्पिक उदाहरण दिखाते हैं।

#### संदेश इनपुट, डिक्शनरी आउटपुट

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

#### संदेश इनपुट, संदेश आउटपुट

```python
RunnableWithMessageHistory(
    ChatOpenAI(),
    get_session_history,
)
```

#### सभी संदेशों के लिए एक कुंजी वाला डिक्शनरी इनपुट, संदेश आउटपुट

```python
from operator import itemgetter

RunnableWithMessageHistory(
    itemgetter("input_messages") | ChatOpenAI(),
    get_session_history,
    input_messages_key="input_messages",
)
```

## स्थायी संग्रहण

कई मामलों में वार्तालाप इतिहास को बनाए रखना वांछनीय होता है। `RunnableWithMessageHistory` यह जानने के लिए उदासीन है कि `get_session_history` कॉलेबल अपने चैट संदेश इतिहास कैसे पुनः प्राप्त करता है। [यहां](https://github.com/langchain-ai/langserve/blob/main/examples/chat_with_persistence_and_user/server.py) एक स्थानीय फ़ाइलसिस्टम का उपयोग करने का एक उदाहरण देखें। नीचे हम दिखाते हैं कि कैसे कोई Redis का उपयोग कर सकता है। [मेमोरी एकीकरण](https://integrations.langchain.com/memory) पृष्ठ पर अन्य प्रदाताओं का उपयोग करके चैट संदेश इतिहास के कार्यान्वयनों के लिए देखें।

### सेटअप

हम Redis स्थापित करेंगे यदि यह पहले से स्थापित नहीं है:

```python
%pip install --upgrade --quiet redis
```

यदि हमारे पास Redis तैनाती से कनेक्ट करने के लिए कोई मौजूदा Redis तैनाती नहीं है, तो हम एक स्थानीय Redis Stack सर्वर शुरू करेंगे:

```bash
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

```python
REDIS_URL = "redis://localhost:6379/0"
```

### [LangSmith](/docs/langsmith)

LangSmith संदेश इतिहास इंजेक्शन जैसी चीजों के लिए विशेष रूप से उपयोगी है, जहां यह समझना मुश्किल हो सकता है कि विभिन्न भागों के इनपुट क्या हैं।

ध्यान रखें कि LangSmith आवश्यक नहीं है, लेकिन यह मददगार है।
यदि आप LangSmith का उपयोग करना चाहते हैं, तो लिंक पर साइन अप करने के बाद, ट्रेस लॉगिंग शुरू करने के लिए नीचे दिए गए को अनकमेंट करना सुनिश्चित करें:

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

संदेश इतिहास कार्यान्वयन को अपडेट करने के लिए, हमें एक नया कॉलेबल परिभाषित करना होगा, इस बार `RedisChatMessageHistory` का एक उदाहरण लौटाते हुए:

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

हम पहले की तरह कॉल कर सकते हैं:

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

[Langsmith ट्रेस](https://smith.langchain.com/public/bd73e122-6ec1-48b2-82df-e6483dc9cb63/r)

:::

दूसरे कॉल के लिए Langsmith ट्रेस को देखते हुए, हम देख सकते हैं कि प्रोम्प्ट बनाते समय, एक "इतिहास" चर इंजेक्ट किया गया है जो दो संदेशों (हमारे पहले इनपुट और पहले आउटपुट) की एक सूची है।
