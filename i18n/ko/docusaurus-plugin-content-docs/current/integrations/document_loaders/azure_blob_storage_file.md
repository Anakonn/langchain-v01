---
translated: true
---

# Azure Blob Storage 파일

>[Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction)는 업계 표준 Server Message Block(`SMB`) 프로토콜, Network File System(`NFS`) 프로토콜 및 `Azure Files REST API`를 통해 액세스할 수 있는 완전히 관리되는 클라우드 파일 공유를 제공합니다.  

이것은 Azure Files에서 문서 개체를 로드하는 방법을 다룹니다.  

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

