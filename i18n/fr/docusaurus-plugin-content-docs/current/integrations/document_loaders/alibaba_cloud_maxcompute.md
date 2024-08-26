---
translated: true
---

# Alibaba Cloud MaxCompute

>[Alibaba Cloud MaxCompute](https://www.alibabacloud.com/product/maxcompute) (anciennement connu sous le nom d'ODPS) est une plateforme de traitement de données multi-locataires, entièrement gérée et à usage général pour l'entreposage de données à grande échelle. MaxCompute prend en charge diverses solutions d'importation de données et des modèles de calcul distribués, permettant aux utilisateurs d'interroger efficacement des jeux de données massifs, de réduire les coûts de production et d'assurer la sécurité des données.

Le `MaxComputeLoader` vous permet d'exécuter une requête SQL MaxCompute et de charger les résultats sous forme d'un document par ligne.

```python
%pip install --upgrade --quiet  pyodps
```

```output
Collecting pyodps
  Downloading pyodps-0.11.4.post0-cp39-cp39-macosx_10_9_universal2.whl (2.0 MB)
[2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m2.0/2.0 MB[0m [31m1.7 MB/s[0m eta [36m0:00:00[0m00:01[0m00:01[0m0m
[?25hRequirement already satisfied: charset-normalizer>=2 in /Users/newboy/anaconda3/envs/langchain/lib/python3.9/site-packages (from pyodps) (3.1.0)
Requirement already satisfied: urllib3<2.0,>=1.26.0 in /Users/newboy/anaconda3/envs/langchain/lib/python3.9/site-packages (from pyodps) (1.26.15)
Requirement already satisfied: idna>=2.5 in /Users/newboy/anaconda3/envs/langchain/lib/python3.9/site-packages (from pyodps) (3.4)
Requirement already satisfied: certifi>=2017.4.17 in /Users/newboy/anaconda3/envs/langchain/lib/python3.9/site-packages (from pyodps) (2023.5.7)
Installing collected packages: pyodps
Successfully installed pyodps-0.11.4.post0
```

## Utilisation de base

Pour instancier le chargeur, vous aurez besoin d'une requête SQL à exécuter, de votre point de terminaison MaxCompute et du nom de votre projet, ainsi que de votre ID d'accès et de votre clé d'accès secrète. L'ID d'accès et la clé d'accès secrète peuvent être transmis directement via les paramètres `access_id` et `secret_access_key` ou peuvent être définis en tant que variables d'environnement `MAX_COMPUTE_ACCESS_ID` et `MAX_COMPUTE_SECRET_ACCESS_KEY`.

```python
from langchain_community.document_loaders import MaxComputeLoader
```

```python
base_query = """
SELECT *
FROM (
    SELECT 1 AS id, 'content1' AS content, 'meta_info1' AS meta_info
    UNION ALL
    SELECT 2 AS id, 'content2' AS content, 'meta_info2' AS meta_info
    UNION ALL
    SELECT 3 AS id, 'content3' AS content, 'meta_info3' AS meta_info
) mydata;
"""
```

```python
endpoint = "<ENDPOINT>"
project = "<PROJECT>"
ACCESS_ID = "<ACCESS ID>"
SECRET_ACCESS_KEY = "<SECRET ACCESS KEY>"
```

```python
loader = MaxComputeLoader.from_params(
    base_query,
    endpoint,
    project,
    access_id=ACCESS_ID,
    secret_access_key=SECRET_ACCESS_KEY,
)
data = loader.load()
```

```python
print(data)
```

```output
[Document(page_content='id: 1\ncontent: content1\nmeta_info: meta_info1', metadata={}), Document(page_content='id: 2\ncontent: content2\nmeta_info: meta_info2', metadata={}), Document(page_content='id: 3\ncontent: content3\nmeta_info: meta_info3', metadata={})]
```

```python
print(data[0].page_content)
```

```output
id: 1
content: content1
meta_info: meta_info1
```

```python
print(data[0].metadata)
```

```output
{}
```

## Spécification des colonnes de contenu et de métadonnées

Vous pouvez configurer quel sous-ensemble de colonnes doit être chargé en tant que contenu du document et quel sous-ensemble en tant que métadonnées à l'aide des paramètres `page_content_columns` et `metadata_columns`.

```python
loader = MaxComputeLoader.from_params(
    base_query,
    endpoint,
    project,
    page_content_columns=["content"],  # Specify Document page content
    metadata_columns=["id", "meta_info"],  # Specify Document metadata
    access_id=ACCESS_ID,
    secret_access_key=SECRET_ACCESS_KEY,
)
data = loader.load()
```

```python
print(data[0].page_content)
```

```output
content: content1
```

```python
print(data[0].metadata)
```

```output
{'id': 1, 'meta_info': 'meta_info1'}
```
