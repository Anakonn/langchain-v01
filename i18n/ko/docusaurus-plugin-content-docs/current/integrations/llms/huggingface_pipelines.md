---
translated: true
---

# Hugging Face 로컬 파이프라인

Hugging Face 모델은 `HuggingFacePipeline` 클래스를 통해 로컬에서 실행할 수 있습니다.

[Hugging Face Model Hub](https://huggingface.co/models)에는 12만 개 이상의 모델, 2만 개 이상의 데이터셋, 5만 개 이상의 데모 앱(Spaces)이 호스팅되어 있으며, 이는 모두 오픈 소스이자 공개적으로 사용 가능한 온라인 플랫폼에서 사람들이 ML을 쉽게 협업하고 구축할 수 있습니다.

이러한 모델은 LangChain에서 이 로컬 파이프라인 래퍼를 통해 또는 HuggingFaceHub 클래스를 통해 호스팅된 추론 엔드포인트를 호출하여 사용할 수 있습니다.

사용하려면 `transformers` Python [패키지](https://pypi.org/project/transformers/)와 [PyTorch](https://pytorch.org/get-started/locally/)가 설치되어 있어야 합니다. 또한 `xformer`를 설치하면 메모리 효율적인 attention 구현을 사용할 수 있습니다.

```python
%pip install --upgrade --quiet  transformers --quiet
```

### 모델 로드

모델은 `from_model_id` 메서드를 사용하여 모델 매개변수를 지정하여 로드할 수 있습니다.

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

hf = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    pipeline_kwargs={"max_new_tokens": 10},
)
```

또한 기존 `transformers` 파이프라인을 직접 전달하여 로드할 수 있습니다.

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

model_id = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10)
hf = HuggingFacePipeline(pipeline=pipe)
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

### GPU 추론

GPU가 있는 시스템에서 실행할 때 `device=n` 매개변수를 지정하여 모델을 지정된 디바이스에 배치할 수 있습니다. 기본값은 CPU 추론을 위한 `-1`입니다.

여러 GPU가 있거나 모델이 단일 GPU에 너무 큰 경우 `device_map="auto"`를 지정할 수 있으며, 이 경우 [Accelerate](https://huggingface.co/docs/accelerate/index) 라이브러리를 사용하여 모델 가중치를 자동으로 로드하는 방법을 결정합니다.

*참고*: `device`와 `device_map`은 함께 지정되어서는 안 되며, 예기치 않은 동작이 발생할 수 있습니다.

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    device=0,  # replace with device_map="auto" to use the accelerate library.
    pipeline_kwargs={"max_new_tokens": 10},
)

gpu_chain = prompt | gpu_llm

question = "What is electroencephalography?"

print(gpu_chain.invoke({"question": question}))
```

### 배치 GPU 추론

GPU가 있는 디바이스에서 실행할 때 배치 모드로 GPU 추론을 실행할 수도 있습니다.

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="bigscience/bloom-1b7",
    task="text-generation",
    device=0,  # -1 for CPU
    batch_size=2,  # adjust as needed based on GPU map and model size.
    model_kwargs={"temperature": 0, "max_length": 64},
)

gpu_chain = prompt | gpu_llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = gpu_chain.batch(questions)
for answer in answers:
    print(answer)
```

### OpenVINO 백엔드를 사용한 추론

OpenVINO로 모델을 배포하려면 `backend="openvino"` 매개변수를 지정하여 OpenVINO를 백엔드 추론 프레임워크로 사용할 수 있습니다.

Intel GPU가 있는 경우 `model_kwargs={"device": "GPU"}`를 지정하여 GPU에서 추론을 실행할 수 있습니다.

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

```python
ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

### 로컬 OpenVINO 모델로 추론

[CLI를 사용하여 모델을 OpenVINO IR 형식으로 내보내기](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export)가 가능하며, 로컬 폴더에서 모델을 로드할 수 있습니다.

```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

추론 대기 시간과 모델 크기를 줄이기 위해 `--weight-format`을 사용하여 8비트 또는 4비트 가중치 양자화를 적용하는 것이 좋습니다.

```python
!optimum-cli export openvino --model gpt2  --weight-format int8 ov_model_dir # for 8-bit quantization

!optimum-cli export openvino --model gpt2  --weight-format int4 ov_model_dir # for 4-bit quantization
```

```python
ov_llm = HuggingFacePipeline.from_model_id(
    model_id="ov_model_dir",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

활성화 및 KV-cache 양자화의 동적 양자화를 통해 추가적인 추론 속도 향상을 얻을 수 있습니다. 이러한 옵션은 `ov_config`를 통해 활성화할 수 있습니다.

```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

자세한 내용은 [OpenVINO LLM 가이드](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)와 [OpenVINO 로컬 파이프라인 노트북](/docs/integrations/llms/openvino/)을 참조하세요.
