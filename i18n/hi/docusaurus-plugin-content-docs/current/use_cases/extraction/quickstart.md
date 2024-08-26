---
sidebar_position: 0
title: Quickstart
translated: true
---

यह त्वरित प्रारंभ है, हम [चैट मॉडल](/docs/modules/model_io/chat/) का उपयोग करेंगे जो **कार्य/उपकरण कॉलिंग** में सक्षम हैं ताकि पाठ से जानकारी निकाली जा सके।

:::important
**कार्य/उपकरण कॉलिंग** का उपयोग करके निकालना केवल [**कार्य/उपकरण कॉलिंग** समर्थन करने वाले मॉडल](/docs/modules/model_io/chat/function_calling) के साथ काम करता है।
:::

## सेट अप करना

हम [संरचित आउटपुट](/docs/modules/model_io/chat/structured_output) विधि का उपयोग करेंगे जो **कार्य/उपकरण कॉलिंग** में सक्षम एलएलएम पर उपलब्ध है।

एक मॉडल का चयन करें, इसके लिए निर्भरताओं को स्थापित करें और API कुंजियां सेट करें!

```python
!pip install langchain

# Install a model capable of tool calling
# pip install langchain-openai
# pip install langchain-mistralai
# pip install langchain-fireworks

# Set env vars for the relevant model or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

## स्कीमा

पहले, हमें यह बताना होगा कि हम पाठ से कौन सी जानकारी निकालना चाहते हैं।

हम व्यक्तिगत जानकारी निकालने के लिए एक उदाहरण स्कीमा परिभाषित करने के लिए Pydantic का उपयोग करेंगे।

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the peron's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )
```

स्कीमा को परिभाषित करते समय दो सर्वश्रेष्ठ प्रथाएं हैं:

1. **गुण** और **स्कीमा** को दस्तावेज़ीकृत करें: यह जानकारी एलएलएम को भेजी जाती है और जानकारी निकालने की गुणवत्ता में सुधार करने में उपयोग की जाती है।
2. एलएलएम को जानकारी बनाने के लिए मजबूर न करें! ऊपर हमने गुणों के लिए `Optional` का उपयोग किया ताकि एलएलएम `None` आउटपुट कर सके यदि उसे उत्तर नहीं पता है।

:::important
बेहतर प्रदर्शन के लिए, स्कीमा को अच्छी तरह से दस्तावेज़ीकृत करें और सुनिश्चित करें कि मॉडल को पाठ में कोई जानकारी निकालने के लिए नहीं मजबूर किया जाता है।
:::

## एक्सट्रैक्टर

आइए उस स्कीमा का उपयोग करके एक जानकारी एक्सट्रैक्टर बनाते हैं जिसे हमने परिभाषित किया है।

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

# Define a custom prompt to provide instructions and any additional context.
# 1) You can add examples into the prompt template to improve extraction quality
# 2) Introduce additional parameters to take context into account (e.g., include metadata
#    about the document from which the text was extracted.)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert extraction algorithm. "
            "Only extract relevant information from the text. "
            "If you do not know the value of an attribute asked to extract, "
            "return null for the attribute's value.",
        ),
        # Please see the how-to about improving performance with
        # reference examples.
        # MessagesPlaceholder('examples'),
        ("human", "{text}"),
    ]
)
```

हमें **कार्य/उपकरण कॉलिंग** समर्थन करने वाले एक मॉडल का उपयोग करना होगा।

[संरचित आउटपुट](/docs/modules/model_io/chat/structured_output) पर समीक्षा करें कि इस API के साथ उपयोग किए जा सकने वाले कुछ मॉडल कौन से हैं।

```python
from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(model="mistral-large-latest", temperature=0)

runnable = prompt | llm.with_structured_output(schema=Person)
```

चलो इसे आज़माते हैं

```python
text = "Alan Smith is 6 feet tall and has blond hair."
runnable.invoke({"text": text})
```

```output
Person(name='Alan Smith', hair_color='blond', height_in_meters='1.8288')
```

:::important

निकालना जनरेटिव है 🤯

एलएलएम जनरेटिव मॉडल हैं, इसलिए वे कुछ काफी शानदार काम कर सकते हैं जैसे कि व्यक्ति की ऊंचाई को फीट में दिए जाने के बावजूद मीटर में सही ढंग से निकालना!
:::

## एकाधिक इकाइयां

**अधिकतर मामलों** में, आपको एक इकाई के बजाय इकाइयों की एक सूची निकालनी चाहिए।

इसे पायडैंटिक का उपयोग करके एक दूसरे के भीतर मॉडल को नेस्टेड करके आसानी से प्राप्त किया जा सकता है।

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the peron's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )


class Data(BaseModel):
    """Extracted data about people."""

    # Creates a model so that we can extract multiple entities.
    people: List[Person]
```

:::important
निकालना यहां पूरी तरह से सही नहीं हो सकता है। कृपया **संदर्भ उदाहरण** का उपयोग करके निकालने की गुणवत्ता में सुधार करने और **दिशानिर्देश** खंड देखने का जारी रखें!
:::

```python
runnable = prompt | llm.with_structured_output(schema=Data)
text = "My name is Jeff, my hair is black and i am 6 feet tall. Anna has the same color hair as me."
runnable.invoke({"text": text})
```

```output
Data(people=[Person(name='Jeff', hair_color=None, height_in_meters=None), Person(name='Anna', hair_color=None, height_in_meters=None)])
```

:::tip
जब स्कीमा **एकाधिक इकाइयों** के निकालने समायोजित करती है, तो यह मॉडल को पाठ में कोई प्रासंगिक जानकारी नहीं होने पर **कोई इकाइयां नहीं** निकालने की भी अनुमति देती है द्वारा एक खाली सूची प्रदान करके।

यह आमतौर पर एक **अच्छी** बात है! यह एक इकाई पर **आवश्यक** गुणों को निर्दिष्ट करने की अनुमति देता है बिना इस इकाई का पता लगाने के लिए मॉडल को मजबूर करने की आवश्यकता।
:::

## अगले कदम

अब जब आप एक्सट्रैक्शन के साथ LangChain के मूल बातों को समझ चुके हैं, तो आप कैसे-कैसे गाइड के शेष भाग पर आगे बढ़ने के लिए तैयार हैं:

- [उदाहरण जोड़ें](/docs/use_cases/extraction/how_to/examples): **संदर्भ उदाहरणों** का उपयोग करके प्रदर्शन में सुधार करना सीखें।
- [लंबे पाठ को संभालना](/docs/use_cases/extraction/how_to/handle_long_text): आप क्या करें यदि पाठ एलएलएम के संदर्भ विंडो में नहीं फिट होता है?
- [फ़ाइलों को संभालना](/docs/use_cases/extraction/how_to/handle_files): PDF जैसी फ़ाइलों से निकालने के लिए LangChain दस्तावेज़ लोडर और पार्सर का उपयोग करने के उदाहरण।
- [पार्सिंग दृष्टिकोण का उपयोग करें](/docs/use_cases/extraction/how_to/parse): **उपकरण/कार्य कॉलिंग** का समर्थन नहीं करने वाले मॉडल के साथ निकालने के लिए प्रोम्प्ट-आधारित दृष्टिकोण का उपयोग करें।
- [दिशानिर्देश](/docs/use_cases/extraction/guidelines): निकालने के कार्यों पर अच्छा प्रदर्शन प्राप्त करने के लिए दिशानिर्देश।
