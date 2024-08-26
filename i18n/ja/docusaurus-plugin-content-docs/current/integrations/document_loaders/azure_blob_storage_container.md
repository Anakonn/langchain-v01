---
translated: true
---

# Azure Blob Storage コンテナー

>[Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)は、クラウド向けのMicrosoftのオブジェクトストレージソリューションです。Blob Storageは、大量の非構造化データを保存するのに最適化されています。非構造化データとは、テキストやバイナリデータのように、特定のデータモデルや定義に従わないデータのことです。

`Azure Blob Storage`は以下のような用途に設計されています:
- ブラウザーへの画像やドキュメントの直接配信
- 分散アクセス用ファイルの保存
- 動画や音声のストリーミング
- ログファイルの書き込み
- バックアップ、災害復旧、アーカイブ用のデータ保存
- オンプレミスまたはAzureホストのサービスによるデータ分析

このノートブックでは、`Azure Blob Storage`のコンテナーからドキュメントオブジェクトをロードする方法を説明します。

```python
%pip install --upgrade --quiet  azure-storage-blob
```

```python
from langchain_community.document_loaders import AzureBlobStorageContainerLoader
```

```python
loader = AzureBlobStorageContainerLoader(conn_str="<conn_str>", container="<container>")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpaa9xl6ch/fake.docx'}, lookup_index=0)]
```

## プレフィックスの指定

プレフィックスを指定することで、ロードするファイルをより細かく制御できます。

```python
loader = AzureBlobStorageContainerLoader(
    conn_str="<conn_str>", container="<container>", prefix="<prefix>"
)
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```
