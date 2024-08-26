---
translated: true
---

# Google Cloud Storage ファイル

>[Google Cloud Storage](https://en.wikipedia.org/wiki/Google_Cloud_Storage)は、非構造化データを保存するためのマネージドサービスです。

これは、`Google Cloud Storage (GCS)ファイルオブジェクト(blob)`からドキュメントオブジェクトをロードする方法について説明します。

```python
%pip install --upgrade --quiet  langchain-google-community[gcs]
```

```python
from langchain_google_community import GCSFileLoader
```

```python
loader = GCSFileLoader(project_name="aist", bucket="testing-hwc", blob="fake.docx")
```

```python
loader.load()
```

```output
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmp3srlf8n8/fake.docx'}, lookup_index=0)]
```

代替のローダーを使用したい場合は、カスタム関数を提供することができます。

```python
from langchain_community.document_loaders import PyPDFLoader


def load_pdf(file_path):
    return PyPDFLoader(file_path)


loader = GCSFileLoader(
    project_name="aist", bucket="testing-hwc", blob="fake.pdf", loader_func=load_pdf
)
```
