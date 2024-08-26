---
translated: true
---

# Cube 시맨틱 레이어

이 노트북은 LLM에 임베딩으로 전달할 수 있는 형식으로 Cube의 데이터 모델 메타데이터를 검색하는 프로세스를 보여줍니다.

### Cube 소개

[Cube](https://cube.dev/)는 데이터 앱 구축을 위한 시맨틱 레이어입니다. 데이터 엔지니어와 애플리케이션 개발자가 현대 데이터 저장소에서 데이터에 액세스하고, 일관된 정의로 구성하며, 모든 애플리케이션에 제공할 수 있도록 지원합니다.

Cube의 데이터 모델은 LLM이 데이터를 이해하고 올바른 쿼리를 생성할 수 있는 컨텍스트로 사용됩니다. LLM은 복잡한 조인과 메트릭 계산을 탐색할 필요가 없으며, Cube가 이를 추상화하고 SQL 테이블 및 열 이름 대신 비즈니스 수준 용어로 작동하는 간단한 인터페이스를 제공합니다. 이러한 단순화를 통해 LLM의 오류 발생 가능성을 낮추고 환각을 방지할 수 있습니다.

### 예시

**필수 입력 인수**

`Cube Semantic Loader`에는 2개의 인수가 필요합니다:

- `cube_api_url`: Cube 배포 REST API의 URL입니다. [Cube 문서](https://cube.dev/docs/http-api/rest#configuration-base-path)를 참조하여 기본 경로를 구성하는 방법을 확인하세요.

- `cube_api_token`: Cube API 비밀 키를 기반으로 생성된 인증 토큰입니다. [Cube 문서](https://cube.dev/docs/security#generating-json-web-tokens-jwt)를 참조하여 JSON 웹 토큰(JWT) 생성 방법을 확인하세요.

**선택적 입력 인수**

- `load_dimension_values`: 모든 문자열 차원에 대한 차원 값을 로드할지 여부입니다.

- `dimension_values_limit`: 로드할 최대 차원 값 수입니다.

- `dimension_values_max_retries`: 차원 값 로드 시 최대 재시도 횟수입니다.

- `dimension_values_retry_delay`: 차원 값 로드 재시도 사이의 지연 시간입니다.

```python
import jwt
from langchain_community.document_loaders import CubeSemanticLoader

api_url = "https://api-example.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1/meta"
cubejs_api_secret = "api-secret-here"
security_context = {}
# Read more about security context here: https://cube.dev/docs/security
api_token = jwt.encode(security_context, cubejs_api_secret, algorithm="HS256")

loader = CubeSemanticLoader(api_url, api_token)

documents = loader.load()
```

다음과 같은 속성이 포함된 문서 목록을 반환합니다:

- `page_content`
- `metadata`
  - `table_name`
  - `column_name`
  - `column_data_type`
  - `column_title`
  - `column_description`
  - `column_values`
  - `cube_data_obj_type`

```python
# Given string containing page content
page_content = "Users View City, None"

# Given dictionary containing metadata
metadata = {
    "table_name": "users_view",
    "column_name": "users_view.city",
    "column_data_type": "string",
    "column_title": "Users View City",
    "column_description": "None",
    "column_member_type": "dimension",
    "column_values": [
        "Austin",
        "Chicago",
        "Los Angeles",
        "Mountain View",
        "New York",
        "Palo Alto",
        "San Francisco",
        "Seattle",
    ],
    "cube_data_obj_type": "view",
}
```
