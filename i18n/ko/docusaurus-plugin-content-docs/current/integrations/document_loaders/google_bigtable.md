---
translated: true
---

# Google Bigtable

> [Bigtable](https://cloud.google.com/bigtable)는 구조화, 반구조화 또는 비구조화 데이터에 대한 빠른 액세스를 위한 키-값 및 wide-column 저장소입니다. Bigtable의 Langchain 통합을 활용하여 AI 기반 경험을 구축하도록 데이터베이스 애플리케이션을 확장하세요.

이 노트북에서는 `BigtableLoader`와 `BigtableSaver`를 사용하여 [Bigtable](https://cloud.google.com/bigtable)에 [langchain 문서를 저장, 로드 및 삭제](/docs/modules/data_connection/document_loaders/)하는 방법을 살펴봅니다.

[GitHub](https://github.com/googleapis/langchain-google-bigtable-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/document_loader.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Bigtable API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [Bigtable 인스턴스 생성](https://cloud.google.com/bigtable/docs/creating-instance)
* [Bigtable 테이블 생성](https://cloud.google.com/bigtable/docs/managing-tables)
* [Bigtable 액세스 자격 증명 생성](https://developers.google.com/workspace/guides/create-credentials)

런타임 환경에서 데이터베이스 액세스가 확인되면 다음 값을 입력하고 예제 스크립트를 실행하기 전에 셀을 실행하세요.

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-bigtable` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**Colab only**: 다음 셀의 주석을 해제하거나 커널을 다시 시작하는 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud 프로젝트 설정

이 노트북에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정하세요.

프로젝트 ID를 모르는 경우 다음을 시도해 보세요:

* `gcloud config list`를 실행합니다.
* `gcloud projects list`를 실행합니다.
* [프로젝트 ID 찾기](https://support.google.com/googleapi/answer/7014113) 지원 페이지를 참조하세요.

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 인증

이 노트북에 로그인된 IAM 사용자로 Google Cloud에 인증하여 Google Cloud 프로젝트에 액세스합니다.

- Colab을 사용하여 이 노트북을 실행하는 경우 아래 셀을 사용하고 계속하세요.
- Vertex AI Workbench를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth

auth.authenticate_user()
```

## 기본 사용법

### Saver 사용하기

`BigtableSaver.add_documents(<documents>)`를 사용하여 langchain 문서를 저장합니다. `BigtableSaver` 클래스를 초기화하려면 2가지가 필요합니다:

1. `instance_id` - Bigtable의 인스턴스입니다.
1. `table_id` - langchain 문서를 저장할 Bigtable 내의 테이블 이름입니다.

```python
from langchain_core.documents import Document
from langchain_google_bigtable import BigtableSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]

saver = BigtableSaver(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

saver.add_documents(test_docs)
```

### Bigtable에서 문서 쿼리하기

Bigtable 테이블에 연결하는 방법에 대한 자세한 내용은 [Python SDK 문서](https://cloud.google.com/python/docs/reference/bigtable/latest/client)를 확인하세요.

#### 테이블에서 문서 로드하기

`BigtableLoader.load()` 또는 `BigtableLoader.lazy_load()`를 사용하여 langchain 문서를 로드합니다. `lazy_load`는 반복 중에만 데이터베이스를 쿼리하는 생성기를 반환합니다. `BigtableLoader` 클래스를 초기화하려면 다음이 필요합니다:

1. `instance_id` - Bigtable의 인스턴스입니다.
1. `table_id` - langchain 문서를 저장할 Bigtable 내의 테이블 이름입니다.

```python
from langchain_google_bigtable import BigtableLoader

loader = BigtableLoader(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### 문서 삭제

`BigtableSaver.delete(<documents>)`를 사용하여 Bigtable 테이블에서 langchain 문서 목록을 삭제합니다.

```python
from langchain_google_bigtable import BigtableSaver

docs = loader.load()
print("Documents before delete: ", docs)

onedoc = test_docs[0]
saver.delete([onedoc])
print("Documents after delete: ", loader.load())
```

## 고급 사용법

### 반환된 행 제한하기

반환된 행을 제한하는 두 가지 방법이 있습니다:

1. [필터](https://cloud.google.com/python/docs/reference/bigtable/latest/row-filters) 사용
2. [row_set](https://cloud.google.com/python/docs/reference/bigtable/latest/row-set#google.cloud.bigtable.row_set.RowSet) 사용

```python
import google.cloud.bigtable.row_filters as row_filters

filter_loader = BigtableLoader(
    INSTANCE_ID, TABLE_ID, filter=row_filters.ColumnQualifierRegexFilter(b"os_build")
)


from google.cloud.bigtable.row_set import RowSet

row_set = RowSet()
row_set.add_row_range_from_keys(
    start_key="phone#4c410523#20190501", end_key="phone#4c410523#201906201"
)

row_set_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    row_set=row_set,
)
```

### 사용자 정의 클라이언트

기본적으로 생성된 클라이언트는 admin=True 옵션만 사용하는 기본 클라이언트입니다. 기본이 아닌 클라이언트를 사용하려면 [사용자 정의 클라이언트](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone)를 생성자에 전달할 수 있습니다.

```python
from google.cloud import bigtable

custom_client_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
)
```

### 사용자 정의 콘텐츠

`BigtableLoader`는 `langchain`이라는 열 패밀리가 있고 UTF-8로 인코딩된 값이 포함된 `content`라는 열이 있다고 가정합니다. 이러한 기본값은 다음과 같이 변경할 수 있습니다:

```python
from langchain_google_bigtable import Encoding

custom_content_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
)
```

### 메타데이터 매핑

기본적으로 `Document` 개체의 `metadata` 맵에는 `rowkey`라는 단일 키와 해당 행의 rowkey 값이 포함됩니다. 이 맵에 더 많은 항목을 추가하려면 metadata_mapping을 사용하세요.

```python
import json

from langchain_google_bigtable import MetadataMapping

metadata_mapping_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
)
```

### JSON 메타데이터

Bigtable에 JSON 문자열이 포함된 열이 있어 출력 문서 메타데이터에 추가하려는 경우, BigtableLoader에 다음 매개변수를 추가할 수 있습니다. 참고로 `metadata_as_json_encoding`의 기본값은 UTF-8입니다.

```python
metadata_as_json_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```

### BigtableSaver 사용자 정의

BigtableSaver도 BigtableLoader와 유사하게 사용자 정의가 가능합니다.

```python
saver = BigtableSaver(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```
