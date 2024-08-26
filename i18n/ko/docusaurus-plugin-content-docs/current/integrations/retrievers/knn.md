---
translated: true
---

# kNN

>통계학에서 [k-최근접 이웃 알고리즘(k-NN)](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm)은 1951년 `Evelyn Fix`와 `Joseph Hodges`에 의해 처음 개발된 비모수 감독 학습 방법이며, 이후 `Thomas Cover`에 의해 확장되었습니다. 이는 분류와 회귀에 사용됩니다.

이 노트북은 내부적으로 kNN을 사용하는 retriever를 사용하는 방법을 설명합니다.

[Andrej Karpathy](https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html)의 코드를 기반으로 합니다.

```python
from langchain_community.retrievers import KNNRetriever
from langchain_openai import OpenAIEmbeddings
```

## 새로운 Retriever 생성하기

```python
retriever = KNNRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
)
```

## Retriever 사용하기

이제 retriever를 사용할 수 있습니다!

```python
result = retriever.invoke("foo")
```

```python
result
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='bar', metadata={})]
```
