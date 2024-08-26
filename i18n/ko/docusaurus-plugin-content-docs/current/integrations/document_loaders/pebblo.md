---
translated: true
---

# Pebblo Safe DocumentLoader

> [Pebblo](https://daxa-ai.github.io/pebblo/)는 개발자가 조직의 규정 및 보안 요구 사항에 대해 걱정하지 않고도 데이터를 안전하게 로드하고 Gen AI 앱을 배포할 수 있도록 합니다. 이 프로젝트는 로드된 데이터에서 발견된 의미론적 주제와 엔티티를 식별하고 UI 또는 PDF 보고서에 요약합니다.

Pebblo에는 두 가지 구성 요소가 있습니다.

1. Langchain용 Pebblo Safe DocumentLoader
1. Pebblo Server

이 문서에서는 기존 Langchain DocumentLoader에 Pebblo Safe DocumentLoader를 추가하여 Gen-AI Langchain 애플리케이션에 수집된 주제 및 엔티티 유형에 대한 깊이 있는 데이터 가시성을 얻는 방법을 설명합니다. `Pebblo Server`에 대한 자세한 내용은 이 [pebblo server](https://daxa-ai.github.io/pebblo/daemon) 문서를 참조하십시오.

Pebblo Safeloader는 Langchain `DocumentLoader`에 대한 안전한 데이터 수집을 가능하게 합니다. 이는 `Pebblo Safe DocumentLoader`로 문서 로더 호출을 래핑하여 수행됩니다.

참고: pebblo 서버를 pebblo의 기본 URL(localhost:8000) 이외의 URL에 구성하려면 `PEBBLO_CLASSIFIER_URL` 환경 변수에 올바른 URL을 입력하십시오. 이는 `classifier_url` 키워드 인수를 사용하여 구성할 수도 있습니다. 참조: [server-configurations](https://daxa-ai.github.io/pebblo/config)

#### 문서 로딩을 Pebblo로 활성화하는 방법

Langchain RAG 애플리케이션 스니펫을 사용하여 CSV 문서를 읽기 위해 `CSVLoader`를 사용한다고 가정합니다.

다음은 `CSVLoader`를 사용한 문서 로딩 스니펫입니다.

```python
from langchain.document_loaders.csv_loader import CSVLoader

loader = CSVLoader("data/corp_sens_data.csv")
documents = loader.load()
print(documents)
```

Pebblo SafeLoader는 위의 스니펫에 몇 줄의 코드 변경으로 활성화할 수 있습니다.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
)
documents = loader.load()
print(documents)
```

### Pebblo 클라우드 서버에 의미론적 주제 및 ID 전송

의미론적 데이터를 pebblo-cloud에 전송하려면 인수로 api-key를 PebbloSafeLoader에 전달하거나 `PEBBLO_API_KEY` 환경 변수에 api-key를 입력하십시오.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
)
documents = loader.load()
print(documents)
```

### 로드된 메타데이터에 의미론적 주제 및 ID 추가

로드된 문서의 메타데이터에 의미론적 주제 및 의미론적 엔티티를 추가하려면 인수로 load_semantic을 True로 설정하거나 `PEBBLO_LOAD_SEMANTIC` 환경 변수를 정의하고 True로 설정하십시오.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
    load_semantic=True,  # Load semantic data (Optional, default is False, can be set in the environment variable PEBBLO_LOAD_SEMANTIC)
)
documents = loader.load()
print(documents[0].metadata)
```
