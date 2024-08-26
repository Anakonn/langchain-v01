---
translated: true
---

# Azure Blob Storage 컨테이너

> [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)는 Microsoft의 클라우드 객체 스토리지 솔루션입니다. Blob Storage는 대량의 비정형 데이터를 저장하는 데 최적화되어 있습니다. 비정형 데이터는 텍스트 또는 이진 데이터와 같이 특정 데이터 모델이나 정의를 따르지 않는 데이터입니다.

`Azure Blob Storage`는 다음과 같은 용도로 설계되었습니다:

- 브라우저에 직접 이미지 또는 문서 제공
- 분산 액세스를 위한 파일 저장
- 비디오 및 오디오 스트리밍
- 로그 파일 작성
- 백업, 재해 복구 및 보관을 위한 데이터 저장
- 온-프레미스 또는 Azure 호스팅 서비스에 의한 데이터 분석을 위한 데이터 저장  
  이 노트북에서는 `Azure Blob Storage` 컨테이너에서 문서 객체를 로드하는 방법을 다룹니다.

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

## 접두사 지정

파일 로드 범위를 더 세부적으로 제어하기 위해 접두사를 지정할 수 있습니다.

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

