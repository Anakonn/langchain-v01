---
translated: true
---

# SVM

>[Support Vector Machines (SVMs)](https://scikit-learn.org/stable/modules/svm.html#support-vector-machines)는 분류, 회귀 및 이상치 탐지에 사용되는 일련의 지도 학습 방법입니다.

이 노트북에서는 내부적으로 `scikit-learn` 패키지의 `SVM`을 사용하는 retriever를 사용하는 방법을 살펴봅니다.

https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html을 기반으로 합니다.

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
%pip install --upgrade --quiet  lark
```

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.retrievers import SVMRetriever
from langchain_openai import OpenAIEmbeddings
```

## 텍스트로 새 Retriever 생성

```python
retriever = SVMRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
)
```

## Retriever 사용

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
 Document(page_content='world', metadata={})]
```
