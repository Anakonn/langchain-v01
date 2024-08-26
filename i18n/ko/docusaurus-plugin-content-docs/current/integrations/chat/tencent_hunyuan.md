---
sidebar_label: Tencent Hunyuan
translated: true
---

# Tencent Hunyuan

> [Tencent의 하이브리드 모델 API](https://cloud.tencent.com/document/product/1729) (`Hunyuan API`)
> 는 대화 커뮤니케이션, 콘텐츠 생성, 분석 및 이해를 구현하며,
> 지능형 고객 서비스, 지능형 마케팅, 역할 수행, 광고 카피 작성, 제품 설명,
> 스크립트 작성, 이력서 생성, 기사 작성, 코드 생성, 데이터 분석 및 콘텐츠
> 분석 등 다양한 시나리오에 널리 사용될 수 있습니다.

자세한 내용은 [여기](https://cloud.tencent.com/document/product/1729)를 참조하십시오.

```python
from langchain_community.chat_models import ChatHunyuan
from langchain_core.messages import HumanMessage
```

```python
chat = ChatHunyuan(
    hunyuan_app_id=111111111,
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French. Translate this sentence from English to French: I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'aime programmer.")
```

## 스트리밍을 사용하는 ChatHunyuan

```python
chat = ChatHunyuan(
    hunyuan_app_id="YOUR_APP_ID",
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
    streaming=True,
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French. Translate this sentence from English to French: I love programming."
        )
    ]
)
```

```output
AIMessageChunk(content="J'aime programmer.")
```