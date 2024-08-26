---
translated: true
---

# 위키백과

>[위키백과](https://wikipedia.org/)는 자원봉사자들인 위키피디언들이 오픈 협업과 미디어위키라는 위키 기반 편집 시스템을 통해 작성하고 유지하는 다국어 무료 온라인 백과사전입니다. 위키백과는 역사상 가장 큰 규모이자 가장 많이 읽히는 참고 자료입니다.

이 노트북은 `wikipedia.org`에서 위키 페이지를 로드하여 하류에서 사용하는 문서 형식으로 변환하는 방법을 보여줍니다.

## 설치

먼저 `wikipedia` 파이썬 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  wikipedia
```

## 예시

`WikipediaLoader`에는 다음과 같은 인수가 있습니다:
- `query`: 위키백과에서 문서를 찾는 데 사용되는 자유 텍스트
- 선택적 `lang`: 기본값="en". 특정 언어 부분의 위키백과에서 검색하는 데 사용합니다.
- 선택적 `load_max_docs`: 기본값=100. 다운로드할 문서 수를 제한하는 데 사용합니다. 모든 100개의 문서를 다운로드하는 데는 시간이 걸리므로 실험에는 작은 숫자를 사용하세요. 현재 300개가 하드 제한입니다.
- 선택적 `load_all_available_meta`: 기본값=False. 기본적으로 가장 중요한 필드만 다운로드됩니다: `Published`(문서가 게시/마지막으로 업데이트된 날짜), `title`, `Summary`. True인 경우 다른 필드도 다운로드됩니다.

```python
from langchain_community.document_loaders import WikipediaLoader
```

```python
docs = WikipediaLoader(query="HUNTER X HUNTER", load_max_docs=2).load()
len(docs)
```

```python
docs[0].metadata  # meta-information of the Document
```

```python
docs[0].page_content[:400]  # a content of the Document
```
