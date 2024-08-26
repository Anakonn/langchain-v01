---
translated: true
---

# 업스테이지

[Upstage](https://upstage.ai)는 인간 수준 이상의 성능을 가진 LLM 구성 요소를 제공하는 선도적인 인공 지능(AI) 회사입니다.

## Solar LLM

**Solar Mini Chat**은 영어와 한국어에 초점을 맞춘 빠르면서도 강력한 고급 대형 언어 모델입니다. 다중 대화 목적으로 특별히 미세 조정되어 있어, RAG(Retrieval-Augmented Generation)와 같이 긴 문맥을 이해해야 하는 작업을 포함하여 다양한 자연어 처리 작업에서 향상된 성능을 보여줍니다. 이 미세 조정을 통해 더 효과적으로 긴 대화를 처리할 수 있게 되어 대화형 애플리케이션에 특히 적합합니다.

Solar 외에도 Upstage는 **Groundedness Check** 및 **Layout Analysis**와 같은 실제 세계 RAG(retrieval-augmented generation) 기능을 제공합니다.

## 설치 및 설정

`langchain-upstage` 패키지를 설치하세요:

```bash
pip install -qU langchain-core langchain-upstage
```

[API 키](https://console.upstage.ai)를 받고 환경 변수 `UPSTAGE_API_KEY`를 설정하세요.

## Upstage LangChain 통합

| API | 설명 | 가져오기 | 사용 예시 |
| --- | --- | --- | --- |
| Chat | Solar Mini Chat을 사용하여 어시스턴트 구축 | `from langchain_upstage import ChatUpstage` | [Go](../../chat/upstage) |
| Text Embedding | 문자열을 벡터로 임베딩 | `from langchain_upstage import UpstageEmbeddings` | [Go](../../text_embedding/upstage) |
| Groundedness Check | 어시스턴트 응답의 근거 확인 | `from langchain_upstage import UpstageGroundednessCheck` | [Go](../../tools/upstage_groundedness_check) |
| Layout Analysis | 표와 그림이 포함된 문서 직렬화 | `from langchain_upstage import UpstageLayoutAnalysisLoader` | [Go](../../document_loaders/upstage) |

자세한 내용은 [문서](https://developers.upstage.ai/)를 참조하세요.

## 빠른 예제

### 환경 설정

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

### 채팅

```python
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
response = chat.invoke("Hello, how are you?")
print(response)
```

### 텍스트 임베딩

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)

query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

### Groundedness Check

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()

request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawaii. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}
response = groundedness_check.invoke(request_input)
print(response)
```

### Layout Analysis

```python
from langchain_upstage import UpstageLayoutAnalysisLoader

file_path = "/PATH/TO/YOUR/FILE.pdf"
layzer = UpstageLayoutAnalysisLoader(file_path, split="page")

# For improved memory efficiency, consider using the lazy_load method to load documents page by page.
docs = layzer.load()  # or layzer.lazy_load()

for doc in docs[:3]:
    print(doc)
```
