---
translated: true
---

# AWS S3 ディレクトリ

>[Amazon Simple Storage Service (Amazon S3)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html)はオブジェクトストレージサービスです

>[AWS S3 ディレクトリ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html)

これは、`AWS S3 ディレクトリ`オブジェクトからドキュメントオブジェクトをロードする方法について説明します。

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.document_loaders import S3DirectoryLoader
```

```python
loader = S3DirectoryLoader("testing-hwc")
```

```python
loader.load()
```

## プレフィックスの指定

より細かい制御のために、ロードするファイルを指定するプレフィックスを設定することもできます。

```python
loader = S3DirectoryLoader("testing-hwc", prefix="fake")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 's3://testing-hwc/fake.docx'}, lookup_index=0)]
```

## AWS Boto3クライアントの設定

S3DirectoryLoaderを作成する際に、名前付き引数を渡すことで、AWS [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)クライアントを設定できます。
これは、AWS資格情報を環境変数として設定できない場合に便利です。
設定可能なパラメータのリストは[こちら](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session)をご覧ください。

```python
loader = S3DirectoryLoader(
    "testing-hwc", aws_access_key_id="xxxx", aws_secret_access_key="yyyy"
)
```

```python
loader.load()
```
