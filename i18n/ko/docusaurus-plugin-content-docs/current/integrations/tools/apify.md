---
translated: true
---

# Apify

이 노트북은 LangChain의 [Apify 통합](/docs/integrations/providers/apify)을 사용하는 방법을 보여줍니다.

[Apify](https://apify.com)는 웹 스크래핑과 데이터 추출을 위한 클라우드 플랫폼으로, 다양한 웹 스크래핑, 크롤링 및 데이터 추출 사용 사례를 위한 *Actors*라는 1,000개 이상의 준비된 앱 생태계를 제공합니다. 예를 들어 Google 검색 결과, Instagram 및 Facebook 프로필, Amazon 또는 Shopify의 제품, Google Maps 리뷰 등을 추출할 수 있습니다.

이 예에서는 [Website Content Crawler](https://apify.com/apify/website-content-crawler) Actor를 사용할 것입니다. 이 Actor는 문서, 지식 베이스, 도움말 센터 또는 블로그와 같은 웹 사이트를 깊이 있게 크롤링하고 웹 페이지에서 텍스트 콘텐츠를 추출할 수 있습니다. 그런 다음 문서를 벡터 인덱스에 입력하고 그로부터 질문에 답변합니다.

```python
%pip install --upgrade --quiet  apify-client langchain-openai langchain
```

먼저 소스 코드에 `ApifyWrapper`를 가져옵니다:

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.utilities import ApifyWrapper
from langchain_core.documents import Document
```

[Apify API 토큰](https://console.apify.com/account/integrations)과 이 예제의 목적을 위해 OpenAI API 키를 사용하여 초기화합니다:

```python
import os

os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
os.environ["APIFY_API_TOKEN"] = "Your Apify API token"

apify = ApifyWrapper()
```

그런 다음 Actor를 실행하고 완료될 때까지 기다린 다음 Apify 데이터셋에서 결과를 가져와 LangChain 문서 로더에 입력합니다.

이미 Apify 데이터셋에 결과가 있는 경우 [이 노트북](/docs/integrations/document_loaders/apify_dataset)에 나와 있는 것처럼 `ApifyDatasetLoader`를 사용하여 직접 로드할 수 있습니다. 해당 노트북에서는 Apify 데이터셋 레코드의 필드를 LangChain `Document` 필드에 매핑하는 `dataset_mapping_function`에 대한 설명도 찾을 수 있습니다.

```python
loader = apify.call_actor(
    actor_id="apify/website-content-crawler",
    run_input={"startUrls": [{"url": "https://python.langchain.com/en/latest/"}]},
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

크롤링된 문서에서 벡터 인덱스를 초기화합니다:

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

마지막으로 벡터 인덱스를 쿼리합니다:

```python
query = "What is LangChain?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 LangChain is a standard interface through which you can interact with a variety of large language models (LLMs). It provides modules that can be used to build language model applications, and it also provides chains and agents with memory capabilities.

https://python.langchain.com/en/latest/modules/models/llms.html, https://python.langchain.com/en/latest/getting_started/getting_started.html
```
