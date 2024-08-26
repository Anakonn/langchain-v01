---
translated: true
---

# Facebook Messenger

이 노트북은 Facebook에서 데이터를 로드하여 파인 튜닝할 수 있는 형식으로 변환하는 방법을 보여줍니다. 전체 단계는 다음과 같습니다:

1. Messenger 데이터를 디스크에 다운로드합니다.
2. 채팅 로더를 생성하고 `loader.load()` (또는 `loader.lazy_load()`)를 호출하여 변환을 수행합니다.
3. 선택적으로 `merge_chat_runs`를 사용하여 같은 발신자의 메시지를 순서대로 결합하거나, `map_ai_messages`를 사용하여 지정된 발신자의 메시지를 "AIMessage" 클래스로 변환합니다. 그런 다음 `convert_messages_for_finetuning`을 호출하여 데이터를 파인 튜닝용으로 준비합니다.

이 단계를 완료하면 모델을 파인 튜닝할 수 있습니다. 이를 위해 다음 단계를 수행합니다:

4. 메시지를 OpenAI에 업로드하고 파인 튜닝 작업을 실행합니다.
5. 생성된 모델을 LangChain 앱에서 사용합니다!

시작해봅시다.

## 1. 데이터 다운로드

Messenger 데이터를 다운로드하려면 [여기](https://www.zapptales.com/en/download-facebook-messenger-chat-history-how-to/)의 지침을 따르세요. 중요한 점은 JSON 형식으로 다운로드해야 한다는 것입니다 (HTML이 아닙니다).

예제 덤프는 [이 구글 드라이브 링크](https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing)에서 호스팅되고 있으며, 이를 사용하여 설명합니다.

```python
# 예제 데이터를 사용합니다

import zipfile
import requests

def download_and_unzip(url: str, output_path: str = "file.zip") -> None:
    file_id = url.split("/")[-2]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = requests.get(download_url)
    if response.status_code != 200:
        print("파일 다운로드에 실패했습니다.")
        return

    with open(output_path, "wb") as file:
        file.write(response.content)
        print(f"파일 {output_path}이(가) 다운로드되었습니다.")

    with zipfile.ZipFile(output_path, "r") as zip_ref:
        zip_ref.extractall()
        print(f"파일 {output_path}이(가) 압축 해제되었습니다.")

# 다운로드할 파일의 URL

url = (
    "https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing"
)

# 다운로드 및 압축 해제

download_and_unzip(url)
```

```output
파일 file.zip이 다운로드되었습니다.
파일 file.zip이 압축 해제되었습니다.
```

## 2. 채팅 로더 생성

채팅 로더에는 전체 디렉토리의 채팅을 로드하는 클래스와 개별 파일을 로드하는 클래스, 두 가지 `FacebookMessengerChatLoader` 클래스가 있습니다.

```python
directory_path = "./hogwarts"
```

```python
from langchain_community.chat_loaders.facebook_messenger import (
    FolderFacebookMessengerChatLoader,
    SingleFileFacebookMessengerChatLoader,
)
```

```python
loader = SingleFileFacebookMessengerChatLoader(
    path="./hogwarts/inbox/HermioneGranger/messages_Hermione_Granger.json",
)
```

```python
chat_session = loader.load()[0]
chat_session["messages"][:3]
```

```output
[HumanMessage(content="Hi Hermione! How's your summer going so far?", additional_kwargs={'sender': 'Harry Potter'}),
 HumanMessage(content="Harry! Lovely to hear from you. My summer is going well, though I do miss everyone. I'm spending most of my time going through my books and researching fascinating new topics. How about you?", additional_kwargs={'sender': 'Hermione Granger'}),
 HumanMessage(content="I miss you all too. The Dursleys are being their usual unpleasant selves but I'm getting by. At least I can practice some spells in my room without them knowing. Let me know if you find anything good in your researching!", additional_kwargs={'sender': 'Harry Potter'})]
```

```python
loader = FolderFacebookMessengerChatLoader(
    path="./hogwarts",
)
```

```python
chat_sessions = loader.load()
len(chat_sessions)
```

```output
9
```

## 3. 파인 튜닝 준비

`load()`를 호출하면 인간 메시지로 추출할 수 있는 모든 채팅 메시지가 반환됩니다. 채팅 봇과 대화할 때 대화는 실제 대화에 비해 더 엄격한 교차 대화 패턴을 따릅니다.

메시지 "연속"을 병합하고 특정 발신자를 "AI"로 표시할 수 있습니다. 파인 튜닝된 LLM은 이러한 AI 메시지를 생성하는 법을 배우게 됩니다.

```python
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
```

```python
merged_sessions = merge_chat_runs(chat_sessions)
alternating_sessions = list(map_ai_messages(merged_sessions, "Harry Potter"))
```

```python
# 이제 Harry Potter의 모든 메시지는 AI 메시지 클래스를 사용합니다.

# 이는 OpenAI의 학습 형식에서 'assistant' 역할과 일치합니다.

alternating_sessions[0]["messages"][:3]
```

```output
[AIMessage(content="Professor Snape, I was hoping I could speak with you for a moment about something that's been concerning me lately.", additional_kwargs={'sender': 'Harry Potter'}),
 HumanMessage(content="What is it, Potter? I'm quite busy at the moment.", additional_kwargs={'sender': 'Severus Snape'}),
 AIMessage(content="I apologize for the interruption, sir. I'll be brief. I've noticed some strange activity around the school grounds at night. I saw a cloaked figure lurking near the Forbidden Forest last night. I'm worried someone may be plotting something sinister.", additional_kwargs={'sender': 'Harry Potter'})]
```

### OpenAI 형식 사전으로 변환

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning
```

```python
training_data = convert_messages_for_finetuning(alternating_sessions)
print(f"훈련을 위해 {len(training_data)} 대화를 준비했습니다")
```

```output
훈련을 위해 9 대화를 준비했습니다
```

```python
training_data[0][:3]
```

```output
[{'role': 'assistant',
  'content': "Professor Snape, I was hoping I could speak with you for a moment about something that's been concerning me lately."},
 {'role': 'user',
  'content': "What is it, Potter? I'm quite busy at the moment."},
 {'role': 'assistant',
  'content': "I apologize for the interruption, sir. I'll be brief. I've noticed some strange activity around the school grounds at night. I saw a cloaked figure lurking near the Forbidden Forest last night. I'm worried someone may be plotting something sinister."}]
```

OpenAI는 현재 파인 튜닝 작업에 최소 10개의 학습 예제를 필요로 하며, 대부분의 작업에는 50-100개를 권장합니다. 우리는 9개의 채팅 세션만 있으므로 각 학습 예제가 대화의 일부로 구성되도록 하위 세션으로 나눌 수 있습니다 (선택적으로 약간의 중복을 포함하여).

Facebook 채팅 세션(1인당 1개)은 종종 여러 날과 대화에 걸쳐 있으므로, 장기 의존성을 모델링하는 것은 그리 중요하지 않을 수 있습니다.

```python
# 채팅이 교차되고 있으므로, 각 데이터 포인트는 8개의 메시지 그룹으로 만들고,

# 2개의 메시지를 중복합니다.

chunk_size = 8
overlap = 2

training_examples = [
    conversation_messages[i : i + chunk_size]
    for conversation_messages in training_data
    for i in range(0, len(conversation_messages) - chunk_size + 1, chunk_size - overlap)
]

len(training_examples)
```

```output
100
```

## 4. 모델 파인 튜닝

모델을 파인 튜닝할 시간입니다. `openai`가 설치되어 있고 `OPENAI_API_KEY`가 적절히 설정되어 있는지 확인하세요.

```python
%pip install --upgrade --quiet langchain-openai
```

```python
import json
import time
from io import BytesIO

import openai

# 메모리에 jsonl 파일을 작성합니다.

my_file = BytesIO()
for m in training_examples:
    my_file.write((json.dumps({"messages": m}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

# OpenAI는 준수 이유로 각 학습 파일을 감사합니다.

# 몇 분이 걸릴 수 있습니다.

status = openai.files.retrieve(training_file.id).status
start_time = time.time()
while status != "processed":
    print(f"상태=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.files.retrieve(training_file.id).status
print(f"파일 {training_file.id}이(가) {time.time() - start_time:.2f} 초 후에 준비되었습니다.")
```

```output
파일 file-ULumAXLEFw3vB6bb9uy6DNVC이(가) 0.00 초 후에 준비되었습니다.
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
상태=[running]... 874.29s. 56.93s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::8QnAzWMr
```

## 5. LangChain에서 사용

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
        ("human", "{input}"),
    ]
)

chain = prompt | model | StrOutputParser()
```

```python
for tok in chain.stream({"input": "What classes are you taking?"}):
    print(tok, end="", flush=True)
```

```output
I'm taking Charms, Defense Against the Dark Arts, Herbology, Potions, Transfiguration, and Ancient Runes. How about you?
```