---
translated: true
---

# Trubrics

>[Trubrics](https://trubrics.com) एक LLM उपयोगकर्ता विश्लेषण प्लेटफ़ॉर्म है जो आपको AI मॉडलों पर उपयोगकर्ता प्रॉम्प्ट और प्रतिक्रिया एकत्र, विश्लेषित और प्रबंधित करने देता है।
>
>`Trubrics` के बारे में अधिक जानकारी के लिए [Trubrics repo](https://github.com/trubrics/trubrics-sdk) देखें।

इस गाइड में, हम `TrubricsCallbackHandler` को सेट अप करने के बारे में जानेंगे।

## इंस्टॉलेशन और सेटअप

```python
%pip install --upgrade --quiet  trubrics
```

### Trubrics credentials प्राप्त करना

यदि आपके पास Trubrics खाता नहीं है, तो [यहाँ](https://trubrics.streamlit.app/) एक बनाएं। इस ट्यूटोरियल में, हम खाता बनाने पर बनाई गई `default` प्रोजेक्ट का उपयोग करेंगे।

अब अपने credentials को environment variables के रूप में सेट करें:

```python
import os

os.environ["TRUBRICS_EMAIL"] = "***@***"
os.environ["TRUBRICS_PASSWORD"] = "***"
```

```python
from langchain_community.callbacks.trubrics_callback import TrubricsCallbackHandler
```

### उपयोग

`TrubricsCallbackHandler` को विभिन्न वैकल्पिक तर्कों को प्राप्त कर सकता है। Trubrics प्रॉम्प्ट के लिए पारित किए जा सकने वाले kwargs के लिए [यहाँ](https://trubrics.github.io/trubrics-sdk/platform/user_prompts/#saving-prompts-to-trubrics) देखें।

```python
class TrubricsCallbackHandler(BaseCallbackHandler):

    """
    Callback handler for Trubrics.

    Args:
        project: a trubrics project, default project is "default"
        email: a trubrics account email, can equally be set in env variables
        password: a trubrics account password, can equally be set in env variables
        **kwargs: all other kwargs are parsed and set to trubrics prompt variables, or added to the `metadata` dict
    """
```

## उदाहरण

Langchain [LLMs](/docs/modules/model_io/llms/) या [Chat Models](/docs/modules/model_io/chat/) के साथ `TrubricsCallbackHandler` का उपयोग करने के दो उदाहरण यहाँ हैं। हम OpenAI मॉडल का उपयोग करेंगे, इसलिए अपना `OPENAI_API_KEY` यहाँ सेट करें:

```python
os.environ["OPENAI_API_KEY"] = "sk-***"
```

### 1. एक LLM के साथ

```python
from langchain_openai import OpenAI
```

```python
llm = OpenAI(callbacks=[TrubricsCallbackHandler()])
```

```output
[32m2023-09-26 11:30:02.149[0m | [1mINFO    [0m | [36mtrubrics.platform.auth[0m:[36mget_trubrics_auth_token[0m:[36m61[0m - [1mUser jeff.kayne@trubrics.com has been authenticated.[0m
```

```python
res = llm.generate(["Tell me a joke", "Write me a poem"])
```

```output
[32m2023-09-26 11:30:07.760[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
[32m2023-09-26 11:30:08.042[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print("--> GPT's joke: ", res.generations[0][0].text)
print()
print("--> GPT's poem: ", res.generations[1][0].text)
```

```output
--> GPT's joke:

Q: What did the fish say when it hit the wall?
A: Dam!

--> GPT's poem:

A Poem of Reflection

I stand here in the night,
The stars above me filling my sight.
I feel such a deep connection,
To the world and all its perfection.

A moment of clarity,
The calmness in the air so serene.
My mind is filled with peace,
And I am released.

The past and the present,
My thoughts create a pleasant sentiment.
My heart is full of joy,
My soul soars like a toy.

I reflect on my life,
And the choices I have made.
My struggles and my strife,
The lessons I have paid.

The future is a mystery,
But I am ready to take the leap.
I am ready to take the lead,
And to create my own destiny.
```

### 2. एक चैट मॉडल के साथ

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
```

```python
chat_llm = ChatOpenAI(
    callbacks=[
        TrubricsCallbackHandler(
            project="default",
            tags=["chat model"],
            user_id="user-id-1234",
            some_metadata={"hello": [1, 2]},
        )
    ]
)
```

```python
chat_res = chat_llm.invoke(
    [
        SystemMessage(content="Every answer of yours must be about OpenAI."),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

```output
[32m2023-09-26 11:30:10.550[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print(chat_res.content)
```

```output
Why did the OpenAI computer go to the party?

Because it wanted to meet its AI friends and have a byte of fun!
```
