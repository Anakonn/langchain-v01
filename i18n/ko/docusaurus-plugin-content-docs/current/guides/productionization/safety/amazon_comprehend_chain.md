---
translated: true
---

# Amazon Comprehend 모더레이션 체인

> [Amazon Comprehend](https://aws.amazon.com/comprehend/)는 텍스트에서 유용한 인사이트와 연결을 발견하기 위해 기계 학습을 사용하는 자연어 처리(NLP) 서비스입니다.

이 노트북에서는 `Amazon Comprehend`를 사용하여 `개인 식별 정보`(`PII`)와 유해성을 감지하고 처리하는 방법을 보여줍니다.

## 설정

```python
%pip install --upgrade --quiet boto3 nltk
```

```python
%pip install --upgrade --quiet langchain_experimental
```

```python
%pip install --upgrade --quiet langchain pydantic
```

```python
import os

import boto3

comprehend_client = boto3.client("comprehend", region_name="us-east-1")
```

```python
from langchain_experimental.comprehend_moderation import AmazonComprehendModerationChain

comprehend_moderation = AmazonComprehendModerationChain(
    client=comprehend_client,
    verbose=True,  # 선택 사항
)
```

## AmazonComprehendModerationChain을 LLM 체인과 함께 사용하기

**참고**: 아래 예제에서는 LangChain의 *Fake LLM*을 사용하지만, 동일한 개념을 다른 LLM에도 적용할 수 있습니다.

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate
from langchain_experimental.comprehend_moderation.base_moderation_exceptions import (
    ModerationPiiError,
)

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # 자신의 욕설로 교체하십시오
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comprehend_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | comprehend_moderation
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-22-3345. Can you give me some more samples?"
        }
    )
except ModerationPiiError as e:
    print(str(e))
else:
    print(response["output"])
```

## `moderation_config`를 사용하여 모더레이션 사용자 지정하기

Amazon Comprehend 모더레이션을 사용하여 수행할 모더레이션과 각 모더레이션에 대해 수행할 조치를 제어하는 구성을 사용할 수 있습니다. 위와 같이 구성 없이 전달될 때 발생하는 세 가지 다른 모더레이션이 있습니다. 이러한 모더레이션은 다음과 같습니다:

- PII (개인 식별 정보) 체크
- 유해성 콘텐츠 감지
- 프롬프트 안전 감지

다음은 모더레이션 구성의 예입니다.

```python
from langchain_experimental.comprehend_moderation import (
    BaseModerationConfig,
    ModerationPiiConfig,
    ModerationPromptSafetyConfig,
    ModerationToxicityConfig,
)

pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.5)

moderation_config = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)
```

구성의 핵심에는 세 가지 구성 모델이 있습니다:

- `ModerationPiiConfig`: PII 검증의 동작을 구성하는 데 사용됩니다. 초기화할 수 있는 매개변수는 다음과 같습니다:
  - `labels`: PII 엔티티 라벨입니다. 기본값은 빈 목록으로, PII 검증이 모든 PII 엔티티를 고려합니다.
  - `threshold`: 감지된 엔티티의 신뢰도 임계값으로, 기본값은 0.5 또는 50%입니다.
  - `redact`: 텍스트에 대한 수정이 수행될지 여부를 나타내는 부울 플래그로, 기본값은 `False`입니다. `False`로 설정되면 PII 검증이 PII 엔티티를 감지할 때 오류가 발생하고, `True`로 설정되면 텍스트에서 PII 값을 단순히 수정합니다.
  - `mask_character`: 마스킹에 사용되는 문자로, 기본값은 별표(\*)입니다.
- `ModerationToxicityConfig`: 유해성 검증의 동작을 구성하는 데 사용됩니다. 초기화할 수 있는 매개변수는 다음과 같습니다:
  - `labels`: 유해 엔티티 라벨입니다. 기본값은 빈 목록으로, 유해성 검증이 모든 유해 엔티티를 고려합니다.
  - `threshold`: 감지된 엔티티의 신뢰도 임계값으로, 기본값은 0.5 또는 50%입니다.
- `ModerationPromptSafetyConfig`: 프롬프트 안전성 검증의 동작을 구성하는 데 사용됩니다.
  - `threshold`: 프롬프트 안전성 분류의 신뢰도 임계값으로, 기본값은 0.5 또는 50%입니다.

마지막으로, `BaseModerationConfig`를 사용하여 이러한 체크가 수행될 순서를 정의할 수 있습니다. `BaseModerationConfig`는 `filters` 매개변수를 선택적으로 사용하여 하나 이상의 위의 검증 체크 목록을 받을 수 있습니다. `BaseModerationConfig`는 필터가 없는 상태로 초기화될 수도 있으며, 이 경우 모든 체크가 기본 구성으로 사용됩니다(더 자세한 내용은 나중에 설명합니다).

위 셀의 구성을 사용하면 PII 체크를 수행하고 프롬프트가 통과하도록 허용하지만, 프롬프트 또는 LLM 출력에 있는 SSN 번호는 마스킹됩니다.

```python
comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # 구성을 지정하십시오
    client=comprehend_client,  # Boto3 클라이언트 선택적으로 전달
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # 자신의 욕설로 교체하십시오
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-45-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## 고유 ID 및 모더레이션 콜백

