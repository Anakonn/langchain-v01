---
keywords:
- gemini
- vertex
- ChatVertexAI
- gemini-pro
sidebar_label: Google Cloud Vertex AI
translated: true
---

# ChatVertexAI

नोट: यह Google PaLM एकीकरण से अलग है। Google ने GCP के माध्यम से PaLM का एक उद्यम संस्करण प्रदान करने का फैसला किया है, और यह वहां उपलब्ध कराई गई मॉडलों का समर्थन करता है।

ChatVertexAI Google Cloud में उपलब्ध सभी मूलभूत मॉडलों को एक्सपोज़ करता है:

- Gemini (`gemini-pro` और `gemini-pro-vision`)
- पाठ के लिए PaLM 2 (`text-bison`)
- कोड जनरेशन के लिए Codey (`codechat-bison`)

उपलब्ध मॉडलों की पूर्ण और अद्यतन सूची के लिए [VertexAI दस्तावेज़ीकरण](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/overview) देखें।

डिफ़ॉल्ट रूप से, Google Cloud [ग्राहक डेटा का उपयोग](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development) नहीं करता है Google Cloud की AI/ML गोपनीयता प्रतिबद्धता के हिस्से के रूप में अपने मूलभूत मॉडलों को प्रशिक्षित करने के लिए। Google द्वारा डेटा प्रसंस्करण के बारे में अधिक जानकारी [Google के ग्राहक डेटा प्रसंस्करण एड्डेंडम (CDPA) में](https://cloud.google.com/terms/data-processing-addendum) भी मिल सकती है।

`Google Cloud Vertex AI` PaLM का उपयोग करने के लिए आपके पास `langchain-google-vertexai` Python पैकेज इंस्टॉल होना चाहिए और या तो:
- आपके वातावरण के लिए क्रेडेंशियल कॉन्फ़िगर किए गए हों (gcloud, वर्कलोड पहचान, आदि...)
- GOOGLE_APPLICATION_CREDENTIALS पर्यावरण चर के रूप में एक सर्विस अकाउंट JSON फ़ाइल का पथ संग्रहीत किया गया हो

यह कोडबेस `google.auth` लाइब्रेरी का उपयोग करता है जो पहले उपर्युक्त एप्लिकेशन क्रेडेंशियल चर को देखता है, और फिर सिस्टम-स्तर प्रमाणीकरण को देखता है।

अधिक जानकारी के लिए, देखें:
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet  langchain-google-vertexai
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_vertexai import ChatVertexAI
```

```python
system = "You are a helpful assistant who translate English to French"
human = "Translate this sentence from English to French. I love programming."
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI()

chain = prompt | chat
chain.invoke({})
```

```output
AIMessage(content=" J'aime la programmation.")
```

Gemini वर्तमान में SystemMessage का समर्थन नहीं करता है, लेकिन इसे पंक्ति में पहले मानव संदेश में जोड़ा जा सकता है। यदि आप ऐसा व्यवहार चाहते हैं, तो बस `convert_system_message_to_human` को `True` पर सेट करें:

```python
system = "You are a helpful assistant who translate English to French"
human = "Translate this sentence from English to French. I love programming."
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI(model="gemini-pro", convert_system_message_to_human=True)

chain = prompt | chat
chain.invoke({})
```

```output
AIMessage(content="J'aime la programmation.")
```

यदि हम उपयोगकर्ता-निर्दिष्ट पैरामीटर लेने वाला एक सरल श्रृंखला बनाना चाहते हैं:

```python
system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI()

chain = prompt | chat

chain.invoke(
    {
        "input_language": "English",
        "output_language": "Japanese",
        "text": "I love programming",
    }
)
```

```output
AIMessage(content=' プログラミングが大好きです')
```

## कोड जनरेशन चैट मॉडल

अब आप Vertex AI में Codey API का उपयोग करके कोड चैट का लाभ उठा सकते हैं। उपलब्ध मॉडल है:
- `codechat-bison`: कोड सहायता के लिए

```python
chat = ChatVertexAI(model="codechat-bison", max_tokens=1000, temperature=0.5)

message = chat.invoke("Write a Python function generating all prime numbers")
print(message.content)
```

```output
 ```python
def is_prime(n):
  """
  Check if a number is prime.

  Args:
    n: The number to check.

  Returns:
    True if n is prime, False otherwise.
  """

  # If n is 1, it is not prime.
  if n == 1:
    return False

  # Iterate over all numbers from 2 to the square root of n.
  for i in range(2, int(n ** 0.5) + 1):
    # If n is divisible by any number from 2 to its square root, it is not prime.
    if n % i == 0:
      return False

  # If n is divisible by no number from 2 to its square root, it is prime.
  return True


def find_prime_numbers(n):
  """
  Find all prime numbers up to a given number.

  Args:
    n: The upper bound for the prime numbers to find.

  Returns:
    A list of all prime numbers up to n.
  """

  # Create a list of all numbers from 2 to n.
  numbers = list(range(2, n + 1))

  # Iterate over the list of numbers and remove any that are not prime.
  for number in numbers:
    if not is_prime(number):
      numbers.remove(number)

  # Return the list of prime numbers.
  return numbers
  ```
```

## पूर्ण जनरेशन जानकारी

हम `generate` विधि का उपयोग करके अतिरिक्त मेटाडेटा जैसे [सुरक्षा विशेषताएं](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai#safety_attribute_confidence_scoring) और केवल चैट पूर्णता प्राप्त कर सकते हैं

ध्यान रखें कि `generation_info` अलग होगा यदि आप gemini मॉडल का उपयोग कर रहे हैं या नहीं।

### Gemini मॉडल

`generation_info` में शामिल होगा:

- `is_blocked`: क्या जनरेशन अवरुद्ध था या नहीं
- `safety_ratings`: सुरक्षा रेटिंग श्रेणियां और संभावना लेबल

```python
from pprint import pprint

from langchain_core.messages import HumanMessage
from langchain_google_vertexai import HarmBlockThreshold, HarmCategory
```

```python
human = "Translate this sentence from English to French. I love programming."
messages = [HumanMessage(content=human)]


chat = ChatVertexAI(
    model_name="gemini-pro",
    safety_settings={
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
    },
)

result = chat.generate([messages])
pprint(result.generations[0][0].generation_info)
```

```output
{'citation_metadata': None,
 'is_blocked': False,
 'safety_ratings': [{'blocked': False,
                     'category': 'HARM_CATEGORY_HATE_SPEECH',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_HARASSMENT',
                     'probability_label': 'NEGLIGIBLE'},
                    {'blocked': False,
                     'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                     'probability_label': 'NEGLIGIBLE'}],
 'usage_metadata': {'candidates_token_count': 6,
                    'prompt_token_count': 12,
                    'total_token_count': 18}}
```

### गैर-gemini मॉडल

`generation_info` में शामिल होगा:

- `is_blocked`: क्या जनरेशन अवरुद्ध था या नहीं
- `safety_attributes`: सुरक्षा विशेषताओं को उनके स्कोर के साथ मैप करने वाला एक डिक्शनरी

```python
chat = ChatVertexAI()  # default is `chat-bison`

result = chat.generate([messages])
pprint(result.generations[0][0].generation_info)
```

```output
{'errors': (),
 'grounding_metadata': {'citations': [], 'search_queries': []},
 'is_blocked': False,
 'safety_attributes': [{'Derogatory': 0.1, 'Insult': 0.1, 'Sexual': 0.2}],
 'usage_metadata': {'candidates_billable_characters': 88.0,
                    'candidates_token_count': 24.0,
                    'prompt_billable_characters': 58.0,
                    'prompt_token_count': 12.0}}
```

## Gemini के साथ टूल कॉलिंग (a.k.a. फ़ंक्शन कॉलिंग)

हम Gemini मॉडल को टूल परिभाषाएं पास कर सकते हैं ताकि मॉडल उचित समय पर उन टूल को कॉल कर सके। यह न केवल LLM-संचालित टूल उपयोग के लिए उपयोगी है, बल्कि मॉडल से अधिक संरचित आउटपुट प्राप्त करने के लिए भी उपयोगी है।

`ChatVertexAI.bind_tools()` के साथ, हम आसानी से Pydantic वर्ग, डिक्ट स्कीमा, LangChain टूल या यहां तक कि फ़ंक्शन को भी मॉडल में टूल के रूप में पास कर सकते हैं। इसके तहत ये Gemini टूल स्कीमा में रूपांतरित किए जाते हैं, जो इस प्रकार दिखता है:

```python
{
    "name": "...",  # tool name
    "description": "...",  # tool description
    "parameters": {...}  # tool input schema as JSONSchema
}
```

```python
from langchain.pydantic_v1 import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm = ChatVertexAI(model="gemini-pro", temperature=0)
llm_with_tools = llm.bind_tools([GetWeather])
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'GetWeather', 'arguments': '{"location": "San Francisco, CA"}'}}, response_metadata={'is_blocked': False, 'safety_ratings': [{'category': 'HARM_CATEGORY_HATE_SPEECH', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HARASSMENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}], 'citation_metadata': None, 'usage_metadata': {'prompt_token_count': 41, 'candidates_token_count': 7, 'total_token_count': 48}}, id='run-05e760dc-0682-4286-88e1-5b23df69b083-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco, CA'}, 'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}])
```

टूल कॉल `AIMessage.tool_calls` विशेषता के माध्यम से प्राप्त किए जा सकते हैं, जहां वे एक मॉडल-निरपेक्ष प्रारूप में निकाले जाते हैं:

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco, CA'},
  'id': 'cd2499c4-4513-4059-bfff-5321b6e922d0'}]
```

