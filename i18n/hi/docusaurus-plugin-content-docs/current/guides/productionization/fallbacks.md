---
translated: true
---

# फॉलबैक्स

भाषा मॉडल्स के साथ काम करते समय, आप अक्सर नीचे के एपीआई से समस्याओं का सामना कर सकते हैं, चाहे वे दर सीमा या डाउनटाइम हों। इसलिए, जैसे-जैसे आप अपने एलएलएम अनुप्रयोगों को उत्पादन में ले जाते हैं, यह महत्वपूर्ण हो जाता है कि आप इनके खिलाफ सुरक्षा करें। यही कारण है कि हमने फॉलबैक्स की अवधारणा पेश की है।

एक **फॉलबैक** एक वैकल्पिक योजना है जिसका उपयोग आपात स्थिति में किया जा सकता है।

महत्वपूर्ण बात यह है कि फॉलबैक्स न केवल एलएलएम स्तर पर लागू किए जा सकते हैं, बल्कि पूरे रनएबल स्तर पर भी। यह इसलिए महत्वपूर्ण है क्योंकि अक्सर अलग-अलग मॉडल अलग-अलग प्रोम्प्ट की आवश्यकता होती है। इसलिए, यदि आपका OpenAI कॉल विफल हो जाता है, तो आप सिर्फ वही प्रोम्प्ट Anthropic को नहीं भेजना चाहते - आप शायद एक अलग प्रोम्प्ट टेम्प्लेट का उपयोग करना और वहां एक अलग संस्करण भेजना चाहते हैं।

## एलएलएम एपीआई त्रुटियों के लिए फॉलबैक

यह शायद फॉलबैक्स के सबसे आम उपयोग मामले हो सकता है। एलएलएम एपीआई के अनुरोध कई कारणों से विफल हो सकते हैं - एपीआई बंद हो सकता है, आप दर सीमा को पार कर सकते हैं, कई चीजें हो सकती हैं। इसलिए, फॉलबैक्स का उपयोग करना इन प्रकार की चीजों से बचाव में मदद कर सकता है।

महत्वपूर्ण: डिफ़ॉल्ट रूप से, कई एलएलएम रैपर त्रुटियों को पकड़ते हैं और पुनः प्रयास करते हैं। जब फॉलबैक्स के साथ काम कर रहे हों, तो आप उन्हें बंद करना चाहेंगे। अन्यथा पहला रैपर लगातार पुनः प्रयास करता रहेगा और विफल नहीं होगा।

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_community.chat_models import ChatAnthropic
from langchain_openai import ChatOpenAI
```

पहले, आइए OpenAI से RateLimitError मिलने पर क्या होता है उसे मॉक करें।

```python
from unittest.mock import patch

import httpx
from openai import RateLimitError

request = httpx.Request("GET", "/")
response = httpx.Response(200, request=request)
error = RateLimitError("rate limit", response=response, body="")
```

```python
# Note that we set max_retries = 0 to avoid retrying on RateLimits, etc
openai_llm = ChatOpenAI(max_retries=0)
anthropic_llm = ChatAnthropic()
llm = openai_llm.with_fallbacks([anthropic_llm])
```

```python
# Let's use just the OpenAI LLm first, to show that we run into an error
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(openai_llm.invoke("Why did the chicken cross the road?"))
    except RateLimitError:
        print("Hit error")
```

```output
Hit error
```

```python
# Now let's try with fallbacks to Anthropic
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(llm.invoke("Why did the chicken cross the road?"))
    except RateLimitError:
        print("Hit error")
```

```output
content=' I don\'t actually know why the chicken crossed the road, but here are some possible humorous answers:\n\n- To get to the other side!\n\n- It was too chicken to just stand there. \n\n- It wanted a change of scenery.\n\n- It wanted to show the possum it could be done.\n\n- It was on its way to a poultry farmers\' convention.\n\nThe joke plays on the double meaning of "the other side" - literally crossing the road to the other side, or the "other side" meaning the afterlife. So it\'s an anti-joke, with a silly or unexpected pun as the answer.' additional_kwargs={} example=False
```

हम अपने "फॉलबैक्स के साथ एलएलएम" का उपयोग सामान्य एलएलएम की तरह कर सकते हैं।

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're a nice assistant who always includes a compliment in your response",
        ),
        ("human", "Why did the {animal} cross the road"),
    ]
)
chain = prompt | llm
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(chain.invoke({"animal": "kangaroo"}))
    except RateLimitError:
        print("Hit error")
```

```output
content=" I don't actually know why the kangaroo crossed the road, but I can take a guess! Here are some possible reasons:\n\n- To get to the other side (the classic joke answer!)\n\n- It was trying to find some food or water \n\n- It was trying to find a mate during mating season\n\n- It was fleeing from a predator or perceived threat\n\n- It was disoriented and crossed accidentally \n\n- It was following a herd of other kangaroos who were crossing\n\n- It wanted a change of scenery or environment \n\n- It was trying to reach a new habitat or territory\n\nThe real reason is unknown without more context, but hopefully one of those potential explanations does the joke justice! Let me know if you have any other animal jokes I can try to decipher." additional_kwargs={} example=False
```

