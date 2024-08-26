---
translated: true
---

# LangSmith Chat Datasets

이 노트북은 LangSmith 채팅 데이터셋을 로드하고 해당 데이터셋으로 모델을 미세 조정하는 간단한 방법을 보여줍니다.
과정은 간단하며 다음 3단계로 구성됩니다.

1. 채팅 데이터셋 생성.
2. LangSmithDatasetChatLoader를 사용하여 예제를 로드합니다.
3. 모델을 미세 조정합니다.

그런 다음 미세 조정된 모델을 LangChain 앱에서 사용할 수 있습니다.

먼저 필요한 항목을 설치해보겠습니다.

## 필수 조건

langchain >= 0.0.311을 설치하고 LangSmith API 키로 환경을 설정해야 합니다.

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
import os
import uuid

uid = uuid.uuid4().hex[:6]
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "YOUR API KEY"
```

## 1. 데이터셋 선택

이 노트북은 미세 조정할 런을 선택하여 모델을 직접 미세 조정합니다. 종종 추적된 실행에서 이를 큐레이션합니다. LangSmith 데이터셋에 대한 자세한 내용은 [docs](https://docs.smith.langchain.com/evaluation/concepts#datasets)에서 확인할 수 있습니다.

이 튜토리얼을 위해 여기서 사용할 수 있는 기존 데이터셋을 업로드하겠습니다.

```python
from langsmith.client import Client

client = Client()
```

```python
import requests

url = "https://raw.githubusercontent.com/langchain-ai/langchain/master/docs/docs/integrations/chat_loaders/example_data/langsmith_chat_dataset.json"
response = requests.get(url)
response.raise_for_status()
data = response.json()
```

```python
dataset_name = f"Extraction Fine-tuning Dataset {uid}"
ds = client.create_dataset(dataset_name=dataset_name, data_type="chat")
```

```python
_ = client.create_examples(
    inputs=[e["inputs"] for e in data],
    outputs=[e["outputs"] for e in data],
    dataset_id=ds.id,
)
```

## 2. 데이터 준비

이제 LangSmithRunChatLoader의 인스턴스를 생성하고 lazy_load() 메서드를 사용하여 채팅 세션을 로드할 수 있습니다.

```python
from langchain_community.chat_loaders.langsmith import LangSmithDatasetChatLoader

loader = LangSmithDatasetChatLoader(dataset_name=dataset_name)

chat_sessions = loader.lazy_load()
```

#### 로드된 채팅 세션을 미세 조정에 적합한 형식으로 변환합니다.

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning

training_data = convert_messages_for_finetuning(chat_sessions)
```

## 3. 모델 미세 조정

이제 OpenAI 라이브러리를 사용하여 미세 조정 프로세스를 시작합니다.

```python
import json
import time
from io import BytesIO

import openai

my_file = BytesIO()
for dialog in training_data:
    my_file.write((json.dumps({"messages": dialog}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)

# 미세 조정이 완료될 때까지 대기합니다(시간이 걸릴 수 있습니다).

status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.fine_tuning.jobs.retrieve(job.id).status

# 이제 모델이 미세 조정되었습니다!

```

```output
Status=[running]... 429.55s. 46.34s
```

## 4. LangChain에서 사용

미세 조정 후, 결과 모델 ID를 LangChain 앱의 ChatOpenAI 모델 클래스에서 사용할 수 있습니다.

```python
# 미세 조정된 모델 ID 가져오기

job = openai.fine_tuning.jobs.retrieve(job.id)
model_id = job.fine_tuned_model

# LangChain에서 미세 조정된 모델 사용

from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=model_id,
    temperature=1,
)
```

```python
model.invoke("There were three ravens sat on a tree.")
```

```output
AIMessage(content='[{"s": "There were three ravens", "object": "tree", "relation": "sat on"}, {"s": "three ravens", "object": "a tree", "relation": "sat on"}]')
```

이제 LangSmith LLM 실행 데이터로 모델을 성공적으로 미세 조정했습니다!