Amazon Comprehend 모더레이션 작업이 구성된 엔티티를 식별하면 체인은 다음 예외 중 하나를 발생시킵니다:

- `ModerationPiiError`, PII 체크에 대해
- `ModerationToxicityError`, 유해성 체크에 대해
- `ModerationPromptSafetyError`, 프롬프트 안전성 체크에 대해

모더레이션 구성 외에도 `AmazonComprehendModerationChain`은 다음 매개변수로 초기화될 수 있습니다:

- `unique_id` [선택 사항] 문자열 매개변수입니다. 이 매개변수는 임의의 문자열 값이나 ID를 전달하는 데 사용할 수 있습니다. 예를 들어, 채팅 애플리케이션에서 악성 사용자를 추적하려는 경우 사용자 이름/이메일 ID 등을 전달할 수 있습니다. 기본값은 `None`입니다.

- `moderation_callback` [선택 사항] `BaseModerationCallbackHandler`로, 체인에 비차단(non-blocking)으로 비동기적으로 호출됩니다. 콜백 함수는 모더레이션 함수가 실행될 때 추가 작업을 수행하려는 경우 유용합니다. 예를 들어, 데이터베이스에 기록하거나 로그 파일을 작성할 수 있습니다. `BaseModerationCallbackHandler`를 서브클래싱하여 세 가지 함수 `on_after_pii()`, `on_after_toxicity()`, `on_after_prompt_safety()`를 재정의할 수 있습니다. 모든 함수는 `async` 함수여야 합니다. 이 콜백 함수는 두 가지 인수를 받습니다:
  - `moderation_beacon`: 모더레이션 함수, Amazon Comprehend 모델의 전체 응답, 고유 체인 ID, 모더레이션 상태 및 검증된 입력 문자열에 대한 정보를 포함하는 사전입니다. 사전의 스키마는 다음과 같습니다:
  ```
  {
      'moderation_chain_id': 'xxx-xxx-xxx', # 고유 체인 ID
      'moderation_type': 'Toxicity' | 'PII' | 'PromptSafety',
      'moderation_status': 'LABELS_FOUND' | 'LABELS_NOT_FOUND',
      'moderation_input': 'A sample SSN number looks like this 123-456-7890. Can you give me some more samples?',
      'moderation_output': {...} # Amazon Comprehend PII, Toxicity, 또는 Prompt Safety 모델의 전체 출력
  }
  ```
  - `unique_id`: `AmazonComprehendModerationChain`에 전달된 경우

<div class="alert alert-block alert-info"> <b>참고:</b> <code>moderation_callback</code>는 LangChain 체인 콜백과 다릅니다. <code>AmazonComprehendModerationChain</code>을 사용할 때 여전히 LangChain 체인 콜백을 사용할 수 있습니다. 예: <br/>
<pre>
from langchain.callbacks.stdout import StdOutCallbackHandler
comp_moderation_with_config = AmazonComprehendModerationChain(verbose=True, callbacks=[StdOutCallbackHandler()])
</pre>
</div>

```python
from langchain_experimental.comprehend_moderation import BaseModerationCallbackHandler
```

```python
# BaseModerationCallbackHandler를 서브클래싱하여 콜백 핸들러 정의

class MyModCallback(BaseModerationCallbackHandler):
    async def on_after_pii(self, output_beacon, unique_id):
        import json

        moderation_type = output_beacon["moderation_type"]
        chain_id = output_beacon["moderation_chain_id"]
        with open(f"output-{moderation_type}-{chain_id}.json", "w") as file:
            data = {"beacon_data": output_beacon, "unique_id": unique_id}
            json.dump(data, file)

    """
    async def on_after_toxicity(self, output_beacon, unique_id):
        pass

    async def on_after_prompt_safety(self, output_beacon, unique_id):
        pass
    """

my_callback = MyModCallback()
```

