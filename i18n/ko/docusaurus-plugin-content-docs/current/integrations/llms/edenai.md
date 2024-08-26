---
translated: true
---

# Eden AI

Eden AI는 최고의 AI 제공업체를 통합하여 사용자가 무한한 가능성을 열고 인공 지능의 진정한 잠재력을 활용할 수 있도록 AI 환경을 혁신하고 있습니다. 종합적이고 번거롭지 않은 올인원 플랫폼을 통해 사용자는 단일 API를 통해 AI 기능을 신속하게 배포하고 AI 기능 전체에 쉽게 액세스할 수 있습니다. (웹사이트: https://edenai.co/)

이 예제에서는 LangChain을 사용하여 Eden AI 모델과 상호 작용하는 방법을 설명합니다.

-----------------------------------------------------------------------------------

EDENAI의 API에 액세스하려면 API 키가 필요합니다.

계정을 만들고 https://app.edenai.run/admin/account/settings에서 키를 받을 수 있습니다.

키를 받으면 다음과 같이 환경 변수로 설정하고 싶습니다:

```bash
export EDENAI_API_KEY="..."
```

환경 변수를 설정하고 싶지 않다면 edenai_api_key 매개변수를 통해 직접 키를 전달할 수 있습니다:

```python
from langchain_community.llms import EdenAI
```

```python
llm = EdenAI(edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250)
```

## 모델 호출

EDENAI API는 다양한 제공업체를 통합하며, 각 제공업체는 여러 모델을 제공합니다.

특정 모델에 액세스하려면 인스턴스화 중에 'model'을 추가하면 됩니다.

예를 들어 OpenAI가 제공하는 GPT3.5 모델을 탐색해 보겠습니다.

### 텍스트 생성

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

llm = EdenAI(
    feature="text",
    provider="openai",
    model="gpt-3.5-turbo-instruct",
    temperature=0.2,
    max_tokens=250,
)

prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""

llm(prompt)
```

### 이미지 생성

```python
import base64
from io import BytesIO

from PIL import Image


def print_base64_image(base64_string):
    # Decode the base64 string into binary data
    decoded_data = base64.b64decode(base64_string)

    # Create an in-memory stream to read the binary data
    image_stream = BytesIO(decoded_data)

    # Open the image using PIL
    image = Image.open(image_stream)

    # Display the image
    image.show()
```

```python
text2image = EdenAI(feature="image", provider="openai", resolution="512x512")
```

```python
image_output = text2image("A cat riding a motorcycle by Picasso")
```

```python
print_base64_image(image_output)
```

### 콜백을 사용한 텍스트 생성

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import EdenAI

llm = EdenAI(
    callbacks=[StreamingStdOutCallbackHandler()],
    feature="text",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
)
prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""
print(llm.invoke(prompt))
```

## 호출 체이닝

```python
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
```

```python
llm = EdenAI(feature="text", provider="openai", temperature=0.2, max_tokens=250)
text2image = EdenAI(feature="image", provider="openai", resolution="512x512")
```

```python
prompt = PromptTemplate(
    input_variables=["product"],
    template="What is a good name for a company that makes {product}?",
)

chain = LLMChain(llm=llm, prompt=prompt)
```

```python
second_prompt = PromptTemplate(
    input_variables=["company_name"],
    template="Write a description of a logo for this company: {company_name}, the logo should not contain text at all ",
)
chain_two = LLMChain(llm=llm, prompt=second_prompt)
```

```python
third_prompt = PromptTemplate(
    input_variables=["company_logo_description"],
    template="{company_logo_description}",
)
chain_three = LLMChain(llm=text2image, prompt=third_prompt)
```

```python
# Run the chain specifying only the input variable for the first chain.
overall_chain = SimpleSequentialChain(
    chains=[chain, chain_two, chain_three], verbose=True
)
output = overall_chain.run("hats")
```

```python
# print the image
print_base64_image(output)
```
