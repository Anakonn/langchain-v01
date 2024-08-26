---
translated: true
---

# Azure Blob Storage ファイル

>[Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction)は、業界標準のサーバーメッセージブロック(`SMB`)プロトコル、ネットワークファイルシステム(`NFS`)プロトコル、および`Azure Files REST API`を介してアクセス可能な、クラウド内の完全に管理されたファイル共有を提供します。

これは、Azure Filesからドキュメントオブジェクトを読み込む方法について説明しています。

```python
%pip install --upgrade --quiet  azure-storage-blob
```

```python
from langchain_community.document_loaders import AzureBlobStorageFileLoader
```

```python
loader = AzureBlobStorageFileLoader(
    conn_str="<connection string>",
    container="<container name>",
    blob_name="<blob name>",
)
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpxvave6wl/fake.docx'}, lookup_index=0)]
```
