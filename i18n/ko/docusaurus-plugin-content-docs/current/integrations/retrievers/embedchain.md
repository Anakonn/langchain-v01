---
translated: true
---

# Embedchain

>[Embedchain](https://github.com/embedchain/embedchain)은 데이터 파이프라인을 만들기 위한 RAG 프레임워크입니다. 모든 데이터를 로드, 인덱싱, 검색 및 동기화합니다.
>
>오픈 소스 패키지와 호스팅 플랫폼 솔루션으로 제공됩니다.

이 노트북은 `Embedchain`을 사용하는 retriever를 사용하는 방법을 보여줍니다.

# 설치

먼저 [`embedchain` 패키지](https://pypi.org/project/embedchain/)를 설치해야 합니다.

다음 명령어를 실행하여 패키지를 설치할 수 있습니다.

```python
%pip install --upgrade --quiet  embedchain
```

# 새로운 Retriever 생성

`EmbedchainRetriever`에는 다음과 같은 인수를 받는 정적 `.create()` 팩토리 메서드가 있습니다:

* `yaml_path: string` 선택적 -- YAML 구성 파일의 경로입니다. 제공되지 않으면 기본 구성이 사용됩니다. [문서](https://docs.embedchain.ai/)를 살펴보면 다양한 사용자 정의 옵션을 확인할 수 있습니다.

```python
# Setup API Key

import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass()
```

```output
 ········
```

```python
from langchain_community.retrievers import EmbedchainRetriever

# create a retriever with default options
retriever = EmbedchainRetriever.create()

# or if you want to customize, pass the yaml config path
# retriever = EmbedchainRetiever.create(yaml_path="config.yaml")
```

# 데이터 추가

Embedchain에서는 지원되는 모든 데이터 유형을 추가할 수 있습니다. [문서](https://docs.embedchain.ai/)를 살펴보면 지원되는 데이터 유형을 확인할 수 있습니다.

Embedchain은 데이터 유형을 자동으로 유추합니다. 따라서 문자열, URL 또는 로컬 파일 경로를 추가할 수 있습니다.

```python
retriever.add_texts(
    [
        "https://en.wikipedia.org/wiki/Elon_Musk",
        "https://www.forbes.com/profile/elon-musk",
        "https://www.youtube.com/watch?v=RcYjXbSJBN8",
    ]
)
```

```output
Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 4/4 [00:08<00:00,  2.22s/it]

Successfully saved https://en.wikipedia.org/wiki/Elon_Musk (DataType.WEB_PAGE). New chunks count: 378

Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:01<00:00,  1.17s/it]

Successfully saved https://www.forbes.com/profile/elon-musk (DataType.WEB_PAGE). New chunks count: 13

Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:02<00:00,  2.25s/it]

Successfully saved https://www.youtube.com/watch?v=RcYjXbSJBN8 (DataType.YOUTUBE_VIDEO). New chunks count: 53


```

```output
['1eab8dd1ffa92906f7fc839862871ca5',
 '8cf46026cabf9b05394a2658bd1fe890',
 'da3227cdbcedb018e05c47b774d625f6']
```

# Retriever 사용

이제 retriever를 사용하여 쿼리에 대한 관련 문서를 찾을 수 있습니다.

```python
result = retriever.invoke("How many companies does Elon Musk run and name those?")
```

```python
result
```

```output
[Document(page_content='Views Filmography Companies Zip2 X.com PayPal SpaceX Starlink Tesla, Inc. Energycriticismlitigation OpenAI Neuralink The Boring Company Thud X Corp. Twitteracquisitiontenure as CEO xAI In popular culture Elon Musk (Isaacson) Elon Musk (Vance) Ludicrous Power Play "Members Only" "The Platonic Permutation" "The Musk Who Fell to Earth" "One Crew over the Crewcoo\'s Morty" Elon Musk\'s Crash Course Related Boring Test Tunnel Hyperloop Musk family Musk vs. Zuckerberg SolarCity Tesla Roadster in space', metadata={'source': 'https://en.wikipedia.org/wiki/Elon_Musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3342161a0fbc19e91f6bf387204aa30fbb2cea05abc81882502476bde37b9392'}),
 Document(page_content='Elon Musk PROFILEElon MuskCEO, Tesla$241.2B$508M (0.21%)Real Time Net Worthas of 11/18/23Reflects change since 5 pm ET of prior trading day. 1 in the world todayPhoto by Martin Schoeller for ForbesAbout Elon MuskElon Musk cofounded six companies, including electric car maker Tesla, rocket producer SpaceX and tunneling startup Boring Company.He owns about 21% of Tesla between stock and options, but has pledged more than half his shares as collateral for personal loans of up to $3.5', metadata={'source': 'https://www.forbes.com/profile/elon-musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3c8573134c575fafc025e9211413723e1f7a725b5936e8ee297fb7fb63bdd01a'}),
 Document(page_content='to form PayPal. In October 2002, eBay acquired PayPal for $1.5 billion, and that same year, with $100 million of the money he made, Musk founded SpaceX, a spaceflight services company. In 2004, he became an early investor in electric vehicle manufacturer Tesla Motors, Inc. (now Tesla, Inc.). He became its chairman and product architect, assuming the position of CEO in 2008. In 2006, Musk helped create SolarCity, a solar-energy company that was acquired by Tesla in 2016 and became Tesla Energy.', metadata={'source': 'https://en.wikipedia.org/wiki/Elon_Musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3342161a0fbc19e91f6bf387204aa30fbb2cea05abc81882502476bde37b9392'})]
```
