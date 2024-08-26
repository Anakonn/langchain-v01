---
translated: true
---

# ChatGLM

[ChatGLM-6B](https://github.com/THUDM/ChatGLM-6B) es un modelo de lenguaje bilingüe abierto basado en el marco General Language Model (GLM), con 6.2 mil millones de parámetros. Con la técnica de cuantización, los usuarios pueden implementar localmente en tarjetas gráficas de consumo (solo se requieren 6GB de memoria GPU en el nivel de cuantización INT4).

[ChatGLM2-6B](https://github.com/THUDM/ChatGLM2-6B) es la segunda generación del modelo de chat bilingüe (chino-inglés) de código abierto ChatGLM-6B. Conserva el flujo de conversación suave y el bajo umbral de implementación del modelo de primera generación, mientras introduce nuevas características como un mejor rendimiento, un contexto más largo y una inferencia más eficiente.

[ChatGLM3](https://github.com/THUDM/ChatGLM3) es una nueva generación de modelos de diálogo preentrenados lanzados conjuntamente por Zhipu AI y Tsinghua KEG. ChatGLM3-6B es el modelo de código abierto en la serie ChatGLM3.

```python
# Install required dependencies

%pip install -qU langchain langchain-community
```

## ChatGLM3

Este ejemplo explica cómo usar LangChain para interactuar con ChatGLM3-6B Inference para completar texto.

```python
from langchain.chains import LLMChain
from langchain.schema.messages import AIMessage
from langchain_community.llms.chatglm3 import ChatGLM3
from langchain_core.prompts import PromptTemplate
```

```python
template = """{question}"""
prompt = PromptTemplate.from_template(template)
```

```python
endpoint_url = "http://127.0.0.1:8000/v1/chat/completions"

messages = [
    AIMessage(content="我将从美国到中国来旅游，出行前希望了解中国的城市"),
    AIMessage(content="欢迎问我任何问题。"),
]

llm = ChatGLM3(
    endpoint_url=endpoint_url,
    max_tokens=80000,
    prefix_messages=messages,
    top_p=0.9,
)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "北京和上海两座城市有什么不同？"

llm_chain.run(question)
```

```output
'北京和上海是中国两个不同的城市,它们在很多方面都有所不同。\n\n北京是中国的首都,也是历史悠久的城市之一。它有着丰富的历史文化遗产,如故宫、颐和园等,这些景点吸引着众多游客前来观光。北京也是一个政治、文化和教育中心,有很多政府机构和学术机构总部设在北京。\n\n上海则是一个现代化的城市,它是中国的经济中心之一。上海拥有许多高楼大厦和国际化的金融机构,是中国最国际化的城市之一。上海也是一个美食和购物天堂,有许多著名的餐厅和购物中心。\n\n北京和上海的气候也不同。北京属于温带大陆性气候,冬季寒冷干燥,夏季炎热多风;而上海属于亚热带季风气候,四季分明,春秋宜人。\n\n北京和上海有很多不同之处,但都是中国非常重要的城市,每个城市都有自己独特的魅力和特色。'
```

## ChatGLM y ChatGLM2

El siguiente ejemplo muestra cómo usar LangChain para interactuar con ChatGLM2-6B Inference para completar texto.
ChatGLM-6B y ChatGLM2-6B tienen las mismas especificaciones de API, por lo que este ejemplo debería funcionar con ambos.

```python
from langchain.chains import LLMChain
from langchain_community.llms import ChatGLM
from langchain_core.prompts import PromptTemplate

# import os
```

```python
template = """{question}"""
prompt = PromptTemplate.from_template(template)
```

```python
# default endpoint_url for a local deployed ChatGLM api server
endpoint_url = "http://127.0.0.1:8000"

# direct access endpoint in a proxied environment
# os.environ['NO_PROXY'] = '127.0.0.1'

llm = ChatGLM(
    endpoint_url=endpoint_url,
    max_token=80000,
    history=[
        ["我将从美国到中国来旅游，出行前希望了解中国的城市", "欢迎问我任何问题。"]
    ],
    top_p=0.9,
    model_kwargs={"sample_model_args": False},
)

# turn on with_history only when you want the LLM object to keep track of the conversation history
# and send the accumulated context to the backend model api, which make it stateful. By default it is stateless.
# llm.with_history = True
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "北京和上海两座城市有什么不同？"

llm_chain.run(question)
```

```output
ChatGLM payload: {'prompt': '北京和上海两座城市有什么不同？', 'temperature': 0.1, 'history': [['我将从美国到中国来旅游，出行前希望了解中国的城市', '欢迎问我任何问题。']], 'max_length': 80000, 'top_p': 0.9, 'sample_model_args': False}
```

```output
'北京和上海是中国的两个首都，它们在许多方面都有所不同。\n\n北京是中国的政治和文化中心，拥有悠久的历史和灿烂的文化。它是中国最重要的古都之一，也是中国历史上最后一个封建王朝的都城。北京有许多著名的古迹和景点，例如紫禁城、天安门广场和长城等。\n\n上海是中国最现代化的城市之一，也是中国商业和金融中心。上海拥有许多国际知名的企业和金融机构，同时也有许多著名的景点和美食。上海的外滩是一个历史悠久的商业区，拥有许多欧式建筑和餐馆。\n\n除此之外，北京和上海在交通和人口方面也有很大差异。北京是中国的首都，人口众多，交通拥堵问题较为严重。而上海是中国的商业和金融中心，人口密度较低，交通相对较为便利。\n\n总的来说，北京和上海是两个拥有独特魅力和特点的城市，可以根据自己的兴趣和时间来选择前往其中一座城市旅游。'
```
