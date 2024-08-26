---
sidebar_position: 3
title: 파일 처리
translated: true
---

원시 텍스트 데이터 외에도 PowerPoint 프레젠테이션이나 PDF와 같은 다른 파일 유형에서 정보를 추출해야 할 수 있습니다.

LangChain [문서 로더](/docs/modules/data_connection/document_loaders/)를 사용하여 파일을 LLM에 입력할 수 있는 텍스트 형식으로 구문 분석할 수 있습니다.

LangChain은 다양한 [문서 로더 통합](/docs/integrations/document_loaders)을 제공합니다.

## MIME 타입 기반 구문 분석

기본 구문 분석 예제는 [문서 로더](/docs/modules/data_connection/document_loaders/)를 참조하세요.

여기서는 사용자 업로드 파일을 수락하는 서버 코드를 작성할 때 유용한 MIME 타입 기반 구문 분석을 살펴보겠습니다.

이 경우, 사용자가 제공한 파일의 파일 확장자가 잘못되었을 수 있다고 가정하고 대신 파일의 바이너리 콘텐츠에서 MIME 타입을 추론하는 것이 좋습니다.

일부 콘텐츠를 다운로드해 보겠습니다. 이것은 HTML 파일이지만 아래 코드는 다른 파일 유형에서도 작동합니다.

```python
import requests

response = requests.get("https://en.wikipedia.org/wiki/Car")
data = response.content
data[:20]
```

```output
b'<!DOCTYPE html>\n<htm'
```

구문 분석기를 구성합니다.

```python
import magic
from langchain.document_loaders.parsers import BS4HTMLParser, PDFMinerParser
from langchain.document_loaders.parsers.generic import MimeTypeBasedParser
from langchain.document_loaders.parsers.txt import TextParser
from langchain_community.document_loaders import Blob

# MIME 타입별로 사용할 구문 분석기를 구성합니다.

HANDLERS = {
    "application/pdf": PDFMinerParser(),
    "text/plain": TextParser(),
    "text/html": BS4HTMLParser(),
}

# 주어진 구문 분석기로 MIME 타입 기반 구문 분석기를 인스턴스화합니다.

MIMETYPE_BASED_PARSER = MimeTypeBasedParser(
    handlers=HANDLERS,
    fallback_parser=None,
)

mime = magic.Magic(mime=True)
mime_type = mime.from_buffer(data)

# Blob은 파일 시스템의 경로(참조)나 메모리의 바이트 값으로 바이너리 데이터를 나타냅니다.

blob = Blob.from_data(
    data=data,
    mime_type=mime_type,
)

parser = HANDLERS[mime_type]
documents = parser.parse(blob=blob)
```

```python
print(documents[0].page_content[:30].strip())
```

```output
Car - Wikipedia
```