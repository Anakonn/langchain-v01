---
sidebar_position: 0
title: त्वरित प्रारंभ
translated: true
---

# त्वरित प्रारंभ

चैट मॉडल भाषा मॉडलों का एक प्रकार हैं।
जबकि चैट मॉडल भाषा मॉडलों का उपयोग करते हैं, उनका इंटरफ़ेस थोड़ा अलग होता है।
"पाठ में, पाठ बाहर" API का उपयोग करने के बजाय, वे एक ऐसा इंटरफ़ेस का उपयोग करते हैं जहां "चैट संदेश" इनपुट और आउटपुट होते हैं।

## सेटअप

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="chat" />

यदि आप वातावरण चर सेट करना नहीं चाहते हैं, तो आप चैट मॉडल वर्ग को प्रारंभ करते समय api key तर्क नामित पैरामीटर के माध्यम से सीधे पास कर सकते हैं:

<ChatModelTabs
  anthropicParams={`model="claude-3-sonnet-20240229", api_key="..."`}
  openaiParams={`model="gpt-3.5-turbo-0125", api_key="..."`}
  mistralParams={`model="mistral-large-latest", api_key="..."`}
  fireworksParams={`model="accounts/fireworks/models/mixtral-8x7b-instruct", api_key="..."`}
  googleParams={`model="gemini-pro", google_api_key="..."`}
  togetherParams={`, together_api_key="..."`}
  customVarName="chat"
/>

## संदेश

चैट मॉडल इंटरफ़ेस संदेशों पर आधारित है, न कि कच्चे पाठ पर।
LangChain में वर्तमान में समर्थित संदेशों के प्रकार हैं `AIMessage`, `HumanMessage`, `SystemMessage`, `FunctionMessage` और `ChatMessage` -- `ChatMessage` एक मनमाना भूमिका पैरामीटर लेता है। अधिकांश समय, आप केवल `HumanMessage`, `AIMessage` और `SystemMessage` से काम करेंगे।

## LCEL

चैट मॉडल [Runnable इंटरफ़ेस](/docs/expression_language/interface) को लागू करते हैं, [LangChain Expression Language (LCEL)](/docs/expression_language/) का मूल बिंदु। इसका मतलब है कि वे `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log` कॉल का समर्थन करते हैं।

चैट मॉडल `List[BaseMessage]` को इनपुट के रूप में स्वीकार करते हैं, या संदेशों में परिवर्तित किए जा सकने वाले वस्तुएं, जिनमें `str` (HumanMessage में परिवर्तित) और `PromptValue` शामिल हैं।

```python
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You're a helpful assistant"),
    HumanMessage(content="What is the purpose of model regularization?"),
]
```

```python
# | output: false
# | echo: false

from langchain_openai import ChatOpenAI

chat = ChatOpenAI()
```

```python
chat.invoke(messages)
```

```output
AIMessage(content="The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to fit the noise in the training data, leading to poor generalization on unseen data. Regularization techniques introduce additional constraints or penalties to the model's objective function, discouraging it from becoming overly complex and promoting simpler and more generalizable models. Regularization helps to strike a balance between fitting the training data well and avoiding overfitting, leading to better performance on new, unseen data.")
```

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
The purpose of model regularization is to prevent overfitting and improve the generalization of a machine learning model. Overfitting occurs when a model is too complex and learns the noise or random variations in the training data, which leads to poor performance on new, unseen data. Regularization techniques introduce additional constraints or penalties to the model's learning process, discouraging it from fitting the noise and reducing the complexity of the model. This helps to improve the model's ability to generalize well and make accurate predictions on unseen data.
```

```python
chat.batch([messages])
```

```output
[AIMessage(content="The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to learn the noise or random fluctuations in the training data, rather than the underlying patterns or relationships. Regularization techniques add a penalty term to the model's objective function, which discourages the model from becoming too complex and helps it generalize better to new, unseen data. This improves the model's ability to make accurate predictions on new data by reducing the variance and increasing the model's overall performance.")]
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to memorize the training data instead of learning general patterns and relationships. This leads to poor performance on new, unseen data.\n\nRegularization techniques introduce additional constraints or penalties to the model during training, discouraging it from becoming overly complex. This helps to strike a balance between fitting the training data well and generalizing to new data. Regularization techniques can include adding a penalty term to the loss function, such as L1 or L2 regularization, or using techniques like dropout or early stopping. By regularizing the model, it encourages it to learn the most relevant features and reduce the impact of noise or outliers in the data.')
```

```python
async for chunk in chat.astream(messages):
    print(chunk.content, end="", flush=True)
```

```output
The purpose of model regularization is to prevent overfitting in machine learning models. Overfitting occurs when a model becomes too complex and starts to memorize the training data instead of learning the underlying patterns. Regularization techniques help in reducing the complexity of the model by adding a penalty to the loss function. This penalty encourages the model to have smaller weights or fewer features, making it more generalized and less prone to overfitting. The goal is to find the right balance between fitting the training data well and being able to generalize well to unseen data.
```

```python
async for chunk in chat.astream_log(messages):
    print(chunk)
```

```output
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': '754c4143-2348-46c4-ad2b-3095913084c6',
            'logs': {},
            'streamed_output': []}})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='The')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' purpose')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' regularization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' is')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' prevent')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' machine')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' learning')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' from')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' training')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' improve')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' its')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' general')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' ability')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' Over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' occurs')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' when')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' becomes')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' too')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complex')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' learns')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' noise')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' or')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' random')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' fluctuations')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' in')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' training')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' instead')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' capturing')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' underlying')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' patterns')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' relationships')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' Regular')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ization')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' techniques')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' introduce')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' a')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' penalty')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' term')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content="'s")})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' objective')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' function')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' which')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' discour')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ages')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' from')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' becoming')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' too')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complex')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' This')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' helps')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' control')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' model')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content="'s")})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' complexity')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' and')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' reduces')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' the')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' risk')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' of')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' over')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='fit')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='ting')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=',')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' leading')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' to')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' better')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' performance')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' on')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' unseen')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content=' data')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='.')})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': AIMessageChunk(content='')})
RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': {'generations': [[{'generation_info': {'finish_reason': 'stop'},
                              'message': AIMessageChunk(content="The purpose of model regularization is to prevent a machine learning model from overfitting the training data and improve its generalization ability. Overfitting occurs when a model becomes too complex and learns to fit the noise or random fluctuations in the training data, instead of capturing the underlying patterns and relationships. Regularization techniques introduce a penalty term to the model's objective function, which discourages the model from becoming too complex. This helps to control the model's complexity and reduces the risk of overfitting, leading to better performance on unseen data."),
                              'text': 'The purpose of model regularization is '
                                      'to prevent a machine learning model '
                                      'from overfitting the training data and '
                                      'improve its generalization ability. '
                                      'Overfitting occurs when a model becomes '
                                      'too complex and learns to fit the noise '
                                      'or random fluctuations in the training '
                                      'data, instead of capturing the '
                                      'underlying patterns and relationships. '
                                      'Regularization techniques introduce a '
                                      "penalty term to the model's objective "
                                      'function, which discourages the model '
                                      'from becoming too complex. This helps '
                                      "to control the model's complexity and "
                                      'reduces the risk of overfitting, '
                                      'leading to better performance on unseen '
                                      'data.'}]],
            'llm_output': None,
            'run': None}})
```

## [LangSmith](/docs/langsmith)

सभी `ChatModel` में बिल्ट-इन LangSmith ट्रेसिंग होती है। बस निम्नलिखित वातावरण चर सेट करें:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=<your-api-key>
```

और किसी भी `ChatModel` आह्वान (चाहे वह श्रृंखला में छिपा हो या नहीं) स्वचालित रूप से ट्रेस किया जाएगा। ट्रेस में इनपुट, आउटपुट, लेटेंसी, टोकन उपयोग, आह्वान पैरामीटर, वातावरण पैरामीटर और अधिक शामिल होंगे। यहां एक उदाहरण देखें: https://smith.langchain.com/public/a54192ae-dd5c-4f7a-88d1-daa1eaba1af7/r.

LangSmith में आप किसी भी ट्रेस के लिए प्रतिक्रिया प्रदान कर सकते हैं, मूल्यांकन के लिए एनोटेट किए गए डेटासेट कंपाइल कर सकते हैं, प्लेग्राउंड में प्रदर्शन डिबग कर सकते हैं, और अधिक।

## [पुराना] `__call__`

#### संदेश में -> संदेश बाहर

सुविधा के लिए आप चैट मॉडलों को कॉलेबल के रूप में भी मान सकते हैं। आप एक या अधिक संदेशों को चैट मॉडल को पास करके चैट पूर्णता प्राप्त कर सकते हैं। प्रतिक्रिया एक संदेश होगी।

```python
from langchain_core.messages import HumanMessage, SystemMessage

chat(
    [
        HumanMessage(
            content="Translate this sentence from English to French: I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'adore la programmation.")
```

OpenAI का चैट मॉडल एकाधिक संदेशों को इनपुट के रूप में समर्थन करता है। [यहां](https://platform.openai.com/docs/guides/chat/chat-vs-completions) अधिक जानकारी के लिए देखें। यहां एक उदाहरण है जहां एक प्रणाली और उपयोगकर्ता संदेश को चैट मॉडल को भेजा जाता है:

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]
chat(messages)
```

```output
AIMessage(content="J'adore la programmation.")
```

## [पुराना] `generate`

#### बैच कॉल, समृद्ध आउटपुट

आप `generate` का उपयोग करके संदेशों के एकाधिक सेटों के लिए पूर्णता उत्पन्न कर सकते हैं। यह एक अतिरिक्त `message` पैरामीटर के साथ एक `LLMResult` लौटाता है। इसमें प्रत्येक उत्पादन के बारे में अतिरिक्त जानकारी (जैसे कि समाप्ति कारण) और पूरे API कॉल के बारे में अतिरिक्त जानकारी (जैसे कि कुल उपयोग किए गए टोकन) शामिल होगी।

```python
batch_messages = [
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love programming."),
    ],
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love artificial intelligence."),
    ],
]
result = chat.generate(batch_messages)
result
```

```output
LLMResult(generations=[[ChatGeneration(text="J'adore programmer.", generation_info={'finish_reason': 'stop'}, message=AIMessage(content="J'adore programmer."))], [ChatGeneration(text="J'adore l'intelligence artificielle.", generation_info={'finish_reason': 'stop'}, message=AIMessage(content="J'adore l'intelligence artificielle."))]], llm_output={'token_usage': {'prompt_tokens': 53, 'completion_tokens': 18, 'total_tokens': 71}, 'model_name': 'gpt-3.5-turbo'}, run=[RunInfo(run_id=UUID('077917a9-026c-47c4-b308-77b37c3a3bfa')), RunInfo(run_id=UUID('0a70a0bf-c599-4f51-932a-c7d42202c984'))])
```

आप इस LLMResult से टोकन उपयोग जैसी चीजें प्राप्त कर सकते हैं:

```python
result.llm_output
```

```output
{'token_usage': {'prompt_tokens': 53,
  'completion_tokens': 18,
  'total_tokens': 71},
 'model_name': 'gpt-3.5-turbo'}
```
