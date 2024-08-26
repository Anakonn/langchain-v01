---
translated: true
---

# AWS S3 ファイル

>[Amazon Simple Storage Service (Amazon S3)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html)はオブジェクトストレージサービスです。

>[AWS S3 バケット](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)

これは、`AWS S3 ファイル`オブジェクトからドキュメントオブジェクトをロードする方法について説明します。

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

## AWS Boto3 クライアントの設定

AWS [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) クライアントは、S3DirectoryLoader を作成する際に名前付き引数を渡すことで設定できます。
これは、AWS 資格情報を環境変数として設定できない場合に便利です。
設定できるパラメータのリストは[こちら](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session)をご覧ください。

```python
loader = S3FileLoader(
    "testing-hwc", "fake.docx", aws_access_key_id="xxxx", aws_secret_access_key="yyyy"
)
```

```python
loader.load()
```
