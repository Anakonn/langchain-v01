---
sidebar_position: 3
translated: true
---

# संरचित आउटपुट

अक्सर LLM को संरचित आउटपुट देना महत्वपूर्ण होता है। यह इसलिए है क्योंकि अक्सर LLM के आउटपुट को आगे के अनुप्रयोगों में उपयोग किया जाता है, जहां विशिष्ट तर्कों की आवश्यकता होती है। LLM को संरचित आउटपुट विश्वसनीय रूप से देना उन अनुप्रयोगों के लिए आवश्यक है।

ऐसा करने के कुछ अलग-अलग उच्च स्तरीय रणनीतियां हैं:

- प्रोम्प्टिंग: यह तब होता है जब आप LLM से (बहुत अच्छी तरह से) कहते हैं कि वह इच्छित प्रारूप (JSON, XML) में आउटपुट दे। यह इसलिए अच्छा है क्योंकि यह सभी LLM के साथ काम करता है। यह इसलिए अच्छा नहीं है क्योंकि यह गारंटी नहीं है कि LLM सही प्रारूप में आउटपुट देगा।
- फ़ंक्शन कॉलिंग: यह तब होता है जब LLM को केवल पूर्णता उत्पन्न करने के बजाय फ़ंक्शन कॉल भी उत्पन्न करने में सक्षम बनाया जाता है। LLM द्वारा कॉल किए जा सकने वाले फ़ंक्शन आमतौर पर मॉडल API के अतिरिक्त पैरामीटर के रूप में पारित किए जाते हैं। फ़ंक्शन नाम और विवरण को प्रोम्प्ट का हिस्सा माना जाना चाहिए (वे आमतौर पर टोकन काउंट के खिलाफ गिने जाते हैं, और LLM द्वारा क्या करना है, इसका निर्णय लेने में उपयोग किए जाते हैं)।
- टूल कॉलिंग: फ़ंक्शन कॉलिंग के समान एक तकनीक, लेकिन यह LLM को एक साथ कई फ़ंक्शन कॉल करने की अनुमति देती है।
- JSON मोड: यह तब होता है जब LLM JSON लौटाने की गारंटी देता है।

विभिन्न मॉडल इन में से कुछ वेरिएंट का समर्थन कर सकते हैं, थोड़े अलग-अलग पैरामीटर के साथ। संरचित आउटपुट प्राप्त करने में LLM को आसान बनाने के लिए, हमने LangChain मॉडल में एक सामान्य इंटरफ़ेस जोड़ा है: `.with_structured_output`।

इस विधि को कॉल करके (और एक JSON स्कीमा या Pydantic मॉडल पारित करके) मॉडल संरचित आउटपुट प्राप्त करने के लिए आवश्यक किसी भी मॉडल पैरामीटर + आउटपुट पार्सर जोड़ देगा। इसे करने का एक से अधिक तरीका हो सकता है (उदाहरण के लिए, फ़ंक्शन कॉलिंग बनाम JSON मोड) - आप उस विधि को कॉन्फ़िगर कर सकते हैं जिसका उपयोग करना चाहते हैं।

चलो इसके कुछ उदाहरण देखते हैं!

हम संरचित प्रतिक्रिया स्कीमा को आसानी से संरचित करने के लिए Pydantic का उपयोग करेंगे।

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class Joke(BaseModel):
    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline to the joke")
```

## OpenAI

OpenAI संरचित आउटपुट प्राप्त करने के कुछ अलग-अलग तरीके प्रदर्शित करता है।

[API संदर्भ](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.with_structured_output)

```python
from langchain_openai import ChatOpenAI
```

#### टूल/फ़ंक्शन कॉलिंग

डिफ़ॉल्ट रूप से, हम `function_calling` का उपयोग करेंगे।

```python
model = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='To keep an eye on the mouse!')
```

#### JSON मोड

हम JSON मोड का भी समर्थन करते हैं। ध्यान दें कि हमें प्रोम्प्ट में उस प्रारूप का निर्दिष्ट करना होगा जिसमें इसे प्रतिक्रिया देनी चाहिए।

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='Because it wanted to keep an eye on the mouse!')
```

## Fireworks

