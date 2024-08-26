---
translated: true
---

# Twitter (via Apify)

이 노트북은 Apify를 이용하여 Twitter에서 채팅 메시지를 로드하여 미세 조정하는 방법을 보여줍니다.

먼저 Apify를 사용하여 트윗을 내보냅니다. 예시를 들어보겠습니다.

## 데이터 로드

Apify를 사용하여 트윗 데이터를 JSON 형식으로 내보낸 후, 이를 불러옵니다.

```python
import json

from langchain_community.adapters.openai import convert_message_to_dict
from langchain_core.messages import AIMessage
```

```python
# JSON 파일을 불러옵니다.

with open("example_data/dataset_twitter-scraper_2023-08-23_22-13-19-740.json") as f:
    data = json.load(f)
```

## 데이터 필터링 및 메시지 변환

트윗 중 다른 트윗을 참조하는 트윗은 제외합니다. 이는 약간 이상할 수 있기 때문입니다. 그런 다음 이를 AI 메시지로 변환합니다.

```python
# 다른 트윗을 참조하는 트윗을 필터링합니다.

tweets = [d["full_text"] for d in data if "t.co" not in d["full_text"]]
# 이를 AI 메시지로 생성합니다.

messages = [AIMessage(content=t) for t in tweets]
```

## 시스템 메시지 추가

시작 부분에 시스템 메시지를 추가합니다. 트윗의 주제를 추출하여 시스템 메시지에 넣을 수 있습니다.

```python
# 시스템 메시지를 추가합니다.

system_message = {"role": "system", "content": "write a tweet"}
# 데이터를 시스템 메시지와 변환된 메시지로 구성합니다.

data = [[system_message, convert_message_to_dict(m)] for m in messages]
```

이제 Twitter 데이터를 LangChain 형식으로 변환하였습니다. 이를 사용하여 미세 조정 작업을 수행할 수 있습니다.