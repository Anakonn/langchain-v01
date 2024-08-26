---
translated: true
---

# 타이탄 이륙

`TitanML`은 교육, 압축 및 추론 최적화 플랫폼을 통해 더 나은, 더 작은, 더 저렴하고 더 빠른 NLP 모델을 구축하고 배포할 수 있도록 지원합니다.

우리의 추론 서버인 [Titan Takeoff](https://docs.titanml.co/docs/intro)를 통해 단일 명령으로 하드웨어에 LLM을 로컬로 배포할 수 있습니다. Falcon, Llama 2, GPT2, T5 등 대부분의 생성 모델 아키텍처가 지원됩니다. 특정 모델에 문제가 있는 경우 hello@titanml.co로 문의해 주시기 바랍니다.

## 사용 예시

Titan Takeoff 서버를 백그라운드에서 실행한 후 이러한 명령을 실행하면 시작할 수 있습니다. 자세한 내용은 [Takeoff 실행 페이지](https://docs.titanml.co/docs/Docs/launching/)를 참조하세요.

```python
import time

from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# Note importing TitanTakeoffPro instead of TitanTakeoff will work as well both use same object under the hood
from langchain_community.llms import TitanTakeoff
from langchain_core.prompts import PromptTemplate
```

### 예시 1

Takeoff가 기본 포트(localhost:3000)로 실행 중이라고 가정한 기본 사용법입니다.

```python
llm = TitanTakeoff()
output = llm.invoke("What is the weather in London in August?")
print(output)
```

### 예시 2

포트와 기타 생성 매개변수를 지정하는 경우

```python
llm = TitanTakeoff(port=3000)
# A comprehensive list of parameters can be found at https://docs.titanml.co/docs/next/apis/Takeoff%20inference_REST_API/generate#request
output = llm.invoke(
    "What is the largest rainforest in the world?",
    consumer_group="primary",
    min_new_tokens=128,
    max_new_tokens=512,
    no_repeat_ngram_size=2,
    sampling_topk=1,
    sampling_topp=1.0,
    sampling_temperature=1.0,
    repetition_penalty=1.0,
    regex_string="",
    json_schema=None,
)
print(output)
```

### 예시 3

여러 입력에 대해 generate 사용하기

```python
llm = TitanTakeoff()
rich_output = llm.generate(["What is Deep Learning?", "What is Machine Learning?"])
print(rich_output.generations)
```

### 예시 4

출력 스트리밍

```python
llm = TitanTakeoff(
    streaming=True, callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
prompt = "What is the capital of France?"
output = llm.invoke(prompt)
print(output)
```

### 예시 5

LCEL 사용하기

```python
llm = TitanTakeoff()
prompt = PromptTemplate.from_template("Tell me about {topic}")
chain = prompt | llm
output = chain.invoke({"topic": "the universe"})
print(output)
```

### 예시 6

TitanTakeoff Python Wrapper를 사용하여 리더 시작하기. Takeoff를 처음 실행할 때 리더를 만들지 않았거나 다른 리더를 추가하려는 경우 TitanTakeoff 객체를 초기화할 때 `models` 매개변수로 모델 구성 목록을 전달할 수 있습니다.

```python
# Model config for the llama model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
#   tensor_parallel (Optional[int]): The number of gpus you would like your model to be split across
#   max_seq_length (int): The maximum sequence length to use for inference, defaults to 512
#   max_batch_size (int_: The max batch size for continuous batching of requests
llama_model = {
    "model_name": "TheBloke/Llama-2-7b-Chat-AWQ",
    "device": "cuda",
    "consumer_group": "llama",
}
llm = TitanTakeoff(models=[llama_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
output = llm.invoke(prompt, consumer_group="llama")
print(output)
```
