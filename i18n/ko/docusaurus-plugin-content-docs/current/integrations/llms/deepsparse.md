---
translated: true
---

# 딥스파스

이 페이지에서는 LangChain 내에서 [DeepSparse](https://github.com/neuralmagic/deepsparse) 추론 런타임을 사용하는 방법을 다룹니다.
두 부분으로 나뉘어 있습니다: 설치 및 설정, 그리고 DeepSparse 사용 예제.

## 설치 및 설정

- `pip install deepsparse`로 Python 패키지를 설치하세요
- [SparseZoo 모델](https://sparsezoo.neuralmagic.com/?useCase=text_generation) 중 하나를 선택하거나 [Optimum을 사용하여](https://github.com/neuralmagic/notebooks/blob/main/notebooks/opt-text-generation-deepsparse-quickstart/OPT_Text_Generation_DeepSparse_Quickstart.md) 지원되는 모델을 ONNX로 내보내세요

DeepSparse LLM 래퍼가 있어 모든 모델에 대한 통일된 인터페이스를 제공합니다:

```python
from langchain_community.llms import DeepSparse

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none"
)

print(llm.invoke("def fib():"))
```

추가 매개변수는 `config` 매개변수를 사용하여 전달할 수 있습니다:

```python
config = {"max_generated_tokens": 256}

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none",
    config=config,
)
```
