---
translated: true
---

# Intel 가중치 전용 양자화

## Huggingface 모델의 Intel Extension for Transformers Pipelines를 이용한 가중치 전용 양자화

Hugging Face 모델은 `WeightOnlyQuantPipeline` 클래스를 통해 가중치 전용 양자화로 로컬에서 실행할 수 있습니다.

[Hugging Face Model Hub](https://huggingface.co/models)에는 120,000개 이상의 모델, 20,000개 이상의 데이터셋, 50,000개 이상의 데모 앱(Spaces)이 오픈 소스로 공개되어 있어, 사람들이 ML을 쉽게 협업하고 구축할 수 있습니다.

이러한 모델들은 이 로컬 파이프라인 래퍼 클래스를 통해 LangChain에서 호출할 수 있습니다.

사용하려면 `transformers` Python [패키지](https://pypi.org/project/transformers/), [pytorch](https://pytorch.org/get-started/locally/), [intel-extension-for-transformers](https://github.com/intel/intel-extension-for-transformers)가 설치되어 있어야 합니다.

```python
%pip install transformers --quiet
%pip install intel-extension-for-transformers
```

### 모델 로드

`from_model_id` 메서드를 사용하여 모델 매개변수를 지정하여 모델을 로드할 수 있습니다. 모델 매개변수에는 `intel_extension_for_transformers`의 `WeightOnlyQuantConfig` 클래스가 포함됩니다.

```python
from intel_extension_for_transformers.transformers import WeightOnlyQuantConfig
from langchain_community.llms.weight_only_quantization import WeightOnlyQuantPipeline

conf = WeightOnlyQuantConfig(weight_dtype="nf4")
hf = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)
```

또한 기존 `transformers` 파이프라인을 직접 전달하여 로드할 수도 있습니다.

```python
from intel_extension_for_transformers.transformers import AutoModelForSeq2SeqLM
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoTokenizer, pipeline

model_id = "google/flan-t5-large"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
pipe = pipeline(
    "text2text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10
)
hf = WeightOnlyQuantPipeline(pipeline=pipe)
```

### 체인 생성

메모리에 모델이 로드되면 프롬프트와 결합하여 체인을 구성할 수 있습니다.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### CPU 추론

현재 intel-extension-for-transformers는 CPU 장치 추론만 지원합니다. 곧 intel GPU도 지원할 예정입니다. CPU 장치에서 실행할 때는 `device="cpu"` 또는 `device=-1` 매개변수를 지정할 수 있습니다.
기본값은 CPU 추론을 위한 `-1`입니다.

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### 배치 CPU 추론

CPU에서 배치 모드로 추론을 실행할 수도 있습니다.

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

chain = prompt | llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = chain.batch(questions)
for answer in answers:
    print(answer)
```

### Intel-extension-for-transformers에서 지원하는 데이터 유형

다음과 같은 데이터 유형으로 가중치를 양자화할 수 있습니다(WeightOnlyQuantConfig의 weight_dtype):

* **int8**: 8비트 데이터 유형을 사용합니다.
* **int4_fullrange**: 일반 int4 범위(-7~7)와 비교하여 int4 범위의 -8 값을 사용합니다.
* **int4_clip**: int4 범위 내로 클리핑하고 나머지는 0으로 설정합니다.
* **nf4**: 정규화된 float 4비트 데이터 유형을 사용합니다.
* **fp4_e2m1**: 일반 float 4비트 데이터 유형을 사용합니다. "e2"는 2비트가 지수에 사용되고, "m1"은 1비트가 가수에 사용됨을 의미합니다.

이러한 기술은 가중치를 4비트 또는 8비트로 저장하지만, 계산은 float32, bfloat16 또는 int8(WeightOnlyQuantConfig의 compute_dtype)로 수행됩니다:
* **fp32**: float32 데이터 유형을 사용하여 계산합니다.
* **bf16**: bfloat16 데이터 유형을 사용하여 계산합니다.
* **int8**: 8비트 데이터 유형을 사용하여 계산합니다.

### 지원되는 알고리즘 매트릭스

intel-extension-for-transformers에서 지원되는 양자화 알고리즘(WeightOnlyQuantConfig의 algorithm):

| 알고리즘 |   PyTorch  |    LLM Runtime    |
|:--------------:|:----------:|:----------:|
|       RTN      |  &#10004;  |  &#10004;  |
|       AWQ      |  &#10004;  | 곧 지원 예정 |
|      TEQ      | &#10004; | 곧 지원 예정 |
> **RTN:** 매우 직관적으로 생각할 수 있는 양자화 방법입니다. 추가 데이터셋이 필요하지 않으며 매우 빠른 양자화 방법입니다. 일반적으로 RTN은 가중치를 균일하게 분포된 정수 데이터 유형으로 변환하지만, Qlora와 같은 일부 알고리즘은 비균일 NF4 데이터 유형을 제안하고 이론적 최적성을 입증했습니다.

> **AWQ:** 중요한 가중치의 1%만 보호해도 양자화 오류를 크게 줄일 수 있다는 것이 증명되었습니다. 중요한 가중치 채널은 활성화 및 가중치 분포를 관찰하여 선택됩니다. 중요한 가중치는 양자화 전에 큰 스케일 팩터를 곱하여 보존됩니다.

> **TEQ:** 가중치 전용 양자화에서 FP32 정밀도를 유지하는 학습 가능한 등가 변환입니다. AWQ에서 영감을 받았지만 활성화와 가중치 간의 최적의 채널별 스케일 팩터를 검색하는 새로운 솔루션을 제공합니다.