टूल कॉलिंग पर पूर्ण गाइड के लिए [यहां जाएं](/docs/modules/model_io/chat/function_calling/)।

## संरचित आउटपुट

कई अनुप्रयोगों को संरचित मॉडल आउटपुट की आवश्यकता होती है। टूल कॉलिंग इसे विश्वसनीय रूप से करना बहुत आसान बना देता है। [with_structured_outputs](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html) निर्माता एक मॉडल से संरचित आउटपुट प्राप्त करने के लिए एक सरल इंटरफ़ेस प्रदान करता है। संरचित आउटपुट पर पूर्ण गाइड के लिए [यहां जाएं](/docs/modules/model_io/chat/structured_output/)।

###  ChatVertexAI.with_structured_outputs()

हमारे Gemini मॉडल से संरचित आउटपुट प्राप्त करने के लिए हमें केवल एक इच्छित स्कीमा निर्दिष्ट करने की आवश्यकता है, चाहे वह Pydantic वर्ग के रूप में हो या JSON स्कीमा के रूप में,

```python
class Person(BaseModel):
    """Save information about a person."""

    name: str = Field(..., description="The person's name.")
    age: int = Field(..., description="The person's age.")


structured_llm = llm.with_structured_output(Person)
structured_llm.invoke("Stefan is already 13 years old")
```

