---
translated: true
---

# Google Cloud Storage ディレクトリ

>[Google Cloud Storage](https://en.wikipedia.org/wiki/Google_Cloud_Storage)は、構造化されていないデータを保存するための管理されたサービスです。

これは、`Google Cloud Storage (GCS) ディレクトリ (バケット)` からドキュメントオブジェクトを読み込む方法について説明しています。

```python
%pip install --upgrade --quiet  langchain-google-community[gcs]
```

```python
from langchain_google_community import GCSDirectoryLoader
```

```python
loader = GCSDirectoryLoader(project_name="aist", bucket="testing-hwc")
```

```python
loader.load()
```

```output
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpz37njh7u/fake.docx'}, lookup_index=0)]
```

## プレフィックスの指定

より細かい制御のために、ロードするファイルを指定するプレフィックスを指定することもできます - 特定のフォルダからのすべてのファイルをロードするなど。

```python
loader = GCSDirectoryLoader(project_name="aist", bucket="testing-hwc", prefix="fake")
```

```python
loader.load()
```

```output
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpylg6291i/fake.docx'}, lookup_index=0)]
```

## 単一のファイルの読み込みに失敗した場合も続行する

GCSバケット内のファイルは、処理中にエラーが発生する可能性があります。 `continue_on_failure=True` 引数を有効にすると、単一のファイルの処理に失敗しても、機能は中断せず、代わりに警告をログに記録します。

```python
loader = GCSDirectoryLoader(
    project_name="aist", bucket="testing-hwc", continue_on_failure=True
)
```

```python
loader.load()
```
