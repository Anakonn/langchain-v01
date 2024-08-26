---
translated: true
---

# 경로

> [Pathway](https://pathway.com/)는 오픈 데이터 처리 프레임워크입니다. 실시간 데이터 소스와 변화하는 데이터로 작업하는 데이터 변환 파이프라인과 기계 학습 애플리케이션을 쉽게 개발할 수 있습니다.

이 노트북은 `Langchain`과 함께 실시간 `Pathway` 데이터 인덱싱 파이프라인을 사용하는 방법을 보여줍니다. 일반 벡터 저장소와 마찬가지로 이 파이프라인의 결과를 체인에서 쿼리할 수 있습니다. 그러나 내부적으로 Pathway는 데이터 변경 시마다 인덱스를 업데이트하여 항상 최신 정보를 제공합니다.

이 노트북에서는 다음과 같은 [공개 데모 문서 처리 파이프라인](https://pathway.com/solutions/ai-pipelines#try-it-out)을 사용합니다:

1. 여러 클라우드 데이터 소스의 데이터 변경 사항을 모니터링합니다.
2. 데이터에 대한 벡터 인덱스를 구축합니다.

자신만의 문서 처리 파이프라인을 만들려면 [호스팅 서비스](https://pathway.com/solutions/ai-pipelines) 또는 [직접 구축](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/)을 확인하세요.

`VectorStore` 클라이언트를 사용하여 인덱스에 연결하고 `similarity_search` 함수를 통해 일치하는 문서를 검색할 수 있습니다.

이 문서에서 사용된 기본 파이프라인을 통해 클라우드 위치에 저장된 파일의 간단한 벡터 인덱스를 쉽게 구축할 수 있습니다. 그러나 Pathway는 실시간 데이터 파이프라인과 애플리케이션을 구축하는 데 필요한 모든 것을 제공합니다. 여기에는 SQL과 유사한 그룹화-집계 및 이기종 데이터 소스 간 조인, 시간 기반 그룹화 및 윈도잉, 다양한 커넥터 등이 포함됩니다.

## 데이터 파이프라인 쿼리하기

클라이언트를 인스턴스화하고 구성하려면 문서 인덱싱 파이프라인의 `url` 또는 `host`와 `port`를 제공해야 합니다. 아래 코드에서는 공개적으로 사용 가능한 [데모 파이프라인](https://pathway.com/solutions/ai-pipelines#try-it-out)을 사용합니다. 이 데모는 [Google Drive](https://drive.google.com/drive/u/0/folders/1cULDv2OaViJBmOfG5WB0oWcgayNrGtVs)와 [Sharepoint](https://navalgo.sharepoint.com/sites/ConnectorSandbox/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FConnectorSandbox%2FShared%20Documents%2FIndexerSandbox&p=true&ga=1)에서 문서를 수집하고 검색을 위한 인덱스를 유지합니다.

```python
from langchain_community.vectorstores import PathwayVectorClient

client = PathwayVectorClient(url="https://demo-document-indexing.pathway.stream")
```

 그리고 우리는 질문을 시작할 수 있습니다.

```python
query = "What is Pathway?"
docs = client.similarity_search(query)
```

```python
print(docs[0].page_content)
```

 **당신의 차례!** [자신의 파이프라인을 가져오거나](https://pathway.com/solutions/ai-pipelines) [새 문서를 업로드](https://chat-realtime-sharepoint-gdrive.demo.pathway.com/)하여 데모 파이프라인을 다시 시도해 보세요!

## 파일 메타데이터를 기반으로 필터링

[jmespath](https://jmespath.org/) 표현식을 사용하여 문서 필터링을 지원합니다. 예를 들면 다음과 같습니다:

```python
# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="modified_at >= `1702672093`")

# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="owner == `james`")

# take into account only sources with path containing 'repo_readme'
docs = client.similarity_search(query, metadata_filter="contains(path, 'repo_readme')")

# and of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` && modified_at >= `1702672093`"
)

# or of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` || modified_at >= `1702672093`"
)
```

## 인덱싱된 파일 정보 가져오기

 `PathwayVectorClient.get_vectorstore_statistics()`는 인덱스된 파일 수와 마지막 업데이트 시간과 같은 벡터 저장소의 핵심 통계를 제공합니다. 이를 사용하여 체인에서 지식베이스의 최신성을 사용자에게 알릴 수 있습니다.

```python
client.get_vectorstore_statistics()
```

## 자신만의 파이프라인

### 프로덕션에서 실행하기

자신만의 Pathway 데이터 인덱싱 파이프라인을 만들려면 Pathway의 [호스팅 파이프라인](https://pathway.com/solutions/ai-pipelines) 제품을 확인하세요. 또한 자체 Pathway 파이프라인을 실행할 수 있습니다. 파이프라인 구축 방법에 대한 정보는 [Pathway 가이드](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/)를 참조하세요.

### 문서 처리

벡터화 파이프라인은 문서 구문 분석, 분할 및 임베딩을 위한 플러그인 가능한 구성 요소를 지원합니다. 임베딩 및 분할에는 [Langchain 구성 요소](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/#langchain)를 사용하거나 Pathway에서 제공하는 [임베더](https://pathway.com/developers/api-docs/pathway-xpacks-llm/embedders) 및 [분할기](https://pathway.com/developers/api-docs/pathway-xpacks-llm/splitters)를 확인할 수 있습니다. 파서가 제공되지 않으면 기본적으로 `UTF-8` 파서가 사용됩니다. 사용 가능한 파서는 [여기](https://github.com/pathwaycom/pathway/blob/main/python/pathway/xpacks/llm/parser.py)에서 찾을 수 있습니다.