```output
Person(name='Stefan', age=13)
```

### [पुराना] `create_structured_runnable()` का उपयोग करना

संरचित आउटपुट प्राप्त करने का पुराना तरीका `create_structured_runnable` निर्माता का उपयोग करना है:

```python
from langchain_google_vertexai import create_structured_runnable

chain = create_structured_runnable(Person, llm)
chain.invoke("My name is Erick and I'm 27 years old")
```

## असिंक्रोनस कॉल

हम Runnables [Async Interface](/docs/expression_language/interface) के माध्यम से असिंक्रोनस कॉल कर सकते हैं।

```python
# for running these examples in the notebook:
import asyncio

import nest_asyncio

nest_asyncio.apply()
```

```python
system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{text}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chat = ChatVertexAI(model="chat-bison", max_tokens=1000, temperature=0.5)
chain = prompt | chat

asyncio.run(
    chain.ainvoke(
        {
            "input_language": "English",
            "output_language": "Sanskrit",
            "text": "I love programming",
        }
    )
)
```

```output
AIMessage(content=' अहं प्रोग्रामनं प्रेमामि')
```

## स्ट्रीमिंग कॉल

हम `stream` विधि के माध्यम से भी आउटपुट स्ट्रीम कर सकते हैं:

```python
import sys

prompt = ChatPromptTemplate.from_messages(
    [("human", "List out the 5 most populous countries in the world")]
)

chat = ChatVertexAI()

chain = prompt | chat

for chunk in chain.stream({}):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
 The five most populous countries in the world are:
1. China (1.4 billion)
2. India (1.3 billion)
3. United States (331 million)
4. Indonesia (273 million)
5. Pakistan (220 million)
```