```python
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

moderation_config = BaseModerationConfig(filters=[pii_config, toxicity_config])

comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # 구성을 지정하십시오
    client=comprehend_client,  # Boto3 클라이언트 선택적으로 전달
    unique_id="john.doe@email.com",  # 고유 ID
    moderation_callback=my_callback,  # BaseModerationCallbackHandler
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # 자신의 욕설로 교체하십시오
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]

llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-456-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## `moderation_config`와 모더레이션 실행 순서

`AmazonComprehendModerationChain`이 `moderation_config` 없이 초기화되면, 기본값인 `BaseModerationConfig`로 초기화됩니다. 필터가 사용되지 않으면 모더레이션 체크 순서는 다음과 같습니다.

```
AmazonComprehendModerationChain
│
└── PII 체크 (정지 작업)
    ├── 콜백 (있다면)
    ├── 라벨 발견 ⟶ [에러 정지]
    └── 라벨 발견 안됨
        └── 유해성 체크 (정지 작업)
            ├── 콜백 (있다면)
            ├── 라벨 발견 ⟶ [에러 정지]
            └── 라벨 발견 안됨
                └── 프롬프트 안전성 체크 (정지 작업)
                    ├── 콜백 (있다면)
                    ├── 라벨 발견 ⟶ [에러 정지]
                    └── 라벨 발견 안됨
                        └── 프롬프트 반환
```

어떤 체크에서 검증 예외가 발생하면 이후의 체크는 수행되지 않습니다. 이 경우 콜백이 제공되면 수행된 각 체크에 대해 호출됩니다. 예를 들어, 위의 경우 체인이 PII가 존재하여 실패하면 유해성 및 프롬프트 안전성 체크는 수행되지 않습니다.

실행 순서를 `moderation_config`를 전달하여 재정의할 수 있으며, `BaseModerationConfig`의 `filters` 매개변수에 원하는 순서를 지정할 수 있습니다. 아래 구성에서는 먼저 유해성 체크가 수행되고, 그 다음으로 PII, 마지막으로 프롬프트 안전성 검증이 수행됩니다. 이 경우 `AmazonComprehendModerationChain`은 각 모델의 기본값을 사용하여 지정된 순서대로 필요한 체크를 수행합니다.

```python
pii_check = ModerationPiiConfig()
toxicity_check = ModerationToxicityConfig()
prompt_safety_check = ModerationPromptSafetyConfig()

moderation_config = BaseModerationConfig(filters=[toxicity_check, pii_check, prompt_safety_check])
```

특정 모더레이션 체크에 대해 하나 이상의 구성을 사용할 수도 있습니다. 예를 들어, 아래 샘플에서는 두 개의 연속된 PII 체크가 수행됩니다. 첫 번째 구성은 SSN을 체크하고, 발견되면 에러를 발생시킵니다. SSN이 발견되지 않으면 다음으로 NAME과 CREDIT_DEBIT_NUMBER가 있는지 체크하고 이를 마스킹합니다.

```python
pii_check_1 = ModerationPiiConfig(labels=["SSN"])
pii_check_2 = ModerationPiiConfig(labels=["NAME", "CREDIT_DEBIT_NUMBER"], redact=True)

moderation_config = BaseModerationConfig(filters=[pii_check_1, pii_check_2])
```

1. PII 라벨 목록은 Amazon Comprehend Universal PII 엔터티 유형을 참조하십시오 - [링크](https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html#how-pii-types)
2. 사용 가능한 유해성 라벨 목록은 다음과 같습니다:
   - `HATE_SPEECH`: 인종, 민족, 성별, 종교, 성적 지향, 능력, 국적 또는 기타 정체성 그룹을 기준으로 개인이나 그룹을 비판, 모욕, 비난 또는 비인간화하는 발언.
   - `GRAPHIC`: 시각적으로 묘사적이고 불쾌한 이미지를 사용하여 모욕, 불편함 또는 해를 증폭시키기 위해 확장된 언어.
   - `HARASSMENT_OR_ABUSE`: 의도와 관계없이 발언자와 청취자 사이에 파괴적인 권력 역학을 부과하거나, 청취자의 심리적 안녕에 영향을 미치거나, 사람을 대상화하는 발언.
   - `SEXUAL`: 신체 부위 또는 신체적 특성이나 성에 대한 직접적 또는 간접적인 언급을 통해 성적 관심, 활동 또는 흥분을 나타내는 발언.
   - `VIOLENCE_OR_THREAT`: 사람이나 그룹에게 고통, 상해 또는 적의를 가하려는 위협을 포함하는 발언.
   - `INSULT`: 비하, 모욕, 조롱, 모욕 또는 경멸적인 언어를 포함하는 발언.
   - `PROFANITY`: 불쾌하거나 모욕적인 단어, 구문 또는 약어를 포함하는 발언.
3. 프롬프트 안전성 라벨 목록은 문서를 참조하십시오 [링크](#).

## 예제

### Hugging Face Hub 모델 사용

Hugging Face 허브에서 [API 키를 얻으십시오](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token).

```python
%pip install --upgrade --quiet huggingface_hub
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "<YOUR HF TOKEN HERE>"
```

```python
# https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads 에서 다른 옵션을 참조하십시오

