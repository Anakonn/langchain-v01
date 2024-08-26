---
translated: true
---

# IPEX-LLM

> [IPEX-LLM](https://github.com/intel-analytics/ipex-llm/)은 Intel CPU와 GPU(예: iGPU가 있는 로컬 PC, Arc, Flex 및 Max와 같은 개별 GPU)에서 매우 낮은 지연 시간으로 LLM을 실행하기 위한 PyTorch 라이브러리입니다.

이 예제에서는 `ipex-llm`과 상호 작용하여 텍스트 생성을 수행하는 방법을 설명합니다.

## 설정

```python
# Update Langchain

%pip install -qU langchain langchain-community
```

Intel CPU에서 LLM을 실행하기 위해 IEPX-LLM을 설치합니다.

```python
%pip install --pre --upgrade ipex-llm[all]
```

## 기본 사용법

```python
import warnings

from langchain.chains import LLMChain
from langchain_community.llms import IpexLLM
from langchain_core.prompts import PromptTemplate

warnings.filterwarnings("ignore", category=UserWarning, message=".*padding_mask.*")
```

모델에 대한 프롬프트 템플릿을 지정합니다. 이 예에서는 [vicuna-1.5](https://huggingface.co/lmsys/vicuna-7b-v1.5) 모델을 사용합니다. 다른 모델을 사용하는 경우 적절한 템플릿을 선택하십시오.

```python
template = "USER: {question}\nASSISTANT:"
prompt = PromptTemplate(template=template, input_variables=["question"])
```

`IpexLLM.from_model_id`를 사용하여 로컬에서 모델을 로드합니다. 이렇게 하면 모델이 Hugging Face 형식으로 직접 로드되고 추론을 위해 자동으로 저비트 형식으로 변환됩니다.

```python
llm = IpexLLM.from_model_id(
    model_id="lmsys/vicuna-7b-v1.5",
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

Chains에서 사용합니다:

```python
llm_chain = prompt | llm

question = "What is AI?"
output = llm_chain.invoke(question)
```

## 저비트 모델 저장/로드

또한 저비트 모델을 디스크에 저장한 다음 `from_model_id_low_bit`를 사용하여 나중에 다시 로드할 수 있습니다 - 심지어 다른 기계에서도 가능합니다. 이는 공간 효율적이며, 저비트 모델은 원래 모델보다 훨씬 적은 디스크 공간을 요구합니다. `from_model_id_low_bit`는 모델 변환 단계를 건너뛰므로 `from_model_id`보다 속도와 메모리 사용 면에서 더 효율적입니다.

저비트 모델을 저장하려면 다음과 같이 `save_low_bit`를 사용하십시오.

```python
saved_lowbit_model_path = "./vicuna-7b-1.5-low-bit"  # path to save low-bit model
llm.model.save_low_bit(saved_lowbit_model_path)
del llm
```

저장된 저비트 모델 경로에서 모델을 로드합니다.
> 저비트 모델에 대해 저장된 경로에는 모델 자체만 포함되고 토크나이저는 포함되지 않습니다. 모든 것을 한 곳에 가지고 있으려면 원래 모델의 디렉토리에서 토크나이저 파일을 수동으로 다운로드하거나 복사해야 합니다.

```python
llm_lowbit = IpexLLM.from_model_id_low_bit(
    model_id=saved_lowbit_model_path,
    tokenizer_id="lmsys/vicuna-7b-v1.5",
    # tokenizer_name=saved_lowbit_model_path,  # copy the tokenizers to saved path if you want to use it this way
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

로드된 모델을 Chains에서 사용합니다:

```python
llm_chain = prompt | llm_lowbit


question = "What is AI?"
output = llm_chain.invoke(question)
```
