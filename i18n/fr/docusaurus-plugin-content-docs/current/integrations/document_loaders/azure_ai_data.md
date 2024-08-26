---
translated: true
---

# Azure AI Data

>[Azure AI Studio](https://ai.azure.com/) permet de télécharger des actifs de données dans le stockage cloud et d'enregistrer des actifs de données existants à partir des sources suivantes :
>
>- `Microsoft OneLake`
>- `Azure Blob Storage`
>- `Azure Data Lake gen 2`

L'avantage de cette approche par rapport à `AzureBlobStorageContainerLoader` et `AzureBlobStorageFileLoader` est que l'authentification est gérée de manière transparente pour le stockage cloud. Vous pouvez utiliser un contrôle d'accès aux données basé sur l'identité ou un contrôle d'accès aux données basé sur les informations d'identification (par exemple, un jeton SAS, une clé de compte). Dans le cas d'un accès aux données basé sur les informations d'identification, vous n'avez pas besoin de spécifier de secrets dans votre code ou de configurer des coffres-forts de clés - le système s'en charge pour vous.

Ce notebook couvre comment charger des objets de document à partir d'un actif de données dans AI Studio.

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

## Spécification d'un modèle glob

Vous pouvez également spécifier un modèle glob pour un contrôle plus fin sur les fichiers à charger. Dans l'exemple ci-dessous, seuls les fichiers avec une extension `pdf` seront chargés.

```python
loader = AzureAIDataLoader(url=data_asset.path, glob="*.pdf")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```