repo_id = "google/flan-t5-xxl"
```

```python
from langchain_community.llms import HuggingFaceHub
from langchain_core.prompts import PromptTemplate

template = """{question}"""

prompt = PromptTemplate.from_template(template)
llm = HuggingFaceHub(
    repo_id=repo_id, model_kwargs={"temperature": 0.5, "max_length": 256}
)
```

구성을 생성하고 Amazon Comprehend 모더레이션 체인을 초기화합니다.

```python
# 필터 구성 정의

pii_config = ModerationPiiConfig(
    labels=["SSN", "CREDIT_DEBIT_NUMBER"], redact=True, mask_character="X"
)

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.8)

# 위의 필터 구성을 사용하여 다른 모더레이션 구성 정의

moderation_config_1 = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)

moderation_config_2 = BaseModerationConfig(filters=[pii_config])

# 콜백이 있는 입력 프롬프트 모더레이션 체인

amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# 콜백이 없는 LLM 모더레이션 체인 출력

amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

이제 `moderation_config`는 점수 임계값 0.5 또는 50% 이상인 유해 단어 또는 문장, 나쁜 의도 또는 SSN 이외의 PII 엔티티가 포함된 입력과 모델 출력을 차단합니다. PII 엔티티 - SSN을 찾으면 호출이 진행되기 전에 이를 수정합니다. 또한 모델의 응답에서 SSN이나 신용카드 번호를 마스킹합니다.

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {
            "question": """What is John Doe's address, phone number and SSN from the following text?

John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
"""
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

### Amazon SageMaker Jumpstart 사용

아래 예제는 Amazon SageMaker Jumpstart 호스팅 LLM과 함께 Amazon Comprehend 모더레이션 체인을 사용하는 방법을 보여줍니다. AWS 계정 내에서 Amazon SageMaker Jumpstart 호스팅 LLM 엔드포인트를 사용해야 합니다. Amazon SageMaker Jumpstart 호스팅 엔드포인트로 LLM을 배포하는 방법에 대한 자세한 내용은 [이 노트북](https://github.com/aws/amazon-sagemaker-examples/blob/main/introduction_to_amazon_algorithms/jumpstart-foundation-models/text-generation-falcon.md)을 참조하십시오.

```python
endpoint_name = "<SAGEMAKER_ENDPOINT_NAME>"  # SageMaker 엔드포인트 이름으로 교체하십시오
region = "<REGION>"  # SageMaker 엔드포인트 지역으로 교체하십시오
```

```python
import json

from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps({"text_inputs": prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json["generated_texts"][0]


content_handler = ContentHandler()

template = """From the following 'Document', precisely answer the 'Question'. Do not add any spurious information in your answer.

Document: John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
Question: {question}
Answer:
"""

# 입력 텍스트를 위한 프롬프트 템플릿

llm_prompt = PromptTemplate.from_template(template)

llm = SagemakerEndpoint(
    endpoint_name=endpoint_name,
    region_name=region,
    model_kwargs={
        "temperature": 0.95,
        "max_length": 200,
        "num_return_sequences": 3,
        "top_k": 50,
        "top_p": 0.95,
        "do_sample": True,
    },
    content_handler=content_handler,
)
```

구성을 생성하고 Amazon Comprehend 모더레이션 체인을 초기화합니다.

```python
# 필터 구성 정의

pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

# 위의 필터 구성을 사용하여 다른 모더레이션 구성 정의

moderation_config_1 = BaseModerationConfig(filters=[pii_config, toxicity_config])

moderation_config_2 = BaseModerationConfig(filters=[pii_config])

# 콜백이 있는 입력 프롬프트 모더레이션 체인

amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# 콜백이 없는 LLM 모더레이션 체인 출력

amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

이제 `moderation_config`는 점수 임계값 0.5 또는 50% 이상인 유해 단어 또는 문장, 나쁜 의도 또는 SSN 이외의 PII 엔티티가 포함된 입력과 모델 출력을 차단합니다. PII 엔티티 - SSN을 찾으면 호출이 진행되기 전에 이를 수정합니다.

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {"question": "What is John Doe's address, phone number and SSN?"}
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```