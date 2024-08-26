---
translated: true
---

यह Jupyter Notebook Javelin AI Gateway का उपयोग करने के लिए Python SDK का उपयोग करने का अन्वेषण करेगा।
Javelin AI Gateway OpenAI, Cohere, Anthropic और अन्य जैसे बड़े भाषा मॉडलों (LLMs) का उपयोग करने में मदद करता है।
गेटवे खुद एक केंद्रीकृत तंत्र प्रदान करता है जो मॉडलों को व्यवस्थित रूप से रोल आउट करता है, पहुंच सुरक्षा, नीति और लागत गार्डरेल प्रदान करता है।

## कदम 1: परिचय

[Javelin AI Gateway](https://www.getjavelin.io) एक उद्यम-स्तरीय API गेटवे है जो बड़े भाषा मॉडलों के साथ सुरक्षित इंटरैक्शन सुनिश्चित करता है। [आधिकारिक दस्तावेज़](https://docs.getjavelin.io) में और अधिक जानकारी प्राप्त करें।

## कदम 2: स्थापना

शुरू करने से पहले, हमें `javelin_sdk` स्थापित करना होगा और Javelin API कुंजी को एक पर्यावरण चर के रूप में सेट करना होगा।

```python
pip install 'javelin_sdk'
```

```output
Requirement already satisfied: javelin_sdk in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (0.1.8)
Requirement already satisfied: httpx<0.25.0,>=0.24.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (0.24.1)
Requirement already satisfied: pydantic<2.0.0,>=1.10.7 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (1.10.12)
Requirement already satisfied: certifi in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (2023.5.7)
Requirement already satisfied: httpcore<0.18.0,>=0.15.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (0.17.3)
Requirement already satisfied: idna in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (3.4)
Requirement already satisfied: sniffio in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (1.3.0)
Requirement already satisfied: typing-extensions>=4.2.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from pydantic<2.0.0,>=1.10.7->javelin_sdk) (4.7.1)
Requirement already satisfied: h11<0.15,>=0.13 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (0.14.0)
Requirement already satisfied: anyio<5.0,>=3.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (3.7.1)
Note: you may need to restart the kernel to use updated packages.
```

## कदम 3: पूर्णता उदाहरण

यह खंड Javelin AI Gateway का उपयोग करके बड़े भाषा मॉडल से पूर्णताओं प्राप्त करने का प्रदर्शन करेगा। यहां एक Python स्क्रिप्ट है जो इसका प्रदर्शन करती है:
(ध्यान दें) यह मान्य है कि आपने गेटवे में 'eng_dept03' नामक एक मार्ग सेट किया है।

```python
from langchain.chains import LLMChain
from langchain_community.llms import JavelinAIGateway
from langchain_core.prompts import PromptTemplate

route_completions = "eng_dept03"

gateway = JavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route=route_completions,
    model_name="gpt-3.5-turbo-instruct",
)

prompt = PromptTemplate("Translate the following English text to French: {text}")

llmchain = LLMChain(llm=gateway, prompt=prompt)
result = llmchain.run("podcast player")

print(result)
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[6], line 2
      1 from langchain.chains import LLMChain
----> 2 from langchain.llms import JavelinAIGateway
      3 from langchain.prompts import PromptTemplate
      5 route_completions = "eng_dept03"

ImportError: cannot import name 'JavelinAIGateway' from 'langchain.llms' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/llms/__init__.py)
```

# कदम 4: एम्बेडिंग उदाहरण

यह खंड Javelin AI Gateway का उपयोग करके पाठ क्वेरी और दस्तावेजों के लिए एम्बेडिंग प्राप्त करने का प्रदर्शन करता है। यहां एक Python स्क्रिप्ट है जो इसका प्रदर्शन करती है:
(ध्यान दें) यह मान्य है कि आपने गेटवे में 'embeddings' नामक एक मार्ग सेट किया है।

```python
from langchain_community.embeddings import JavelinAIGatewayEmbeddings

embeddings = JavelinAIGatewayEmbeddings(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="embeddings",
)

print(embeddings.embed_query("hello"))
print(embeddings.embed_documents(["hello"]))
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[9], line 1
----> 1 from langchain.embeddings import JavelinAIGatewayEmbeddings
      2 from langchain.embeddings.openai import OpenAIEmbeddings
      4 embeddings = JavelinAIGatewayEmbeddings(
      5     gateway_uri="http://localhost:8000", # replace with service URL or host/port of Javelin
      6     route="embeddings",
      7 )

ImportError: cannot import name 'JavelinAIGatewayEmbeddings' from 'langchain.embeddings' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/embeddings/__init__.py)
```

# कदम 5: चैट उदाहरण

यह खंड Javelin AI Gateway का उपयोग करके बड़े भाषा मॉडल के साथ एक चैट करने का प्रदर्शन करता है। यहां एक Python स्क्रिप्ट है जो इसका प्रदर्शन करती है:
(ध्यान दें) यह मान्य है कि आपने गेटवे में 'mychatbot_route' नामक एक मार्ग सेट किया है।

```python
from langchain_community.chat_models import ChatJavelinAIGateway
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Artificial Intelligence has the power to transform humanity and make the world a better place"
    ),
]

chat = ChatJavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="mychatbot_route",
    model_name="gpt-3.5-turbo",
    params={"temperature": 0.1},
)

print(chat(messages))
```

```output
---------------------------------------------------------------------------

ImportError                               Traceback (most recent call last)

Cell In[8], line 1
----> 1 from langchain.chat_models import ChatJavelinAIGateway
      2 from langchain.schema import HumanMessage, SystemMessage
      4 messages = [
      5     SystemMessage(
      6         content="You are a helpful assistant that translates English to French."
   (...)
     10     ),
     11 ]

ImportError: cannot import name 'ChatJavelinAIGateway' from 'langchain.chat_models' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/chat_models/__init__.py)
```

कदम 6: निष्कर्ष
यह ट्यूटोरियल Javelin AI Gateway का परिचय देता है और Python SDK का उपयोग करके इससे कैसे इंटरैक्ट करें, इसका प्रदर्शन करता है।
अधिक उदाहरणों के लिए Javelin [Python SDK](https://www.github.com/getjavelin.io/javelin-python) और अतिरिक्त विवरण के लिए आधिकारिक दस्तावेज़ देखें।

खुशी से कोडिंग करें!
