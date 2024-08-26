---
sidebar_label: Volc Engine Maas
translated: true
---

# VolcEngineMaasChat

이 노트북은 Volc Engine Maas 채팅 모델을 시작하는 방법을 안내합니다.

## 설치

패키지를 설치합니다.

```python
%pip install --upgrade --quiet volcengine
```

## 사용법

필요한 모듈을 가져옵니다.

```python
from langchain_community.chat_models import VolcEngineMaasChat
from langchain_core.messages import HumanMessage
```

VolcEngineMaasChat 인스턴스를 생성합니다.

```python
chat = VolcEngineMaasChat(volc_engine_maas_ak="your ak", volc_engine_maas_sk="your sk")
```

또는 환경 변수에 access_key와 secret_key를 설정할 수 있습니다.

```bash
export VOLC_ACCESSKEY=YOUR_AK
export VOLC_SECRETKEY=YOUR_SK
```

채팅을 호출합니다.

```python
chat([HumanMessage(content="给我讲个笑话")])
```

```output
AIMessage(content='好的，这是一个笑话：\n\n为什么鸟儿不会玩电脑游戏？\n\n因为它们没有翅膀！')
```

## Volc Engine Maas 채팅 스트림

스트리밍 모드로 VolcEngineMaasChat 인스턴스를 생성합니다.

```python
chat = VolcEngineMaasChat(
    volc_engine_maas_ak="your ak",
    volc_engine_maas_sk="your sk",
    streaming=True,
)
```

채팅을 호출합니다.

```python
chat([HumanMessage(content="给我讲个笑话")])
```

```output
AIMessage(content='好的，这是一个笑话：\n\n三岁的女儿说她会造句了，妈妈让她用“年轻”造句，女儿说：“妈妈减肥，一年轻了好几斤”。')
```