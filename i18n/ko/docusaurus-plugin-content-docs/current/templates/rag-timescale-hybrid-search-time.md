---
translated: true
---

# 하이브리드 검색을 사용한 Timescale Vector의 RAG

이 템플릿은 timescale-vector와 self-query retriver를 사용하여 유사성과 시간 기반 하이브리드 검색을 수행하는 방법을 보여줍니다.
이는 데이터에 강력한 시간 기반 구성 요소가 있는 경우 유용합니다. 이러한 데이터의 예는 다음과 같습니다:
- 뉴스 기사(정치, 비즈니스 등)
- 블로그 게시물, 문서 또는 기타 게시 자료(공개 또는 비공개)
- 소셜 미디어 게시물
- 모든 종류의 변경 로그
- 메시지

이러한 항목은 종종 유사성과 시간을 모두 기준으로 검색됩니다. 예를 들어: 2022년 도요타 트럭에 대한 모든 뉴스를 보여주세요.

[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)는 특정 시간 범위 내에서 임베딩을 검색할 때 자동 테이블 파티셔닝을 활용하여 성능이 우수합니다.

Langchain의 self-query retriver를 통해 사용자 쿼리의 텍스트에서 시간 범위(및 기타 검색 기준)를 유추할 수 있습니다.

## Timescale Vector란 무엇입니까?

**[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)는 AI 애플리케이션을 위한 PostgreSQL++입니다.**

Timescale Vector를 사용하면 `PostgreSQL`에서 수십억 개의 벡터 임베딩을 효율적으로 저장하고 쿼리할 수 있습니다.
- DiskANN 영감의 인덱싱 알고리즘을 통해 10억 개 이상의 벡터에서 더 빠르고 정확한 유사성 검색을 제공합니다.
- 자동 시간 기반 파티셔닝 및 인덱싱을 통해 빠른 시간 기반 벡터 검색을 가능하게 합니다.
- 벡터 임베딩과 관계형 데이터를 쿼리하기 위한 익숙한 SQL 인터페이스를 제공합니다.

Timescale Vector는 POC에서 프로덕션까지 확장되는 클라우드 PostgreSQL for AI입니다:
- 관계형 메타데이터, 벡터 임베딩 및 시계열 데이터를 단일 데이터베이스에 저장할 수 있어 운영이 간소화됩니다.
- 스트리밍 백업 및 복제, 고가용성 및 행 수준 보안과 같은 엔터프라이즈급 기능을 제공하는 견고한 PostgreSQL 기반의 이점을 누릴 수 있습니다.
- 엔터프라이즈급 보안 및 규정 준수로 걱정 없는 경험을 제공합니다.

### Timescale Vector 액세스 방법

Timescale Vector는 [Timescale](https://www.timescale.com/products?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) 클라우드 PostgreSQL 플랫폼에서 사용할 수 있습니다. (현재 자체 호스팅 버전은 없습니다.)

- LangChain 사용자는 Timescale Vector에 대한 90일 무료 평가판을 받습니다.
- 시작하려면 [가입](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)하여 새 데이터베이스를 만들고 이 노트북을 따르세요!
- 자세한 내용은 [설치 지침](https://github.com/timescale/python-vector)을 참조하세요.

## 환경 설정

이 템플릿은 Timescale Vector를 벡터 저장소로 사용하며 `TIMESCALES_SERVICE_URL`이 필요합니다. 아직 계정이 없는 경우 [여기](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)에서 90일 무료 평가판에 가입하세요.

샘플 데이터셋을 로드하려면 `LOAD_SAMPLE_DATA=1`을 설정하세요. 자체 데이터셋을 로드하려면 아래 섹션을 참조하세요.

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package rag-timescale-hybrid-search-time
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-timescale-hybrid-search-time
```

그리고 다음 코드를 `server.py` 파일에 추가하세요:

```python
from rag_timescale_hybrid_search.chain import chain as rag_timescale_hybrid_search_chain

add_routes(app, rag_timescale_hybrid_search_chain, path="/rag-timescale-hybrid-search")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 됩니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/rag-timescale-hybrid-search/playground](http://127.0.0.1:8000/rag-timescale-hybrid-search/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-hybrid-search")
```

## 자체 데이터셋 로드

자체 데이터셋을 로드하려면 `chain.py`의 `DATASET SPECIFIC CODE` 섹션의 코드를 수정해야 합니다.
이 코드는 컬렉션의 이름, 데이터 로드 방법 및 컬렉션 내용과 모든 메타데이터에 대한 인간 언어 설명을 정의합니다. 인간 언어 설명은 self-query retriver가 Timescale-vector에서 데이터를 검색할 때 메타데이터에 대한 필터를 LLM으로 변환하는 데 사용됩니다.
