---
translated: true
---

# AWS S3 파일

>[Amazon Simple Storage Service (Amazon S3)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html)는 객체 스토리지 서비스입니다.

>[AWS S3 버킷](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)

이것은 `AWS S3 파일` 객체에서 문서 객체를 로드하는 방법을 다룹니다.

```python
from langchain_community.document_loaders import S3FileLoader
```

```python
%pip install --upgrade --quiet  boto3
```

```python
loader = S3FileLoader("testing-hwc", "fake.docx")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 's3://testing-hwc/fake.docx'}, lookup_index=0)]
```

## AWS Boto3 클라이언트 구성하기

AWS [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) 클라이언트는 S3DirectoryLoader를 생성할 때 이름 지정 인수를 전달하여 구성할 수 있습니다.
이는 AWS 자격 증명을 환경 변수로 설정할 수 없는 경우에 유용합니다.
구성할 수 있는 [매개변수 목록](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session)을 참조하세요.


```python
loader = S3FileLoader(
    "testing-hwc", "fake.docx", aws_access_key_id="xxxx", aws_secret_access_key="yyyy"
)
```


```python
loader.load()
```

