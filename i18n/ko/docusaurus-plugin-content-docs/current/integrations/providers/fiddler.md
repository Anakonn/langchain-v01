---
translated: true
---

# 피들러

>[피들러](https://www.fiddler.ai/)는 기업 규모의 ML 배포를 모니터링, 설명, 분석 및 개선하기 위한 통합 플랫폼을 제공합니다.

## 설치 및 설정

피들러와 함께 모델을 설정하세요:

* 피들러에 연결하는 데 사용하는 URL
* 귀하의 조직 ID
* 귀하의 인증 토큰

Python 패키지를 설치하세요:

```bash
pip install fiddler-client
```

## 콜백

```python
<!--IMPORTS:[{"imported": "FiddlerCallbackHandler", "source": "langchain_community.callbacks.fiddler_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.fiddler_callback.FiddlerCallbackHandler.html", "title": "Fiddler"}]-->
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler
```

[예제](/docs/integrations/callbacks/fiddler)를 참조하세요.
