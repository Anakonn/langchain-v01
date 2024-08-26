---
translated: true
---

# Azure AI データ

>[Azure AI Studio](https://ai.azure.com/)は、クラウドストレージにデータアセットをアップロードし、次のソースから既存のデータアセットを登録する機能を提供します:
>
>- `Microsoft OneLake`
>- `Azure Blob Storage`
>- `Azure Data Lake gen 2`

この方法の利点は、クラウドストレージの認証が自動的に処理されることです。*ID ベースの*データアクセス制御または*資格情報ベースの*(SAS トークン、アカウントキーなど)データアクセスを使用できます。資格情報ベースのデータアクセスの場合、コードにシークレットを指定したり、キー コンテナーを設定する必要はありません - システムがそれを処理します。

このノートブックでは、AI Studio のデータアセットからドキュメントオブジェクトをロードする方法を説明します。

```python
%pip install --upgrade --quiet  azureml-fsspec, azure-ai-generative
```

```python
from azure.ai.resources.client import AIClient
from azure.identity import DefaultAzureCredential
from langchain_community.document_loaders import AzureAIDataLoader
```

```python
# Create a connection to your project
client = AIClient(
    credential=DefaultAzureCredential(),
    subscription_id="<subscription_id>",
    resource_group_name="<resource_group_name>",
    project_name="<project_name>",
)
```

```python
# get the latest version of your data asset
data_asset = client.data.get(name="<data_asset_name>", label="latest")
```

```python
# load the data asset
loader = AzureAIDataLoader(url=data_asset.path)
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpaa9xl6ch/fake.docx'}, lookup_index=0)]
```

## グロブパターンの指定

ファイルのロードをより細かく制御するために、グロブパターンを指定することもできます。以下の例では、`pdf`拡張子のファイルのみがロードされます。

```python
loader = AzureAIDataLoader(url=data_asset.path, glob="*.pdf")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```
