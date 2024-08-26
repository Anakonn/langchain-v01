---
sidebar_label: OpenAI
translated: true
---

# ChatOpenAI

यह नोटबुक OpenAI चैट मॉडल्स का उपयोग शुरू करने के बारे में कवर करता है।

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
```

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

उपरोक्त सेल में यह मान लिया जाता है कि आपका OpenAI API कुंजी आपके पर्यावरण चर में सेट है। यदि आप अपना API कुंजी और/या संगठन ID मैनुअल रूप से निर्दिष्ट करना चाहते हैं, तो निम्नलिखित कोड का उपयोग करें:

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0, api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

यदि यह आप पर लागू नहीं होता है, तो openai_organization पैरामीटर को हटा दें।

```python
messages = [
    ("system", "You are a helpful assistant that translates English to French."),
    ("human", "Translate this sentence from English to French. I love programming."),
]
llm.invoke(messages)
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 34, 'total_tokens': 40}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-8591eae1-b42b-402b-a23a-dfdb0cd151bd-0')
```

## श्रृंखला बनाना

हम एक प्रॉम्प्ट टेम्प्लेट के साथ अपने मॉडल को श्रृंखला बना सकते हैं:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

chain = prompt | llm
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love programming.",
    }
)
```

```output
AIMessage(content='Ich liebe Programmieren.', response_metadata={'token_usage': {'completion_tokens': 5, 'prompt_tokens': 26, 'total_tokens': 31}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-94fa6741-c99b-4513-afce-c3f562631c79-0')
```

## उपकरण कॉलिंग

OpenAI के पास एक [उपकरण कॉलिंग](https://platform.openai.com/docs/guides/function-calling) (हम यहां "उपकरण कॉलिंग" और "फ़ंक्शन कॉलिंग" का उपयोग आपस में करते हैं) API है जो आपको उपकरणों और उनके तर्कों का वर्णन करने और मॉडल को एक JSON ऑब्जेक्ट लौटाने की अनुमति देता है जिसमें एक कॉल करने के लिए उपकरण और उस उपकरण के इनपुट होते हैं। उपकरण-कॉलिंग उपकरण-उपयोग श्रृंखलाओं और एजेंटों को बनाने के लिए और मॉडलों से अधिक सामान्य रूप से संरचित आउटपुट प्राप्त करने के लिए अत्यंत उपयोगी है।

### ChatOpenAI.bind_tools()

`ChatAnthropic.bind_tools` के साथ, हम आसानी से Pydantic वर्गों, डिक्ट स्कीमाओं, LangChain उपकरणों या यहां तक कि फ़ंक्शनों को मॉडल में उपकरणों के रूप में पास कर सकते हैं। इसके तहत ये Anthropic उपकरण स्कीमाओं में रूपांतरित किए जाते हैं, जो इस तरह दिखते हैं:

```output
{
    "name": "...",
    "description": "...",
    "parameters": {...}  # JSONSchema
}
```

और हर मॉडल आह्वान में पास किए जाते हैं।

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm_with_tools = llm.bind_tools([GetWeather])
```

```python
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_H7fABDuzEau48T10Qn0Lsh0D', 'function': {'arguments': '{"location":"San Francisco"}', 'name': 'GetWeather'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 70, 'total_tokens': 85}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-b469135e-2718-446a-8164-eef37e672ba2-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco'}, 'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}])
```

### AIMessage.tool_calls

ध्यान दें कि AIMessage में एक `tool_calls` गुण है। यह एक मानक ToolCall प्रारूप में है जो मॉडल प्रदाता-स्वतंत्र है।

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco'},
  'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}]
```

उपकरण बाइंडिंग और उपकरण कॉल आउटपुट के बारे में अधिक जानकारी के लिए, [उपकरण कॉलिंग](/docs/modules/model_io/chat/function_calling/) दस्तावेज़ पर जाएं।

## फ़ाइन-ट्यूनिंग

आप अपने संबंधित `modelName` पैरामीटर पास करके फ़ाइन-ट्यूंड OpenAI मॉडलों को कॉल कर सकते हैं।

यह आमतौर पर `ft:{OPENAI_MODEL_NAME}:{ORG_NAME}::{MODEL_ID}` के रूप में होता है। उदाहरण के लिए:

```python
fine_tuned_model = ChatOpenAI(
    temperature=0, model_name="ft:gpt-3.5-turbo-0613:langchain::7qTVM5AR"
)

fine_tuned_model(messages)
```

```output
AIMessage(content="J'adore la programmation.", additional_kwargs={}, example=False)
```
