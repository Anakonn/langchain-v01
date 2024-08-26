---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io)는 사용자 경험과 전반적인 성장에 더 집중할 수 있도록 최소한의 노력으로 강력한 프로덕션 준비 GenAI 기반 애플리케이션을 구축할 수 있는 통합 플랫폼입니다. 이 섹션에서는 `PremAIEmbeddings`를 사용하여 다양한 임베딩 모델에 액세스하는 방법을 설명합니다.

## 설치 및 설정

먼저 langchain과 premai-sdk를 설치합니다. 다음 명령어를 입력하여 설치할 수 있습니다:

```bash
pip install premai langchain
```

계속하기 전에 Prem에 계정을 만들고 프로젝트를 이미 시작했는지 확인하십시오. 그렇지 않은 경우 다음과 같이 무료로 시작할 수 있습니다:

1. [PremAI](https://app.premai.io/accounts/login/)에 처음 오신 경우 로그인하고 [여기](https://app.premai.io/api_keys/)에서 API 키를 생성하십시오.

2. [app.premai.io](https://app.premai.io)로 이동하면 프로젝트 대시보드로 이동합니다.

3. 프로젝트를 생성하면 프로젝트 ID(ID로 표시)가 생성됩니다. 이 ID를 사용하여 배포된 애플리케이션과 상호 작용할 수 있습니다.

Prem에 첫 번째 배포 애플리케이션을 만들어 주셔서 감사합니다 🎉 이제 langchain을 사용하여 애플리케이션과 상호 작용할 수 있습니다.

```python
# Let's start by doing some imports and define our embedding object

from langchain_community.embeddings import PremAIEmbeddings
```

필요한 모듈을 가져왔으니 이제 클라이언트를 설정해 보겠습니다. 지금은 `project_id`가 8이라고 가정하겠지만 반드시 자신의 프로젝트 ID를 사용하십시오. 그렇지 않으면 오류가 발생합니다.

```python
import getpass
import os

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
model = "text-embedding-3-large"
embedder = PremAIEmbeddings(project_id=8, model=model)
```

임베딩 모델을 정의했습니다. 우리는 많은 임베딩 모델을 지원합니다. 다음 표는 지원되는 임베딩 모델 수를 보여줍니다.

| 제공업체    | Slug                                     | 컨텍스트 토큰 |
|-------------|------------------------------------------|----------------|
| cohere      | embed-english-v3.0                       | N/A            |
| openai      | text-embedding-3-small                   | 8191           |
| openai      | text-embedding-3-large                   | 8191           |
| openai      | text-embedding-ada-002                   | 8191           |
| replicate   | replicate/all-mpnet-base-v2              | N/A            |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A            |
| mistralai   | mistral-embed                            | 4096           |

모델을 변경하려면 `slug`를 복사하고 임베딩 모델에 액세스하면 됩니다. 이제 단일 쿼리와 다중 쿼리(문서라고도 함)로 임베딩 모델을 사용해 보겠습니다.

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

```output
[-0.02129288576543331, 0.0008162345038726926, -0.004556538071483374, 0.02918623760342598, -0.02547479420900345]
```

마지막으로 문서를 임베딩해 보겠습니다.

```python
documents = ["This is document1", "This is document2", "This is document3"]

doc_result = embedder.embed_documents(documents)

# Similar to previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```

```output
[-0.0030691148713231087, -0.045334383845329285, -0.0161729846149683, 0.04348714277148247, -0.0036920777056366205]
```
