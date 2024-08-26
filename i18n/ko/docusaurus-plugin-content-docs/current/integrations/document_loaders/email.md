---
translated: true
---

# 이메일

이 노트북은 이메일 (`.eml`) 또는 `Microsoft Outlook` (`.msg`) 파일을 로드하는 방법을 보여줍니다.

## Unstructured 사용하기

```python
%pip install --upgrade --quiet  unstructured
```

```python
from langchain_community.document_loaders import UnstructuredEmailLoader
```

```python
loader = UnstructuredEmailLoader("example_data/fake-email.eml")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='This is a test email to use for unit tests.\n\nImportant points:\n\nRoses are red\n\nViolets are blue', metadata={'source': 'example_data/fake-email.eml'})]
```

### 요소 유지하기

내부적으로 Unstructured는 다양한 텍스트 조각에 대해 서로 다른 "요소"를 만듭니다. 기본적으로 우리는 이를 결합하지만, `mode="elements"`를 지정하여 이 구분을 쉽게 유지할 수 있습니다.

```python
loader = UnstructuredEmailLoader("example_data/fake-email.eml", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to use for unit tests.', metadata={'source': 'example_data/fake-email.eml', 'filename': 'fake-email.eml', 'file_directory': 'example_data', 'date': '2022-12-16T17:04:16-05:00', 'filetype': 'message/rfc822', 'sent_from': ['Matthew Robinson <mrobinson@unstructured.io>'], 'sent_to': ['Matthew Robinson <mrobinson@unstructured.io>'], 'subject': 'Test Email', 'category': 'NarrativeText'})
```

### 첨부 파일 처리하기

`UnstructuredEmailLoader` 생성자에서 `process_attachments=True`를 설정하여 첨부 파일을 처리할 수 있습니다. 기본적으로 첨부 파일은 `unstructured`의 `partition` 함수를 사용하여 분할됩니다. `attachment_partitioner` 키워드 인수를 사용하여 다른 분할 함수를 사용할 수 있습니다.

```python
loader = UnstructuredEmailLoader(
    "example_data/fake-email.eml",
    mode="elements",
    process_attachments=True,
)
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to use for unit tests.', metadata={'source': 'example_data/fake-email.eml', 'filename': 'fake-email.eml', 'file_directory': 'example_data', 'date': '2022-12-16T17:04:16-05:00', 'filetype': 'message/rfc822', 'sent_from': ['Matthew Robinson <mrobinson@unstructured.io>'], 'sent_to': ['Matthew Robinson <mrobinson@unstructured.io>'], 'subject': 'Test Email', 'category': 'NarrativeText'})
```

## OutlookMessageLoader 사용하기

```python
%pip install --upgrade --quiet  extract_msg
```

```python
from langchain_community.document_loaders import OutlookMessageLoader
```

```python
loader = OutlookMessageLoader("example_data/fake-email.msg")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to experiment with the MS Outlook MSG Extractor\r\n\r\n\r\n-- \r\n\r\n\r\nKind regards\r\n\r\n\r\n\r\n\r\nBrian Zhou\r\n\r\n', metadata={'subject': 'Test for TIF files', 'sender': 'Brian Zhou <brizhou@gmail.com>', 'date': 'Mon, 18 Nov 2013 16:26:24 +0800'})
```
