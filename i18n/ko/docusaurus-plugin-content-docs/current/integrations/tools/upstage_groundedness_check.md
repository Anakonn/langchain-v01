---
sidebar_label: Upstage
translated: true
---

# Upstage 기반성 검사

이 노트북에서는 Upstage 기반성 검사 모델 사용 방법을 다룹니다.

## 설치

`langchain-upstage` 패키지를 설치하세요.

```bash
pip install -U langchain-upstage
```

## 환경 설정

다음과 같은 환경 변수를 설정해야 합니다:

- `UPSTAGE_API_KEY`: [Upstage 개발자 문서](https://developers.upstage.ai/docs/getting-started/quick-start)에서 받은 Upstage API 키입니다.

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## 사용법

`UpstageGroundednessCheck` 클래스를 초기화하세요.

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()
```

`run` 메서드를 사용하여 입력 텍스트의 기반성을 검사하세요.

```python
request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawai'i. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}

response = groundedness_check.invoke(request_input)
print(response)
```
