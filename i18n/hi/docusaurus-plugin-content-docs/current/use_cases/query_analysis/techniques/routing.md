---
sidebar_position: 2
translated: true
---

# रूटिंग

कभी-कभी हमारे पास विभिन्न डोमेनों के लिए कई इंडेक्स होते हैं, और विभिन्न प्रश्नों के लिए हम इन इंडेक्सों के विभिन्न उपसमूहों को क्वेरी करना चाहते हैं। उदाहरण के लिए, मान लीजिए कि हमारे पास LangChain पायथन प्रलेखन के लिए एक वेक्टर स्टोर इंडेक्स और LangChain js प्रलेखन के लिए एक इंडेक्स है। LangChain उपयोग के बारे में एक प्रश्न दिया जाने पर, हम यह अनुमान लगाना चाहेंगे कि प्रश्न किस भाषा से संबंधित है और उचित दस्तावेज़ों पर क्वेरी करना चाहेंगे। **क्वेरी रूटिंग** प्रक्रिया है जिसमें यह निर्धारित किया जाता है कि क्वेरी को किस इंडेक्स या इंडेक्सों के उपसमूह पर निष्पादित किया जाना चाहिए।

## सेटअप

#### निर्भरताएं स्थापित करें

```python
%pip install -qU langchain-core langchain-openai
```

#### पर्यावरण चर सेट करें

हम इस उदाहरण में OpenAI का उपयोग करेंगे:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## फ़ंक्शन-कॉलिंग मॉडल के साथ रूटिंग

फ़ंक्शन-कॉलिंग मॉडल के साथ, वर्गीकरण के लिए मॉडल का उपयोग करना सरल है, जो कि रूटिंग का मूल है:

```python
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasource: Literal["python_docs", "js_docs", "golang_docs"] = Field(
        ...,
        description="Given a user question choose which datasource would be most relevant for answering their question",
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(RouteQuery)

system = """You are an expert at routing a user question to the appropriate data source.

Based on the programming language the question is referring to, route it to the relevant data source."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)

router = prompt | structured_llm
```

```output
/Users/bagatur/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

```python
question = """Why doesn't the following code work:

from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(["human", "speak in {language}"])
prompt.invoke("french")
"""
router.invoke({"question": question})
```

```output
RouteQuery(datasource='python_docs')
```

```python
question = """Why doesn't the following code work:


import { ChatPromptTemplate } from "@langchain/core/prompts";


const chatPrompt = ChatPromptTemplate.fromMessages([
  ["human", "speak in {language}"],
]);

const formattedChatPrompt = await chatPrompt.invoke({
  input_language: "french"
});
"""
router.invoke({"question": question})
```

```output
RouteQuery(datasource='js_docs')
```

## एक से अधिक इंडेक्स पर रूटिंग

यदि हम एक से अधिक इंडेक्स पर क्वेरी करना चाहते हैं, तो हम ऐसा कर सकते हैं, अपने स्कीमा को अपडेट करके डेटा स्रोतों की सूची स्वीकार करने के लिए:

```python
from typing import List


class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasources: List[Literal["python_docs", "js_docs", "golang_docs"]] = Field(
        ...,
        description="Given a user question choose which datasources would be most relevant for answering their question",
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(RouteQuery)
router = prompt | structured_llm
router.invoke(
    {
        "question": "is there feature parity between the Python and JS implementations of OpenAI chat models"
    }
)
```

```output
RouteQuery(datasources=['python_docs', 'js_docs'])
```
