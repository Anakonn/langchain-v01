---
translated: true
---

# OpenLM

[OpenLM](https://github.com/r2d4/openlm)은 다양한 추론 엔드포인트를 직접 HTTP를 통해 호출할 수 있는 zero-dependency OpenAI 호환 LLM 제공자입니다.

OpenAI Completion 클래스를 구현하여 OpenAI API의 드롭인 대체재로 사용할 수 있습니다. 이 변경 집합은 최소한의 추가 코드를 사용하는 BaseOpenAI를 활용합니다.

이 예제에서는 LangChain을 사용하여 OpenAI와 HuggingFace와 상호 작용하는 방법을 살펴봅니다. 두 곳 모두에서 API 키가 필요합니다.

### 설정

종속성을 설치하고 API 키를 설정합니다.

```python
# Uncomment to install openlm and openai if you haven't already

%pip install --upgrade --quiet  openlm
%pip install --upgrade --quiet  langchain-openai
```

```python
import os
from getpass import getpass

# Check if OPENAI_API_KEY environment variable is set
if "OPENAI_API_KEY" not in os.environ:
    print("Enter your OpenAI API key:")
    os.environ["OPENAI_API_KEY"] = getpass()

# Check if HF_API_TOKEN environment variable is set
if "HF_API_TOKEN" not in os.environ:
    print("Enter your HuggingFace Hub API key:")
    os.environ["HF_API_TOKEN"] = getpass()
```

### LangChain을 사용하여 OpenLM 사용하기

여기서는 LLMChain에서 OpenAI의 `text-davinci-003`과 HuggingFace의 `gpt2` 모델 두 개를 호출할 것입니다.

```python
from langchain.chains import LLMChain
from langchain_community.llms import OpenLM
from langchain_core.prompts import PromptTemplate
```

```python
question = "What is the capital of France?"
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

for model in ["text-davinci-003", "huggingface.co/gpt2"]:
    llm = OpenLM(model=model)
    llm_chain = LLMChain(prompt=prompt, llm=llm)
    result = llm_chain.run(question)
    print(
        """Model: {}
Result: {}""".format(model, result)
    )
```

```output
Model: text-davinci-003
Result:  France is a country in Europe. The capital of France is Paris.
Model: huggingface.co/gpt2
Result: Question: What is the capital of France?

Answer: Let's think step by step. I am not going to lie, this is a complicated issue, and I don't see any solutions to all this, but it is still far more
```
