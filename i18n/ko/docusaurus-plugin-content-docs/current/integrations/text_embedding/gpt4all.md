---
translated: true
---

# GPT4All

[GPT4All](https://gpt4all.io/index.html)은 무료로 사용할 수 있는 로컬 실행 방식의 프라이버시 보호 챗봇입니다. GPU나 인터넷이 필요하지 않습니다. GPT4All Falcon, Wizard 등의 인기 모델과 자체 모델을 제공합니다.

이 노트북은 [GPT4All embeddings](https://docs.gpt4all.io/gpt4all_python_embedding.html#gpt4all.gpt4all.Embed4All)를 LangChain과 함께 사용하는 방법을 설명합니다.

## GPT4All의 Python 바인딩 설치

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

참고: 업데이트된 패키지를 사용하려면 커널을 다시 시작해야 할 수 있습니다.

```python
from langchain_community.embeddings import GPT4AllEmbeddings
```

```python
gpt4all_embd = GPT4AllEmbeddings()
```

```output
100%|████████████████████████| 45.5M/45.5M [00:02<00:00, 18.5MiB/s]

Model downloaded at:  /Users/rlm/.cache/gpt4all/ggml-all-MiniLM-L6-v2-f16.bin

objc[45711]: Class GGMLMetalClass is implemented in both /Users/rlm/anaconda3/envs/lcn2/lib/python3.9/site-packages/gpt4all/llmodel_DO_NOT_MODIFY/build/libreplit-mainline-metal.dylib (0x29fe18208) and /Users/rlm/anaconda3/envs/lcn2/lib/python3.9/site-packages/gpt4all/llmodel_DO_NOT_MODIFY/build/libllamamodel-mainline-metal.dylib (0x2a0244208). One of the two will be used. Which one is undefined.
```

```python
text = "This is a test document."
```

## 텍스트 데이터 임베딩

```python
query_result = gpt4all_embd.embed_query(text)
```

embed_documents를 사용하면 여러 개의 텍스트 조각을 임베딩할 수 있습니다. [Nomic's Atlas](https://docs.nomic.ai/index.html)를 사용하여 이러한 임베딩을 매핑하면 데이터의 시각적 표현을 볼 수 있습니다.

```python
doc_result = gpt4all_embd.embed_documents([text])
```
