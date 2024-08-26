---
translated: true
---

# MLX 로컬 파이프라인

MLX 모델은 `MLXPipeline` 클래스를 통해 로컬에서 실행할 수 있습니다.

[MLX 커뮤니티](https://huggingface.co/mlx-community)에는 150개 이상의 모델이 있으며, 이 모두는 오픈 소스이자 Hugging Face Model Hub라는 온라인 플랫폼에서 공개적으로 사용할 수 있습니다.

이러한 모델은 이 로컬 파이프라인 래퍼를 통해 LangChain에서 호출하거나 MlXPipeline 클래스를 통해 호스팅된 추론 엔드포인트를 호출하여 사용할 수 있습니다. MLX에 대한 자세한 내용은 [examples repo](https://github.com/ml-explore/mlx-examples/tree/main/llms) 노트북을 참조하세요.

사용하려면 ``mlx-lm`` Python [패키지](https://pypi.org/project/mlx-lm/)와 [transformers](https://pypi.org/project/transformers/)가 설치되어 있어야 합니다. `huggingface_hub`도 설치할 수 있습니다.

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

### 모델 로드

`from_model_id` 메서드를 사용하여 모델 매개변수를 지정하여 모델을 로드할 수 있습니다.

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

pipe = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

또한 기존 `transformers` 파이프라인을 직접 전달하여 로드할 수도 있습니다.

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from mlx_lm import load

model, tokenizer = load("mlx-community/quantized-gemma-2b-it")
pipe = MLXPipeline(model=model, tokenizer=tokenizer)
```

### 체인 생성

메모리에 모델이 로드되면 프롬프트와 결합하여 체인을 구성할 수 있습니다.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | pipe

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```
