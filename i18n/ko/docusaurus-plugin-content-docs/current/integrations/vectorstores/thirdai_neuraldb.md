---
translated: true
---

# ThirdAI NeuralDB

>[NeuralDB](https://www.thirdai.com/neuraldb-enterprise/)는 [ThirdAI](https://www.thirdai.com/)에서 개발한 CPU 친화적이고 미세 조정 가능한 벡터 저장소입니다.

## 초기화

두 가지 초기화 방법이 있습니다:
- 처음부터 시작: 기본 모델
- 체크포인트에서: 이전에 저장된 모델 로드

다음 초기화 방법 모두에서 `thirdai_key` 매개변수는 `THIRDAI_KEY` 환경 변수가 설정된 경우 생략할 수 있습니다.

ThirdAI API 키는 https://www.thirdai.com/try-bolt/에서 얻을 수 있습니다.

```python
from langchain.vectorstores import NeuralDBVectorStore

# From scratch
vectorstore = NeuralDBVectorStore.from_scratch(thirdai_key="your-thirdai-key")

# From checkpoint
vectorstore = NeuralDBVectorStore.from_checkpoint(
    # Path to a NeuralDB checkpoint. For example, if you call
    # vectorstore.save("/path/to/checkpoint.ndb") in one script, then you can
    # call NeuralDBVectorStore.from_checkpoint("/path/to/checkpoint.ndb") in
    # another script to load the saved model.
    checkpoint="/path/to/checkpoint.ndb",
    thirdai_key="your-thirdai-key",
)
```

## 문서 소스 삽입

```python
vectorstore.insert(
    # If you have PDF, DOCX, or CSV files, you can directly pass the paths to the documents
    sources=["/path/to/doc.pdf", "/path/to/doc.docx", "/path/to/doc.csv"],
    # When True this means that the underlying model in the NeuralDB will
    # undergo unsupervised pretraining on the inserted files. Defaults to True.
    train=True,
    # Much faster insertion with a slight drop in performance. Defaults to True.
    fast_mode=True,
)

from thirdai import neural_db as ndb

vectorstore.insert(
    # If you have files in other formats, or prefer to configure how
    # your files are parsed, then you can pass in NeuralDB document objects
    # like this.
    sources=[
        ndb.PDF(
            "/path/to/doc.pdf",
            version="v2",
            chunk_size=100,
            metadata={"published": 2022},
        ),
        ndb.Unstructured("/path/to/deck.pptx"),
    ]
)
```

## 유사성 검색

벡터 저장소를 쿼리하려면 표준 LangChain 벡터 저장소 메서드 `similarity_search`를 사용할 수 있습니다. 이 메서드는 LangChain Document 객체 목록을 반환합니다. 각 문서 객체는 인덱싱된 파일의 텍스트 청크를 나타냅니다. 예를 들어, 인덱싱된 PDF 파일의 단락일 수 있습니다. 텍스트 외에도 문서의 메타데이터 필드에는 문서 ID, 이 문서의 소스(어떤 파일에서 왔는지) 및 문서 점수와 같은 정보가 포함됩니다.

```python
# This returns a list of LangChain Document objects
documents = vectorstore.similarity_search("query", k=10)
```

## 미세 조정

NeuralDBVectorStore는 사용자 행동과 도메인별 지식에 맞게 미세 조정할 수 있습니다. 두 가지 방법으로 미세 조정할 수 있습니다:
1. 연관성: 벡터 저장소가 소스 구문과 대상 구문을 연결합니다. 벡터 저장소가 소스 구문을 볼 때 대상 구문과 관련된 결과도 고려합니다.
2. 업보팅: 벡터 저장소가 특정 쿼리에 대한 문서 점수를 높입니다. 이는 사용자 행동에 맞게 벡터 저장소를 미세 조정할 때 유용합니다. 예를 들어 사용자가 "자동차는 어떻게 제조되나요?"를 검색하고 ID 52의 반환된 문서를 좋아하면 "자동차는 어떻게 제조되나요?" 쿼리에 대해 ID 52의 문서 점수를 높일 수 있습니다.

```python
vectorstore.associate(source="source phrase", target="target phrase")
vectorstore.associate_batch(
    [
        ("source phrase 1", "target phrase 1"),
        ("source phrase 2", "target phrase 2"),
    ]
)

vectorstore.upvote(query="how is a car manufactured", document_id=52)
vectorstore.upvote_batch(
    [
        ("query 1", 52),
        ("query 2", 20),
    ]
)
```
