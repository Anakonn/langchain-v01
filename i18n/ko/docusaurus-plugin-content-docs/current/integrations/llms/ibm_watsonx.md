---
translated: true
---

# IBM watsonx.ai

>[WatsonxLLM](https://ibm.github.io/watsonx-ai-python-sdk/fm_extensions.html#langchain)은 IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai) 기반 모델을 래핑한 것입니다.

이 예제는 `LangChain`을 사용하여 `watsonx.ai` 모델과 통신하는 방법을 보여줍니다.

## 설정

`langchain-ibm` 패키지를 설치하세요.

```python
!pip install -qU langchain-ibm
```

이 셀은 `watsonx Foundation Model` 추론을 위해 필요한 WML 자격 증명을 정의합니다.

**작업:** IBM Cloud 사용자 API 키를 제공하세요. 자세한 내용은 [문서](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)를 참조하세요.

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

추가로 환경 변수로 추가 비밀을 전달할 수 있습니다.

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## 모델 로드

모델 `parameters`를 다른 모델이나 작업에 맞게 조정해야 할 수 있습니다. 자세한 내용은 [문서](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#metanames.GenTextParamsMetaNames)를 참조하세요.

```python
parameters = {
    "decoding_method": "sample",
    "max_new_tokens": 100,
    "min_new_tokens": 1,
    "temperature": 0.5,
    "top_k": 50,
    "top_p": 1,
}
```

이전에 설정한 매개변수로 `WatsonxLLM` 클래스를 초기화합니다.

**참고**:

- API 호출에 컨텍스트를 제공하려면 `project_id` 또는 `space_id`를 추가해야 합니다. 자세한 내용은 [문서](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects)를 참조하세요.
- 프로비저닝된 서비스 인스턴스의 지역에 따라 [여기](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication)에 설명된 URL 중 하나를 사용하세요.

이 예에서는 `project_id`와 Dallas URL을 사용할 것입니다.

추론에 사용할 `model_id`를 지정해야 합니다. 사용 가능한 모든 모델은 [문서](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#ibm_watsonx_ai.foundation_models.utils.enums.ModelTypes)에서 찾을 수 있습니다.

```python
from langchain_ibm import WatsonxLLM

watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

또한 Cloud Pak for Data 자격 증명을 사용할 수 있습니다. 자세한 내용은 [문서](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)를 참조하세요.

```python
watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="4.8",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

`model_id` 대신 이전에 튜닝된 모델의 `deployment_id`를 전달할 수도 있습니다. 전체 모델 튜닝 워크플로는 [여기](https://ibm.github.io/watsonx-ai-python-sdk/pt_working_with_class_and_prompt_tuner.html)에 설명되어 있습니다.

```python
watsonx_llm = WatsonxLLM(
    deployment_id="PASTE YOUR DEPLOYMENT_ID HERE",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

## Chain 생성

무작위 질문을 생성할 책임이 있는 `PromptTemplate` 객체를 만듭니다.

```python
from langchain_core.prompts import PromptTemplate

template = "Generate a random question about {topic}: Question: "
prompt = PromptTemplate.from_template(template)
```

주제를 제공하고 `LLMChain`을 실행합니다.

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=watsonx_llm)
llm_chain.invoke("dog")
```

```output
{'topic': 'dog', 'text': 'Why do dogs howl?'}
```

## 모델 직접 호출

완성을 얻으려면 문자열 프롬프트를 사용하여 모델을 직접 호출할 수 있습니다.

```python
# Calling a single prompt

watsonx_llm.invoke("Who is man's best friend?")
```

```output
"Man's best friend is his dog. "
```

```python
# Calling multiple prompts

watsonx_llm.generate(
    [
        "The fastest dog in the world?",
        "Describe your chosen dog breed",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='The fastest dog in the world is the greyhound, which can run up to 45 miles per hour. This is about the same speed as a human running down a track. Greyhounds are very fast because they have long legs, a streamlined body, and a strong tail. They can run this fast for short distances, but they can also run for long distances, like a marathon. ', generation_info={'finish_reason': 'eos_token'})], [Generation(text='The Beagle is a scent hound, meaning it is bred to hunt by following a trail of scents.', generation_info={'finish_reason': 'eos_token'})]], llm_output={'token_usage': {'generated_token_count': 106, 'input_token_count': 13}, 'model_id': 'ibm/granite-13b-instruct-v2', 'deployment_id': ''}, run=[RunInfo(run_id=UUID('52cb421d-b63f-4c5f-9b04-d4770c664725')), RunInfo(run_id=UUID('df2ea606-1622-4ed7-8d5d-8f6e068b71c4'))])
```

## 모델 출력 스트리밍

모델 출력을 스트리밍할 수 있습니다.

```python
for chunk in watsonx_llm.stream(
    "Describe your favorite breed of dog and why it is your favorite."
):
    print(chunk, end="")
```

```output
My favorite breed of dog is a Labrador Retriever. Labradors are my favorite because they are extremely smart, very friendly, and love to be with people. They are also very playful and love to run around and have a lot of energy.
```
