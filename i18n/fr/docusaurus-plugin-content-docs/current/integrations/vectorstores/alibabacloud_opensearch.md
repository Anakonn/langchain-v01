---
translated: true
---

# Alibaba Cloud OpenSearch

>[Alibaba Cloud Opensearch](https://www.alibabacloud.com/product/opensearch) est une plateforme tout-en-un pour développer des services de recherche intelligente. `OpenSearch` a été construit sur le moteur de recherche distribué à grande échelle développé par `Alibaba`. `OpenSearch` sert plus de 500 cas d'utilisation au sein du groupe Alibaba et des milliers de clients Alibaba Cloud. `OpenSearch` aide à développer des services de recherche dans différents scénarios de recherche, y compris le commerce électronique, O2O, le multimédia, l'industrie du contenu, les communautés et forums, et la requête de big data dans les entreprises.

>`OpenSearch` vous aide à développer des services de recherche intelligents de haute qualité, sans maintenance et à haute performance pour offrir à vos utilisateurs une grande efficacité et précision de recherche.

>`OpenSearch` fournit la fonctionnalité de recherche vectorielle. Dans des scénarios spécifiques, en particulier les scénarios de recherche de questions de test et de recherche d'images, vous pouvez utiliser la fonctionnalité de recherche vectorielle avec la fonctionnalité de recherche multimodale pour améliorer la précision des résultats de recherche.

Ce notebook montre comment utiliser les fonctionnalités liées à `Alibaba Cloud OpenSearch Vector Search Edition`.

## Configuration

### Acheter une instance et la configurer

Achetez OpenSearch Vector Search Edition chez [Alibaba Cloud](https://opensearch.console.aliyun.com) et configurez l'instance selon la [documentation](https://help.aliyun.com/document_detail/463198.html?spm=a2c4g.465092.0.0.2cd15002hdwavO) d'aide.

Pour fonctionner, vous devez avoir une instance [OpenSearch Vector Search Edition](https://opensearch.console.aliyun.com) opérationnelle.

### Classe Alibaba Cloud OpenSearch Vector Store

                                                                                                                La classe `AlibabaCloudOpenSearch` prend en charge les fonctions :
- `add_texts`
- `add_documents`
- `from_texts`
- `from_documents`
- `similarity_search`
- `asimilarity_search`
- `similarity_search_by_vector`
- `asimilarity_search_by_vector`
- `similarity_search_with_relevance_scores`
- `delete_doc_by_texts`

Lisez le [document d'aide](https://www.alibabacloud.com/help/en/opensearch/latest/vector-search) pour vous familiariser rapidement et configurer l'instance OpenSearch Vector Search Edition.

Si vous rencontrez des problèmes lors de l'utilisation, n'hésitez pas à contacter xingshaomin.xsm@alibaba-inc.com, et nous ferons de notre mieux pour vous fournir assistance et support.

Une fois l'instance opérationnelle, suivez ces étapes pour diviser les documents, obtenir des embeddings, se connecter à l'instance Alibaba Cloud OpenSearch, indexer des documents et effectuer une récupération vectorielle.

Nous devons d'abord installer les packages Python suivants.

```python
%pip install --upgrade --quiet  alibabacloud_ha3engine_vector
```

Nous voulons utiliser `OpenAIEmbeddings`, nous devons donc obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Exemple

```python
from langchain_community.vectorstores import (
    AlibabaCloudOpenSearch,
    AlibabaCloudOpenSearchSettings,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Diviser les documents et obtenir des embeddings.

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Créer des paramètres opensearch.

```python
settings = AlibabaCloudOpenSearchSettings(
    endpoint=" The endpoint of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    instance_id="The identify of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    protocol="Communication Protocol between SDK and Server, default is http.",
    username="The username specified when purchasing the instance.",
    password="The password specified when purchasing the instance.",
    namespace="The instance data will be partitioned based on the namespace field. If the namespace is enabled, you need to specify the namespace field name during initialization. Otherwise, the queries cannot be executed correctly.",
    tablename="The table name specified during instance configuration.",
    embedding_field_separator="Delimiter specified for writing vector field data, default is comma.",
    output_fields="Specify the field list returned when invoking OpenSearch, by default it is the value list of the field mapping field.",
    field_name_mapping={
        "id": "id",  # The id field name mapping of index document.
        "document": "document",  # The text field name mapping of index document.
        "embedding": "embedding",  # The embedding field name mapping of index document.
        "name_of_the_metadata_specified_during_search": "opensearch_metadata_field_name,=",
        # The metadata field name mapping of index document, could specify multiple, The value field contains mapping name and operator, the operator would be used when executing metadata filter query,
        # Currently supported logical operators are: > (greater than), < (less than), = (equal to), <= (less than or equal to), >= (greater than or equal to), != (not equal to).
        # Refer to this link: https://help.aliyun.com/zh/open-search/vector-search-edition/filter-expression
    },
)

# for example

# settings = AlibabaCloudOpenSearchSettings(
#     endpoint='ha-cn-5yd3fhdm102.public.ha.aliyuncs.com',
#     instance_id='ha-cn-5yd3fhdm102',
#     username='instance user name',
#     password='instance password',
#     table_name='test_table',
#     field_name_mapping={
#         "id": "id",
#         "document": "document",
#         "embedding": "embedding",
#         "string_field": "string_filed,=",
#         "int_field": "int_filed,=",
#         "float_field": "float_field,=",
#         "double_field": "double_field,="
#
#     },
# )
```

Créer une instance d'accès opensearch par paramètres.

```python
# Create an opensearch instance and index docs.
opensearch = AlibabaCloudOpenSearch.from_texts(
    texts=docs, embedding=embeddings, config=settings
)
```

ou

```python
# Create an opensearch instance.
opensearch = AlibabaCloudOpenSearch(embedding=embeddings, config=settings)
```

Ajouter des textes et construire l'index.

```python
metadatas = [
    {"string_field": "value1", "int_field": 1, "float_field": 1.0, "double_field": 2.0},
    {"string_field": "value2", "int_field": 2, "float_field": 3.0, "double_field": 4.0},
    {"string_field": "value3", "int_field": 3, "float_field": 5.0, "double_field": 6.0},
]
# the key of metadatas must match field_name_mapping in settings.
opensearch.add_texts(texts=docs, ids=[], metadatas=metadatas)
```

Interroger et récupérer des données.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = opensearch.similarity_search(query)
print(docs[0].page_content)
```

Interroger et récupérer des données avec des métadonnées.

```python
query = "What did the president say about Ketanji Brown Jackson"
metadata = {
    "string_field": "value1",
    "int_field": 1,
    "float_field": 1.0,
    "double_field": 2.0,
}
docs = opensearch.similarity_search(query, filter=metadata)
print(docs[0].page_content)
```

Si vous rencontrez des problèmes lors de l'utilisation, n'hésitez pas à contacter <xingshaomin.xsm@alibaba-inc.com>, et nous ferons de notre mieux pour vous fournir assistance et support.
