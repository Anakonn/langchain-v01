---
translated: true
---

# 락셋(Rockset)

> 락셋은 운영상의 부담 없이 대규모 반구조화된 데이터에 대한 쿼리를 가능하게 하는 실시간 분석 데이터베이스입니다. 락셋에서는 수집된 데이터가 1초 내에 쿼리 가능하며, 해당 데이터에 대한 분석 쿼리는 일반적으로 밀리초 내에 실행됩니다. 락셋은 컴퓨팅 최적화가 되어 있어 100TB 미만 범위의 고 동시성 애플리케이션 서비스에 적합하며(또는 롤업을 통해 100TB 이상의 데이터도 처리 가능합니다).

이 노트북은 랭체인에서 락셋을 문서 로더로 사용하는 방법을 보여줍니다. 시작하려면 락셋 계정과 API 키가 필요합니다.

## 환경 설정

1. [락셋 콘솔](https://console.rockset.com/apikeys)에 가서 API 키를 얻으세요. [API 참조](https://rockset.com/docs/rest-api/#introduction)에서 API 리전을 찾으세요. 이 노트북에서는 `Oregon(us-west-2)` 리전을 사용한다고 가정합니다.
2. `ROCKSET_API_KEY` 환경 변수를 설정하세요.
3. 랭체인에서 락셋 데이터베이스와 상호 작용하는 데 사용되는 락셋 Python 클라이언트를 설치하세요.

```python
%pip install --upgrade --quiet  rockset
```

# 문서 로드하기

랭체인의 락셋 통합을 통해 SQL 쿼리로 락셋 컬렉션에서 문서를 로드할 수 있습니다. 이를 위해 `RocksetLoader` 객체를 구성해야 합니다. 다음은 `RocksetLoader`를 초기화하는 예제 코드입니다.

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 3"),  # SQL query
    ["text"],  # content columns
    metadata_keys=["id", "date"],  # metadata columns
)
```

여기서 다음과 같은 쿼리가 실행됩니다:

```sql
SELECT * FROM langchain_demo LIMIT 3
```

컬렉션의 `text` 열이 페이지 내용으로 사용되며, 레코드의 `id` 및 `date` 열이 메타데이터로 사용됩니다(메타데이터 키를 전달하지 않으면 전체 락셋 문서가 메타데이터로 사용됩니다).

쿼리를 실행하고 결과 `Document`의 반복기에 액세스하려면 다음을 실행하세요:

```python
loader.lazy_load()
```

쿼리를 실행하고 한 번에 모든 결과 `Document`에 액세스하려면 다음을 실행하세요:

```python
loader.load()
```

`loader.load()`의 예제 응답은 다음과 같습니다:

```python
[
    Document(
        page_content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a libero porta, dictum ipsum eget, hendrerit neque. Morbi blandit, ex ut suscipit viverra, enim velit tincidunt tellus, a tempor velit nunc et ex. Proin hendrerit odio nec convallis lobortis. Aenean in purus dolor. Vestibulum orci orci, laoreet eget magna in, commodo euismod justo.",
        metadata={"id": 83209, "date": "2022-11-13T18:26:45.000000Z"}
    ),
    Document(
        page_content="Integer at finibus odio. Nam sit amet enim cursus lacus gravida feugiat vestibulum sed libero. Aenean eleifend est quis elementum tincidunt. Curabitur sit amet ornare erat. Nulla id dolor ut magna volutpat sodales fringilla vel ipsum. Donec ultricies, lacus sed fermentum dignissim, lorem elit aliquam ligula, sed suscipit sapien purus nec ligula.",
        metadata={"id": 89313, "date": "2022-11-13T18:28:53.000000Z"}
    ),
    Document(
        page_content="Morbi tortor enim, commodo id efficitur vitae, fringilla nec mi. Nullam molestie faucibus aliquet. Praesent a est facilisis, condimentum justo sit amet, viverra erat. Fusce volutpat nisi vel purus blandit, et facilisis felis accumsan. Phasellus luctus ligula ultrices tellus tempor hendrerit. Donec at ultricies leo.",
        metadata={"id": 87732, "date": "2022-11-13T18:49:04.000000Z"}
    )
]
```

## 여러 열을 콘텐츠로 사용하기

여러 열을 콘텐츠로 사용할 수 있습니다:

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],  # TWO content columns
)
```

"sentence1" 필드가 `"This is the first sentence."`이고 "sentence2" 필드가 `"This is the second sentence."`라고 가정하면, 결과 `Document`의 `page_content`는 다음과 같습니다:

```output
This is the first sentence.
This is the second sentence.
```

`content_columns_joiner` 인수를 사용하여 콘텐츠 열을 결합하는 사용자 정의 함수를 정의할 수 있습니다. `content_columns_joiner`는 (열 이름, 열 값) 튜플의 목록인 `List[Tuple[str, Any]]]`를 인수로 받는 메서드입니다. 기본적으로 이 메서드는 각 열 값을 새 줄로 연결합니다.

예를 들어 sentence1과 sentence2를 새 줄 대신 공백으로 연결하려면 `content_columns_joiner`를 다음과 같이 설정할 수 있습니다:

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: " ".join(
        [doc[1] for doc in docs]
    ),  # join with space instead of /n
)
```

그러면 결과 `Document`의 `page_content`는 다음과 같습니다:

```output
This is the first sentence. This is the second sentence.
```

종종 열 이름을 `page_content`에 포함하고 싶을 수 있습니다. 다음과 같이 할 수 있습니다:

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: "\n".join(
        [f"{doc[0]}: {doc[1]}" for doc in docs]
    ),
)
```

그러면 다음과 같은 `page_content`가 생성됩니다:

```output
sentence1: This is the first sentence.
sentence2: This is the second sentence.
```
