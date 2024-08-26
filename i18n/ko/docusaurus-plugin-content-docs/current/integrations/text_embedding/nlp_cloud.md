---
translated: true
---

# NLP 클라우드

>[NLP 클라우드](https://docs.nlpcloud.com/#introduction)는 가장 진보된 AI 엔진을 사용할 수 있게 해주는 인공 지능 플랫폼이며, 자신의 데이터로 자신만의 엔진을 학습시킬 수도 있습니다.

[embeddings](https://docs.nlpcloud.com/#embeddings) 엔드포인트에는 다음과 같은 모델이 제공됩니다:

* `paraphrase-multilingual-mpnet-base-v2`: Paraphrase Multilingual MPNet Base V2는 Sentence Transformers를 기반으로 한 매우 빠른 모델로, 50개 이상의 언어에서 임베딩 추출에 완벽하게 적합합니다(전체 목록은 여기에서 확인).

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
from langchain_community.embeddings import NLPCloudEmbeddings
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = "xxx"
nlpcloud_embd = NLPCloudEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = nlpcloud_embd.embed_query(text)
```

```python
doc_result = nlpcloud_embd.embed_documents([text])
```
