---
sidebar_label: Ernie Bot Chat
translated: true
---

# ErnieBotChat

[ERNIE-Bot](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11)은 Baidu에서 개발한 대형 언어 모델로, 방대한 양의 중국어 데이터를 다룹니다.
이 노트북은 ErnieBot 채팅 모델을 시작하는 방법을 설명합니다.

**사용 중단 경고**

`langchain_community.chat_models.ErnieBotChat` 대신 `langchain_community.chat_models.QianfanChatEndpoint` 사용을 권장합니다.

`QianfanChatEndpoint`에 대한 문서는 [여기](/docs/integrations/chat/baidu_qianfan_endpoint/)에서 확인할 수 있습니다.

`QianfanChatEndpoint` 사용을 권장하는 이유는 다음과 같습니다:

1. `QianfanChatEndpoint`는 Qianfan 플랫폼에서 더 많은 LLM을 지원합니다.
2. `QianfanChatEndpoint`는 스트리밍 모드를 지원합니다.
3. `QianfanChatEndpoint`는 함수 호출 사용을 지원합니다.
4. `ErnieBotChat`은 유지보수가 부족하고 사용 중단되었습니다.

마이그레이션을 위한 몇 가지 팁:

- `ernie_client_id`를 `qianfan_ak`로, `ernie_client_secret`를 `qianfan_sk`로 변경하십시오.
- `qianfan` 패키지를 설치하십시오. 예: `pip install qianfan`
- `ErnieBotChat`을 `QianfanChatEndpoint`로 변경하십시오.

```python
from langchain_community.chat_models.baidu_qianfan_endpoint import QianfanChatEndpoint

chat = QianfanChatEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## 사용법

```python
from langchain_community.chat_models import ErnieBotChat
from langchain_core.messages import HumanMessage

chat = ErnieBotChat(
    ernie_client_id="YOUR_CLIENT_ID", ernie_client_secret="YOUR_CLIENT_SECRET"
)
```

또는 환경 변수에 `client_id`와 `client_secret`을 설정할 수 있습니다.

```bash
export ERNIE_CLIENT_ID=YOUR_CLIENT_ID
export ERNIE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

```python
chat([HumanMessage(content="hello there, who are you?")])
```

```output
AIMessage(content='Hello, I am an artificial intelligence language model. My purpose is to help users answer questions or provide information. What can I do for you?', additional_kwargs={}, example=False)
```