[Fireworks](https://fireworks.ai/) भी चयनित मॉडल के लिए फ़ंक्शन कॉलिंग और JSON मोड का समर्थन करता है।

[API संदर्भ](https://api.python.langchain.com/en/latest/chat_models/langchain_fireworks.chat_models.ChatFireworks.html#langchain_fireworks.chat_models.ChatFireworks.with_structured_output)

```python
from langchain_fireworks import ChatFireworks
```

#### टूल/फ़ंक्शन कॉलिंग

डिफ़ॉल्ट रूप से, हम `function_calling` का उपयोग करेंगे।

```python
model = ChatFireworks(model="accounts/fireworks/models/firefunction-v1")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### JSON मोड

हम JSON मोड का भी समर्थन करते हैं। ध्यान दें कि हमें प्रोम्प्ट में उस प्रारूप का निर्दिष्ट करना होगा जिसमें इसे प्रतिक्रिया देनी चाहिए।

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about dogs, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why did the dog sit in the shade?', punchline='To avoid getting burned.')
```

## Mistral

हम Mistral मॉडल के साथ भी संरचित आउटपुट का समर्थन करते हैं, हालांकि हम केवल फ़ंक्शन कॉलिंग का समर्थन करते हैं।

[API संदर्भ](https://api.python.langchain.com/en/latest/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html#langchain_mistralai.chat_models.ChatMistralAI.with_structured_output)

```python
from langchain_mistralai import ChatMistralAI
```

```python
model = ChatMistralAI(model="mistral-large-latest")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## TogetherAI

चूंकि [TogetherAI](https://www.together.ai/) केवल OpenAI का एक बदलाव है, हम सिर्फ OpenAI एकीकरण का उपयोग कर सकते हैं।

```python
import os

from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.environ["TOGETHER_API_KEY"],
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the cat sit on the computer?', punchline='To keep an eye on the mouse!')
```

## Groq

Groq एक OpenAI-संगत फ़ंक्शन कॉलिंग API प्रदान करता है।

[API संदर्भ](https://api.python.langchain.com/en/latest/chat_models/langchain_groq.chat_models.ChatGroq.html#langchain_groq.chat_models.ChatGroq.with_structured_output)

```python
from langchain_groq import ChatGroq
```

#### टूल/फ़ंक्शन कॉलिंग

डिफ़ॉल्ट रूप से, हम `function_calling` का उपयोग करेंगे।

```python
model = ChatGroq()
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### JSON मोड

हम JSON मोड का भी समर्थन करते हैं। ध्यान दें कि हमें प्रोम्प्ट में उस प्रारूप का निर्दिष्ट करना होगा जिसमें इसे प्रतिक्रिया देनी चाहिए।

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Anthropic

Anthropic का टूल-कॉलिंग API आउटपुट को संरचित करने के लिए उपयोग किया जा सकता है। ध्यान दें कि वर्तमान में API के माध्यम से टूल-कॉल को बाध्य करने का कोई तरीका नहीं है, इसलिए मॉडल को सही ढंग से प्रोम्प्ट करना अभी भी महत्वपूर्ण है।

[API संदर्भ](https://api.python.langchain.com/en/latest/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html#langchain_anthropic.chat_models.ChatAnthropic.with_structured_output)

```python
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-3-opus-20240229", temperature=0)
structured_llm = model.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats. Make sure to call the Joke function.")
```

```output
Joke(setup='What do you call a cat that loves to bowl?', punchline='An alley cat!')
```

## Google Vertex AI

Google के Gemini मॉडल [function-calling](https://ai.google.dev/docs/function_calling) का समर्थन करते हैं, जिसका उपयोग हम Vertex AI के माध्यम से कर सकते हैं और आउटपुट को संरचित करने के लिए उपयोग कर सकते हैं।

[API संदर्भ](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html#langchain_google_vertexai.chat_models.ChatVertexAI.with_structured_output)

```python
from langchain_google_vertexai import ChatVertexAI

llm = ChatVertexAI(model="gemini-pro", temperature=0)
structured_llm = llm.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the scarecrow win an award?', punchline='Why did the scarecrow win an award? Because he was outstanding in his field.')
```
