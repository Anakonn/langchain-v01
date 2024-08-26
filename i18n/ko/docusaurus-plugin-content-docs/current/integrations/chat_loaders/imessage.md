---
translated: true
---

# iMessage

이 노트북은 iMessage 채팅 로더를 사용하는 방법을 보여줍니다. 이 클래스는 iMessage 대화를 LangChain 채팅 메시지로 변환하는 데 도움이 됩니다.

macOS에서 iMessage는 대화를 `~/Library/Messages/chat.db` 경로의 SQLite 데이터베이스에 저장합니다(최소한 macOS Ventura 13.4의 경우). `IMessageChatLoader`는 이 데이터베이스 파일에서 로드합니다.

1. `IMessageChatLoader`를 파일 경로를 `chat.db` 데이터베이스로 지정하여 생성합니다.
2. `loader.load()`(또는 `loader.lazy_load()`)를 호출하여 변환을 수행합니다. 선택적으로 `merge_chat_runs`를 사용하여 동일한 발신자의 메시지를 순차적으로 결합하거나 `map_ai_messages`를 사용하여 지정된 발신자의 메시지를 "AIMessage" 클래스로 변환할 수 있습니다.

## 1. 채팅 DB 액세스

터미널이 `~/Library/Messages`에 액세스할 수 없을 가능성이 큽니다. 이 클래스를 사용하려면 DB를 액세스 가능한 디렉토리(예: Documents)로 복사한 다음 거기서 로드할 수 있습니다. 대안으로 (권장하지 않음) 터미널 에뮬레이터에 대해 시스템 설정 > 보안 및 개인 정보 보호 > 전체 디스크 액세스에서 전체 디스크 액세스를 부여할 수 있습니다.

예제 데이터베이스를 [이 Google 드라이브 파일](https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing)에서 다운로드할 수 있습니다.

```python
# 이 예제 데이터 사용

import requests

def download_drive_file(url: str, output_path: str = "chat.db") -> None:
    file_id = url.split("/")[-2]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = requests.get(download_url)
    if response.status_code != 200:
        print("파일 다운로드 실패.")
        return

    with open(output_path, "wb") as file:
        file.write(response.content)
        print(f"파일 {output_path} 다운로드 완료.")

url = (
    "https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing"
)

# chat.db로 파일 다운로드

download_drive_file(url)
```

```output
파일 chat.db 다운로드 완료.
```

## 2. 채팅 로더 생성

로더에 zip 디렉토리 경로를 제공합니다. 선택적으로 AI 메시지로 매핑되는 사용자 ID를 지정하고 메시지 실행을 병합할지 여부를 구성할 수 있습니다.

```python
from langchain_community.chat_loaders.imessage import IMessageChatLoader
```

```python
loader = IMessageChatLoader(
    path="./chat.db",
)
```

## 3. 메시지 로드

`load()`(또는 `lazy_load`) 메서드는 로드된 대화 당 메시지 목록만 포함하는 "ChatSessions" 목록을 반환합니다. 모든 메시지는 처음에 "HumanMessage" 객체로 매핑됩니다.

메시지 "실행"(동일한 발신자의 연속 메시지)을 병합하고 "AI"를 나타내는 발신자를 선택할 수 있습니다. 미세 조정된 LLM은 이러한 AI 메시지를 생성하도록 학습됩니다.

```python
from typing import List
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# 동일한 발신자의 연속 메시지를 단일 메시지로 병합

merged_messages = merge_chat_runs(raw_messages)
# "Tortoise"의 메시지를 AI 메시지로 변환합니다. 이 대화가 누구 사이에서 이루어졌는지 추측할 수 있습니까?

chat_sessions: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Tortoise")
)
```

```python
# 이제 모든 Tortoise의 메시지는 AI 메시지 클래스로 매핑됩니다.

# 이는 OpenAI의 학습 형식에서 'assistant' 역할에 매핑됩니다.

chat_sessions[0]["messages"][:3]
```

```output
[AIMessage(content="Slow and steady, that's my motto.", additional_kwargs={'message_time': 1693182723, 'sender': 'Tortoise'}, example=False),
 HumanMessage(content='Speed is key!', additional_kwargs={'message_time': 1693182753, 'sender': 'Hare'}, example=False),
 AIMessage(content='A balanced approach is more reliable.', additional_kwargs={'message_time': 1693182783, 'sender': 'Tortoise'}, example=False)]
```

## 4. 미세 조정을 위한 준비

이제 채팅 메시지를 OpenAI 사전 처리 형식으로 변환할 시간입니다. `convert_messages_for_finetuning` 유틸리티를 사용하여 이를 수행할 수 있습니다.

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning
```

```python
training_data = convert_messages_for_finetuning(chat_sessions)
print(f"학습을 위해 {len(training_data)}개의 대화 준비 완료")
```

```output
학습을 위해 10개의 대화 준비 완료
```

## 5. 모델 미세 조정

모델을 미세 조정할 시간입니다. `openai`가 설치되어 있고 `OPENAI_API_KEY`가 적절하게 설정되어 있는지 확인하세요.

```python
%pip install --upgrade --quiet langchain-openai
```

```python
import json
import time
from io import BytesIO
import openai

# jsonl 파일을 메모리에 작성합니다.

my_file = BytesIO()
for m in training_data:
    my_file.write((json.dumps({"messages": m}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

# OpenAI는 각 학습 파일을 준수 이유로 감사합니다.

# 몇 분 정도 걸릴 수 있습니다.

status = openai.files.retrieve(training_file.id).status
start_time = time.time()
while status != "processed":
    print(f"상태=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.files.retrieve(training_file.id).status
print(f"파일 {training_file.id}이(가) {time.time() - start_time:.2f} 초 후에 준비되었습니다.")
```

```output
파일 file-zHIgf4r8LltZG3RFpkGd4Sjf이(가) 10.19 초 후에 준비되었습니다.
```

파일이 준비되면 학습 작업을 시작할 시간입니다.

```python
job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)
```

모델이 준비되는 동안 차 한 잔을 마시며 기다리세요. 시간이 좀 걸릴 수 있습니다!

```python
status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"상태=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    job = openai.fine_tuning.jobs.retrieve(job.id)
    status = job.status
```

```output
상태=[running]... 524.95s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::7sKoRdlz
```

## 6. LangChain에서 사용

결과 모델 ID를 `ChatOpenAI` 모델 클래스에 직접 사용할 수 있습니다.

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=job.fine_tuned_model,
    temperature=1,
)
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are speaking to hare."),
        ("human", "{input}"),
    ]
)

chain = prompt | model | StrOutputParser()
```

```python
for tok in chain.stream({"input": "What's the golden thread?"}):
    print(tok, end="", flush=True)
```

```output
A symbol of interconnectedness.
```