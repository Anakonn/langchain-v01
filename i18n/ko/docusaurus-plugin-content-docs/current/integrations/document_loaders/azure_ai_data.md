---
translated: true
---

# Azure AI 데이터

>[Azure AI Studio](https://ai.azure.com/)는 클라우드 스토리지에 데이터 자산을 업로드하고 다음 소스에서 기존 데이터 자산을 등록할 수 있는 기능을 제공합니다:

>

>- `Microsoft OneLake`

>- `Azure Blob Storage`

>- `Azure Data Lake gen 2`  

이 접근 방식의 장점은 `AzureBlobStorageContainerLoader` 및 `AzureBlobStorageFileLoader`와 달리 클라우드 스토리지에 대한 인증이 원활하게 처리된다는 것입니다. *ID 기반* 데이터 액세스 제어 또는 *자격 증명 기반*(예: SAS 토큰, 계정 키) 데이터 액세스를 사용할 수 있습니다. 자격 증명 기반 데이터 액세스의 경우 코드에 비밀을 지정하거나 키 볼트를 설정할 필요가 없습니다 - 시스템에서 이를 처리합니다.  
이 노트북에서는 AI Studio의 데이터 자산에서 문서 개체를 로드하는 방법을 다룹니다.  

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

## 글로브 패턴 지정하기

더 세부적인 제어를 위해 글로브 패턴을 지정할 수 있습니다. 아래 예시에서는 `pdf` 확장자를 가진 파일만 로드됩니다.


```python
loader = AzureAIDataLoader(url=data_asset.path, glob="*.pdf")
```  

```python
loader.load()
```  

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```

