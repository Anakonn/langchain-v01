---
translated: true
---

# OpenAI 메타데이터 태거

문서의 제목, 톤, 길이 등과 같은 구조화된 메타데이터로 태그를 지정하면 나중에 보다 목표 지향적인 유사성 검색을 할 수 있습니다. 그러나 많은 문서에 대해 이 라벨링 과정을 수동으로 수행하는 것은 지루할 수 있습니다.

`OpenAIMetadataTagger` 문서 변환기는 제공된 스키마에 따라 각 문서에서 메타데이터를 추출하여 이 과정을 자동화합니다. 이는 구성 가능한 `OpenAI Functions` 기반 체인을 사용하므로, 사용자 정의 LLM 인스턴스를 전달하는 경우 기능 지원이 있는 `OpenAI` 모델이어야 합니다.

**참고:** 이 문서 변환기는 완전한 문서에서 가장 잘 작동하므로, 다른 분할이나 처리를 하기 전에 전체 문서와 함께 먼저 실행하는 것이 좋습니다!

예를 들어, 영화 리뷰 세트를 색인화하려고 한다고 가정해 봅시다. 유효한 `JSON Schema` 객체로 문서 변환기를 다음과 같이 초기화할 수 있습니다:

```python
from langchain_community.document_transformers.openai_functions import (
    create_metadata_tagger,
)
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
```

```python
schema = {
    "properties": {
        "movie_title": {"type": "string"},
        "critic": {"type": "string"},
        "tone": {"type": "string", "enum": ["positive", "negative"]},
        "rating": {
            "type": "integer",
            "description": "The number of stars the critic rated the movie",
        },
    },
    "required": ["movie_title", "critic", "tone"],
}

# Must be an OpenAI model that supports functions
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")

document_transformer = create_metadata_tagger(metadata_schema=schema, llm=llm)
```

그런 다음 문서 변환기에 문서 목록을 전달하면 콘텐츠에서 메타데이터를 추출합니다:

```python
original_documents = [
    Document(
        page_content="Review of The Bee Movie\nBy Roger Ebert\n\nThis is the greatest movie ever made. 4 out of 5 stars."
    ),
    Document(
        page_content="Review of The Godfather\nBy Anonymous\n\nThis movie was super boring. 1 out of 5 stars.",
        metadata={"reliable": False},
    ),
]

enhanced_documents = document_transformer.transform_documents(original_documents)
```

```python
import json

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```

새 문서는 벡터 저장소에 로드되기 전에 텍스트 분할기에 의해 추가로 처리될 수 있습니다. 추출된 필드는 기존 메타데이터를 덮어쓰지 않습니다.

또한 Pydantic 스키마로 문서 변환기를 초기화할 수도 있습니다:

```python
from typing import Literal

from pydantic import BaseModel, Field


class Properties(BaseModel):
    movie_title: str
    critic: str
    tone: Literal["positive", "negative"]
    rating: int = Field(description="Rating out of 5 stars")


document_transformer = create_metadata_tagger(Properties, llm)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```

## 커스터마이제이션

문서 변환기 생성자에서 표준 LLMChain 인수를 기본 태그 체인에 전달할 수 있습니다. 예를 들어, 입력 문서에서 특정 세부 사항에 집중하거나 특정 스타일로 메타데이터를 추출하도록 LLM에 요청하려는 경우 사용자 정의 프롬프트를 전달할 수 있습니다:

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    """Extract relevant information from the following text.
Anonymous critics are actually Roger Ebert.

{input}
"""
)

document_transformer = create_metadata_tagger(schema, llm, prompt=prompt)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Roger Ebert", "tone": "negative", "rating": 1, "reliable": false}
```
