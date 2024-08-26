---
translated: true
---

# 타이탄 이륙

`TitanML`은 교육, 압축 및 추론 최적화 플랫폼을 통해 더 나은, 더 작은, 더 저렴하고 더 빠른 NLP 모델을 구축하고 배포할 수 있도록 지원합니다.

우리의 추론 서버인 [Titan Takeoff](https://docs.titanml.co/docs/intro)를 통해 단일 명령으로 하드웨어에 LLM을 로컬로 배포할 수 있습니다. 대부분의 임베딩 모델은 기본적으로 지원되며, 특정 모델에 문제가 있는 경우 hello@titanml.co로 문의해 주시기 바랍니다.

## 사용 예시

Titan Takeoff 서버를 백그라운드에서 실행한 후 이러한 명령을 실행할 수 있습니다. 자세한 내용은 [Takeoff 실행 페이지](https://docs.titanml.co/docs/Docs/launching/)를 참조하세요.

```python
import time

from langchain_community.embeddings import TitanTakeoffEmbed
```

### 예시 1

Takeoff가 기본 포트(localhost:3000)에서 실행 중이라고 가정한 기본 사용법입니다.

```python
embed = TitanTakeoffEmbed()
output = embed.embed_query(
    "What is the weather in London in August?", consumer_group="embed"
)
print(output)
```

### 예시 2

TitanTakeoffEmbed Python Wrapper를 사용하여 리더를 시작합니다. Takeoff를 처음 실행할 때 리더를 만들지 않았거나 다른 리더를 추가하려는 경우 TitanTakeoffEmbed 객체를 초기화할 때 `models` 매개변수로 시작할 모델 목록을 전달할 수 있습니다.

`embed.query_documents`를 사용하여 여러 문서를 한 번에 임베딩할 수 있습니다. 예상 입력은 단일 문자열이 아닌 문자열 목록입니다.

```python
# Model config for the embedding model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
embedding_model = {
    "model_name": "BAAI/bge-large-en-v1.5",
    "device": "cpu",
    "consumer_group": "embed",
}
embed = TitanTakeoffEmbed(models=[embedding_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
# We specified "embed" consumer group so need to send request to the same consumer group so it hits our embedding model and not others
output = embed.embed_query(prompt, consumer_group="embed")
print(output)
```
