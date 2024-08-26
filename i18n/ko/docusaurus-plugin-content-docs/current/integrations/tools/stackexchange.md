---
translated: true
---

# StackExchange

>[Stack Exchange](https://stackexchange.com/)는 다양한 분야의 질문과 답변(Q&A) 웹사이트 네트워크로, 각 사이트는 특정 주제를 다루며 질문, 답변 및 사용자가 평판 시스템에 따라 관리됩니다.

``StackExchange`` 구성 요소는 LangChain에 StackExchange API를 통합하여 [StackOverflow](https://stackoverflow.com/) 사이트에 액세스할 수 있습니다. Stack Overflow는 컴퓨터 프로그래밍에 중점을 둡니다.

이 노트북에서는 ``StackExchange`` 구성 요소 사용 방법을 설명합니다.

먼저 Stack Exchange API를 구현하는 python 패키지 stackapi를 설치해야 합니다.

```python
pip install --upgrade stackapi
```

```python
from langchain_community.utilities import StackExchangeAPIWrapper

stackexchange = StackExchangeAPIWrapper()

stackexchange.run("zsh: command not found: python")
```
