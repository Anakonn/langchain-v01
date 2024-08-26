---
sidebar_class_name: hidden
title: टैगिंग
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/tagging.ipynb)

## उपयोग मामला

टैगिंग का मतलब है किसी दस्तावेज़ को निम्नलिखित वर्गों से लेबल करना:

- भाव
- भाषा
- शैली (औपचारिक, अनौपचारिक आदि)
- कवर किए गए विषय
- राजनीतिक प्रवृत्ति

![Image description](../../../../../static/img/tagging.png)

## अवलोकन

टैगिंग में कुछ घटक होते हैं:

* `function`: [extraction](/docs/use_cases/extraction) की तरह, टैगिंग में [functions](https://openai.com/blog/function-calling-and-other-api-updates) का उपयोग किया जाता है ताकि मॉडल दस्तावेज़ को कैसे टैग करे, यह निर्दिष्ट किया जा सके
* `schema`: यह परिभाषित करता है कि हम दस्तावेज़ को कैसे टैग करना चाहते हैं

## त्वरित शुरुआत

आइए OpenAI टूल कॉलिंग का उपयोग करके LangChain में टैगिंग का एक बहुत ही सरल उदाहरण देखते हैं। हम [`with_structured_output`](/docs/modules/model_io/chat/structured_output) विधि का उपयोग करेंगे जो OpenAI मॉडल द्वारा समर्थित है:

```python
%pip install --upgrade --quiet langchain langchain-openai

# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

आइए अपने schema में कुछ गुण और उनके अपेक्षित प्रकार के साथ एक Pydantic मॉडल निर्दिष्ट करते हैं।

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

tagging_prompt = ChatPromptTemplate.from_template(
    """
Extract the desired information from the following passage.

Only extract the properties mentioned in the 'Classification' function.

Passage:
{input}
"""
)


class Classification(BaseModel):
    sentiment: str = Field(description="The sentiment of the text")
    aggressiveness: int = Field(
        description="How aggressive the text is on a scale from 1 to 10"
    )
    language: str = Field(description="The language the text is written in")


# LLM
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0125").with_structured_output(
    Classification
)

tagging_chain = tagging_prompt | llm
```

```python
inp = "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
tagging_chain.invoke({"input": inp})
```

```output
Classification(sentiment='positive', aggressiveness=1, language='Spanish')
```

यदि हम JSON आउटपुट चाहते हैं, तो हम बस `.dict()` कॉल कर सकते हैं।

```python
inp = "Estoy muy enojado con vos! Te voy a dar tu merecido!"
res = tagging_chain.invoke({"input": inp})
res.dict()
```

```output
{'sentiment': 'negative', 'aggressiveness': 8, 'language': 'Spanish'}
```

जैसा कि हम उदाहरणों में देख सकते हैं, यह सही ढंग से समझता है कि हम क्या चाहते हैं।

परिणाम बदलते रहते हैं, इसलिए हम उदाहरण के लिए भिन्न भाषाओं में भावनाएं ('positive', 'enojado' आदि) प्राप्त कर सकते हैं।

हम अगले खंड में इन परिणामों को कैसे नियंत्रित करें, यह देखेंगे।

## अधिक नियंत्रण

सावधानीपूर्वक schema परिभाषित करने से हमें मॉडल के आउटपुट पर अधिक नियंत्रण मिलता है।

विशेष रूप से, हम परिभाषित कर सकते हैं:

- प्रत्येक गुण के लिए संभावित मान
- गुण को समझने के लिए वर्णन
- वापस लौटाए जाने वाले आवश्यक गुण

आइए पूर्व में उल्लिखित पहलुओं को नियंत्रित करने के लिए enums का उपयोग करके अपने Pydantic मॉडल को पुनः घोषित करें:

```python
class Classification(BaseModel):
    sentiment: str = Field(..., enum=["happy", "neutral", "sad"])
    aggressiveness: int = Field(
        ...,
        description="describes how aggressive the statement is, the higher the number the more aggressive",
        enum=[1, 2, 3, 4, 5],
    )
    language: str = Field(
        ..., enum=["spanish", "english", "french", "german", "italian"]
    )
```

```python
tagging_prompt = ChatPromptTemplate.from_template(
    """
Extract the desired information from the following passage.

Only extract the properties mentioned in the 'Classification' function.

Passage:
{input}
"""
)

llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0125").with_structured_output(
    Classification
)

chain = tagging_prompt | llm
```

अब उत्तर हमारी अपेक्षाओं के अनुरूप प्रतिबंधित होंगे!

```python
inp = "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='happy', aggressiveness=1, language='spanish')
```

```python
inp = "Estoy muy enojado con vos! Te voy a dar tu merecido!"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='sad', aggressiveness=5, language='spanish')
```

```python
inp = "Weather is ok here, I can go outside without much more than a coat"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='neutral', aggressiveness=2, language='english')
```

[LangSmith trace](https://smith.langchain.com/public/38294e04-33d8-4c5a-ae92-c2fe68be8332/r) हमें छिपे हुए पहलुओं को देखने देता है:

![Image description](../../../../../static/img/tagging_trace.png)

### और गहराई में जाना

* आप [metadata tagger](/docs/integrations/document_transformers/openai_metadata_tagger) document transformer का उपयोग कर सकते हैं ताकि LangChain `Document` से मेटाडेटा निकाला जा सके।
* यह टैगिंग श्रृंखला के समान मूलभूत कार्यक्षमता को कवर करता है, केवल LangChain `Document` पर लागू किया गया।
