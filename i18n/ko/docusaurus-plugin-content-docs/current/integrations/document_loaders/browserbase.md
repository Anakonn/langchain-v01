---
translated: true
---

# Browserbase

[Browserbase](https://browserbase.com)는 무서버 플랫폼으로, 헤드리스 브라우저를 실행할 수 있습니다. 고급 디버깅, 세션 녹화, 스텔스 모드, 통합 프록시 및 캡차 해결 기능을 제공합니다.

## 설치

- [browserbase.com](https://browserbase.com)에서 API 키를 받아 환경 변수(`BROWSERBASE_API_KEY`)에 설정하세요.
- [Browserbase SDK](http://github.com/browserbase/python-sdk)를 설치하세요:

```python
% pip install browserbase
```

## 문서 로드

`BrowserbaseLoader`를 사용하여 웹페이지를 LangChain에 로드할 수 있습니다. 선택적으로 `text_content` 매개변수를 설정하여 페이지를 텍스트 전용 표현으로 변환할 수 있습니다.

```python
from langchain_community.document_loaders import BrowserbaseLoader
```

```python
loader = BrowserbaseLoader(
    urls=[
        "https://example.com",
    ],
    # Text mode
    text_content=False,
)

docs = loader.load()
print(docs[0].page_content[:61])
```

## 이미지 로드

웹페이지의 스크린샷(바이트 단위)을 멀티모달 모델에 로드할 수도 있습니다.

GPT-4V를 사용한 전체 예제:

```python
from browserbase import Browserbase
from browserbase.helpers.gpt4 import GPT4VImage, GPT4VImageDetail
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-4-vision-preview", max_tokens=256)
browser = Browserbase()

screenshot = browser.screenshot("https://browserbase.com")

result = chat.invoke(
    [
        HumanMessage(
            content=[
                {"type": "text", "text": "What color is the logo?"},
                GPT4VImage(screenshot, GPT4VImageDetail.auto),
            ]
        )
    ]
)

print(result.content)
```

