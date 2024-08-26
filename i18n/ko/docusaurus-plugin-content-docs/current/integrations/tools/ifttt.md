---
translated: true
---

# IFTTT 웹후크

이 노트북은 IFTTT 웹후크를 사용하는 방법을 보여줍니다.

https://github.com/SidU/teams-langchain-js/wiki/Connecting-IFTTT-Services에서 가져왔습니다.

## 웹후크 만들기

- https://ifttt.com/create로 이동합니다.

## "If This" 구성하기

- IFTTT 인터페이스에서 "If This" 버튼을 클릭합니다.
- 검색창에 "Webhooks"를 입력합니다.
- "JSON 페이로드로 웹 요청 받기" 옵션을 선택합니다.
- 연결할 서비스에 맞는 고유한 이벤트 이름을 선택합니다.
이렇게 하면 웹후크 URL을 관리하기 쉬워집니다.
예를 들어 Spotify에 연결하는 경우 "Spotify"를 이벤트 이름으로 사용할 수 있습니다.
- "Create Trigger" 버튼을 클릭하여 설정을 저장하고 웹후크를 생성합니다.

## "Then That" 구성하기

- IFTTT 인터페이스에서 "Then That" 버튼을 클릭합니다.
- 연결할 서비스(예: Spotify)를 검색합니다.
- 서비스의 작업(예: "재생목록에 트랙 추가")을 선택합니다.
- 필요한 세부 정보(예: 재생목록 이름 "AI에서 온 노래")를 입력하여 작업을 구성합니다.
- 웹후크에서 받은 JSON 페이로드를 작업에 참조합니다. Spotify 시나리오에서는 검색 쿼리로 "{{JsonPayload}}"를 선택합니다.
- "Create Action" 버튼을 눌러 작업 설정을 저장합니다.
- 작업 구성을 완료하면 "Finish" 버튼을 클릭하여 설정을 완료합니다.
- 축하합니다! 웹후크를 원하는 서비스에 연결했으며, 데이터를 받고 작업을 트리거할 준비가 되었습니다 🎉

## 마무리

- 웹후크 URL을 얻으려면 https://ifttt.com/maker_webhooks/settings로 이동합니다.
- 거기에서 IFTTT 키 값을 복사합니다. URL은 https://maker.ifttt.com/use/YOUR_IFTTT_KEY 형식입니다. YOUR_IFTTT_KEY 값을 가져옵니다.

```python
from langchain_community.tools.ifttt import IFTTTWebhook
```

```python
import os

key = os.environ["IFTTTKey"]
url = f"https://maker.ifttt.com/trigger/spotify/json/with/key/{key}"
tool = IFTTTWebhook(
    name="Spotify", description="Add a song to spotify playlist", url=url
)
```

```python
tool.run("taylor swift")
```

```output
"Congratulations! You've fired the spotify JSON event"
```
