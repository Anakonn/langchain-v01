---
translated: true
---

# Azure AI Data

>[Azure AI Studio](https://ai.azure.com/) proporciona la capacidad de cargar activos de datos en el almacenamiento en la nube y registrar activos de datos existentes de las siguientes fuentes:

>- `Microsoft OneLake`
>- `Azure Blob Storage`
>- `Azure Data Lake gen 2`

El beneficio de este enfoque sobre `AzureBlobStorageContainerLoader` y `AzureBlobStorageFileLoader` es que la autenticación se maneja sin problemas en el almacenamiento en la nube. Puede usar el control de acceso a los datos *basado en identidad* o *basado en credenciales* (por ejemplo, token de SAS, clave de cuenta). En el caso del acceso a datos basado en credenciales, no necesita especificar secretos en su código ni configurar bóvedas de claves: el sistema se encarga de eso por usted.

Este cuaderno cubre cómo cargar objetos de documento desde un activo de datos en AI Studio.

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

## Especificar un patrón glob

También puede especificar un patrón glob para un control más detallado sobre qué archivos cargar. En el ejemplo a continuación, solo se cargarán los archivos con extensión `pdf`.

```python
loader = AzureAIDataLoader(url=data_asset.path, glob="*.pdf")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```
