---
translated: true
---

# Wolfram Alpha

이 노트북은 Wolfram Alpha 구성 요소 사용 방법을 설명합니다.

먼저 Wolfram Alpha 개발자 계정을 설정하고 APP ID를 받아야 합니다:

1. Wolfram Alpha에 가입하여 개발자 계정을 만드세요 [여기](https://developer.wolframalpha.com/)
2. 앱을 만들고 APP ID를 받으세요
3. pip install wolframalpha

그런 다음 환경 변수를 설정해야 합니다:
1. APP ID를 WOLFRAM_ALPHA_APPID 환경 변수에 저장하세요

```python
pip install wolframalpha
```

```python
import os

os.environ["WOLFRAM_ALPHA_APPID"] = ""
```

```python
from langchain_community.utilities.wolfram_alpha import WolframAlphaAPIWrapper
```

```python
wolfram = WolframAlphaAPIWrapper()
```

```python
wolfram.run("What is 2x+5 = -3x + 7?")
```

```output
'x = 2/5'
```