## अनुक्रमों के लिए फॉलबैक

हम अनुक्रमों के लिए भी फॉलबैक बना सकते हैं, जो खुद अनुक्रम हैं। यहां हम ऐसा दो अलग-अलग मॉडल्स के साथ करते हैं: ChatOpenAI और फिर सामान्य OpenAI (जो एक चैट मॉडल नहीं है)। OpenAI एक चैट मॉडल नहीं है, इसलिए आप शायद एक अलग प्रोम्प्ट चाहेंगे।

```python
# First let's create a chain with a ChatModel
# We add in a string output parser here so the outputs between the two are the same type
from langchain_core.output_parsers import StrOutputParser

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're a nice assistant who always includes a compliment in your response",
        ),
        ("human", "Why did the {animal} cross the road"),
    ]
)
# Here we're going to use a bad model name to easily create a chain that will error
chat_model = ChatOpenAI(model="gpt-fake")
bad_chain = chat_prompt | chat_model | StrOutputParser()
```

```python
# Now lets create a chain with the normal OpenAI model
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

prompt_template = """Instructions: You should always include a compliment in your response.

Question: Why did the {animal} cross the road?"""
prompt = PromptTemplate.from_template(prompt_template)
llm = OpenAI()
good_chain = prompt | llm
```

```python
# We can now create a final chain which combines the two
chain = bad_chain.with_fallbacks([good_chain])
chain.invoke({"animal": "turtle"})
```

```output
'\n\nAnswer: The turtle crossed the road to get to the other side, and I have to say he had some impressive determination.'
```

## लंबे इनपुट के लिए फॉलबैक

एलएलएम की सबसे बड़ी सीमाओं में से एक उनका संदर्भ विंडो है। आमतौर पर, आप प्रोम्प्ट की लंबाई को गिन और ट्रैक कर सकते हैं, लेकिन ऐसी स्थितियों में जहां यह कठिन/जटिल है, आप एक लंबे संदर्भ लंबाई वाले मॉडल पर फॉलबैक कर सकते हैं।

```python
short_llm = ChatOpenAI()
long_llm = ChatOpenAI(model="gpt-3.5-turbo-16k")
llm = short_llm.with_fallbacks([long_llm])
```

```python
inputs = "What is the next number: " + ", ".join(["one", "two"] * 3000)
```

```python
try:
    print(short_llm.invoke(inputs))
except Exception as e:
    print(e)
```

```output
This model's maximum context length is 4097 tokens. However, your messages resulted in 12012 tokens. Please reduce the length of the messages.
```

```python
try:
    print(llm.invoke(inputs))
except Exception as e:
    print(e)
```

```output
content='The next number in the sequence is two.' additional_kwargs={} example=False
```

## बेहतर मॉडल पर फॉलबैक

अक्सर हम मॉडलों से एक विशिष्ट प्रारूप (जैसे JSON) में आउटपुट करने का अनुरोध करते हैं। GPT-3.5 जैसे मॉडल इसे ठीक कर सकते हैं, लेकिन कभी-कभी संघर्ष करते हैं। यह प्राकृतिक रूप से फॉलबैक की ओर इशारा करता है - हम GPT-3.5 (तेज, सस्ता) के साथ कोशिश कर सकते हैं, लेकिन फिर यदि पार्सिंग विफल हो जाती है तो हम GPT-4 का उपयोग कर सकते हैं।

```python
from langchain.output_parsers import DatetimeOutputParser
```

```python
prompt = ChatPromptTemplate.from_template(
    "what time was {event} (in %Y-%m-%dT%H:%M:%S.%fZ format - only return this value)"
)
```

```python
# In this case we are going to do the fallbacks on the LLM + output parser level
# Because the error will get raised in the OutputParser
openai_35 = ChatOpenAI() | DatetimeOutputParser()
openai_4 = ChatOpenAI(model="gpt-4") | DatetimeOutputParser()
```

```python
only_35 = prompt | openai_35
fallback_4 = prompt | openai_35.with_fallbacks([openai_4])
```

```python
try:
    print(only_35.invoke({"event": "the superbowl in 1994"}))
except Exception as e:
    print(f"Error: {e}")
```

```output
Error: Could not parse datetime string: The Super Bowl in 1994 took place on January 30th at 3:30 PM local time. Converting this to the specified format (%Y-%m-%dT%H:%M:%S.%fZ) results in: 1994-01-30T15:30:00.000Z
```

```python
try:
    print(fallback_4.invoke({"event": "the superbowl in 1994"}))
except Exception as e:
    print(f"Error: {e}")
```

```output
1994-01-30 15:30:00
```
