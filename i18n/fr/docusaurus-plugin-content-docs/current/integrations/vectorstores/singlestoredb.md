---
translated: true
---

# SingleStoreDB

>[SingleStoreDB](https://singlestore.com/) est une solution de base de données SQL distribuée robuste et haute performance conçue pour exceller dans les environnements [cloud](https://www.singlestore.com/cloud/) et sur site. Avec un ensemble de fonctionnalités polyvalentes, elle offre des options de déploiement transparentes tout en offrant des performances inégalées.

Une caractéristique remarquable de SingleStoreDB est son support avancé pour le stockage et les opérations vectoriels, en faire un choix idéal pour les applications nécessitant des capacités d'IA complexes comme la correspondance de similarité de texte. Avec des fonctions vectorielles intégrées comme [dot_product](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/dot_product.html) et [euclidean_distance](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/euclidean_distance.html), SingleStoreDB permet aux développeurs de mettre en œuvre efficacement des algorithmes sophistiqués.

Pour les développeurs désireux d'exploiter les données vectorielles dans SingleStoreDB, un tutoriel complet est disponible, les guidant à travers les subtilités du [travail avec les données vectorielles](https://docs.singlestore.com/managed-service/en/developer-resources/functional-extensions/working-with-vector-data.html). Ce tutoriel plonge dans le Vector Store de SingleStoreDB, montrant sa capacité à faciliter les recherches basées sur la similarité vectorielle. En tirant parti des index vectoriels, les requêtes peuvent être exécutées à une vitesse remarquable, permettant une récupération rapide des données pertinentes.

De plus, le Vector Store de SingleStoreDB s'intègre parfaitement à l'[indexation de texte intégral basée sur Lucene](https://docs.singlestore.com/cloud/developer-resources/functional-extensions/working-with-full-text-search/), permettant des recherches de similarité de texte puissantes. Les utilisateurs peuvent filtrer les résultats de recherche en fonction des champs sélectionnés des objets de métadonnées de documents, améliorant la précision des requêtes.

Ce qui distingue SingleStoreDB, c'est sa capacité à combiner de diverses manières les recherches vectorielles et de texte intégral, offrant flexibilité et polyvalence. Que ce soit le préfiltrage par similarité de texte ou de vecteur et la sélection des données les plus pertinentes, ou l'utilisation d'une approche de somme pondérée pour calculer un score de similarité final, les développeurs ont plusieurs options à leur disposition.

En essence, SingleStoreDB fournit une solution complète pour la gestion et l'interrogation des données vectorielles, offrant des performances et une flexibilité inégalées pour les applications pilotées par l'IA.

```python
# Establishing a connection to the database is facilitated through the singlestoredb Python connector.
# Please ensure that this connector is installed in your working environment.
%pip install --upgrade --quiet  singlestoredb
```

```python
import getpass
import os

# We want to use OpenAIEmbeddings so we have to get the OpenAI API Key.
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import SingleStoreDB
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

```python
# loading docs
# we will use some artificial data for this example
docs = [
    Document(
        page_content="""In the parched desert, a sudden rainstorm brought relief,
            as the droplets danced upon the thirsty earth, rejuvenating the landscape
            with the sweet scent of petrichor.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Amidst the bustling cityscape, the rain fell relentlessly,
            creating a symphony of pitter-patter on the pavement, while umbrellas
            bloomed like colorful flowers in a sea of gray.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""High in the mountains, the rain transformed into a delicate
            mist, enveloping the peaks in a mystical veil, where each droplet seemed to
            whisper secrets to the ancient rocks below.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Blanketing the countryside in a soft, pristine layer, the
            snowfall painted a serene tableau, muffling the world in a tranquil hush
            as delicate flakes settled upon the branches of trees like nature's own
            lacework.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""In the urban landscape, snow descended, transforming
            bustling streets into a winter wonderland, where the laughter of
            children echoed amidst the flurry of snowballs and the twinkle of
            holiday lights.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""Atop the rugged peaks, snow fell with an unyielding
            intensity, sculpting the landscape into a pristine alpine paradise,
            where the frozen crystals shimmered under the moonlight, casting a
            spell of enchantment over the wilderness below.""",
        metadata={"category": "snow"},
    ),
]

embeddings = OpenAIEmbeddings()
```

Il existe plusieurs façons d'établir une [connexion](https://singlestoredb-python.labs.singlestore.com/generated/singlestoredb.connect.html) à la base de données. Vous pouvez soit configurer des variables d'environnement, soit transmettre des paramètres nommés au constructeur `SingleStoreDB`. Vous pouvez également fournir ces paramètres aux méthodes `from_documents` et `from_texts`.

```python
# Setup connection url as environment variable
os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

# Load documents to the store
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    table_name="notebook",  # use table with a custom name
)
```

```python
query = "trees in the snow"
docs = docsearch.similarity_search(query)  # Find documents that correspond to the query
print(docs[0].page_content)
```

SingleStoreDB améliore les capacités de recherche en permettant aux utilisateurs d'améliorer et d'affiner les résultats de recherche grâce à un préfiltrage basé sur les champs de métadonnées. Cette fonctionnalité permet aux développeurs et aux analystes de données d'affiner les requêtes, en veillant à ce que les résultats de recherche soient parfaitement adaptés à leurs besoins. En filtrant les résultats de recherche à l'aide d'attributs de métadonnées spécifiques, les utilisateurs peuvent restreindre la portée de leurs requêtes, ne se concentrant que sur les sous-ensembles de données pertinents.

```python
query = "trees branches"
docs = docsearch.similarity_search(
    query, filter={"category": "snow"}
)  # Find documents that correspond to the query and has category "snow"
print(docs[0].page_content)
```

Améliorez l'efficacité de vos recherches avec SingleStore DB version 8.5 ou supérieure en tirant parti des [index vectoriels ANN](https://docs.singlestore.com/cloud/reference/sql-reference/vector-functions/vector-indexing/). En définissant `use_vector_index=True` lors de la création de l'objet vector store, vous pouvez activer cette fonctionnalité. De plus, si vos vecteurs ont une dimensionnalité différente de la taille d'intégration OpenAI par défaut de 1536, assurez-vous de spécifier le paramètre `vector_size` en conséquence.

SingleStoreDB présente une gamme diversifiée de stratégies de recherche, chacune soigneusement conçue pour répondre à des cas d'utilisation et des préférences d'utilisateurs spécifiques. La stratégie `VECTOR_ONLY` par défaut utilise des opérations vectorielles telles que `dot_product` ou `euclidean_distance` pour calculer directement les scores de similarité entre les vecteurs, tandis que `TEXT_ONLY` emploie la recherche de texte intégral basée sur Lucene, particulièrement avantageuse pour les applications axées sur le texte. Pour les utilisateurs recherchant une approche équilibrée, `FILTER_BY_TEXT` affine d'abord les résultats en fonction de la similarité du texte avant d'effectuer des comparaisons vectorielles, tandis que `FILTER_BY_VECTOR` donne la priorité à la similarité vectorielle, filtrant les résultats avant d'évaluer la similarité du texte pour obtenir les correspondances optimales. Il est à noter que `FILTER_BY_TEXT` et `FILTER_BY_VECTOR` nécessitent tous deux un index de texte intégral pour fonctionner. De plus, `WEIGHTED_SUM` se présente comme une stratégie sophistiquée, calculant le score de similarité final en pondérant les similarités vectorielles et textuelles, bien qu'elle n'utilise que les calculs de distance `dot_product` et nécessite également un index de texte intégral. Ces stratégies polyvalentes permettent aux utilisateurs d'affiner les recherches en fonction de leurs besoins uniques, facilitant une récupération et une analyse efficaces et précises des données. De plus, les approches hybrides de SingleStoreDB, exemplifiées par les stratégies `FILTER_BY_TEXT`, `FILTER_BY_VECTOR` et `WEIGHTED_SUM`, combinent harmonieusement les recherches vectorielles et basées sur le texte pour maximiser l'efficacité et la précision, garantissant que les utilisateurs puissent exploiter pleinement les capacités de la plateforme pour une large gamme d'applications.

```python
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    distance_strategy=DistanceStrategy.DOT_PRODUCT,  # Use dot product for similarity search
    use_vector_index=True,  # Use vector index for faster search
    use_full_text_search=True,  # Use full text index
)

vectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.VECTOR_ONLY,
    filter={"category": "rain"},
)
print(vectorResults[0].page_content)

textResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.TEXT_ONLY,
)
print(textResults[0].page_content)

filteredByTextResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_TEXT,
    filter_threshold=0.1,
)
print(filteredByTextResults[0].page_content)

filteredByVectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_VECTOR,
    filter_threshold=0.1,
)
print(filteredByVectorResults[0].page_content)

weightedSumResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.WEIGHTED_SUM,
    text_weight=0.2,
    vector_weight=0.8,
)
print(weightedSumResults[0].page_content)
```

## Exemple multimodal : Tirer parti des intégrations CLIP et OpenClip

Dans le domaine de l'analyse de données multimodales, l'intégration de types d'informations diversifiés comme les images et le texte est devenue de plus en plus cruciale. Un outil puissant facilitant cette intégration est [CLIP](https://openai.com/research/clip), un modèle de pointe capable d'intégrer à la fois les images et le texte dans un espace sémantique partagé. Ce faisant, CLIP permet la récupération de contenu pertinent à travers différentes modalités grâce à la recherche par similarité.

Pour illustrer, considérons un scénario d'application où nous visons à analyser efficacement des données multimodales. Dans cet exemple, nous tirons parti des capacités des [intégrations multimodales OpenClip](/docs/integrations/text_embedding/open_clip), qui s'appuient sur le cadre de CLIP. Avec OpenClip, nous pouvons intégrer de manière transparente les descriptions textuelles aux images correspondantes, permettant une analyse et des tâches de récupération complètes. Qu'il s'agisse d'identifier des images visuellement similaires à partir de requêtes textuelles ou de trouver des passages de texte pertinents associés à un contenu visuel spécifique, OpenClip permet aux utilisateurs d'explorer et d'extraire des informations à partir de données multimodales avec une efficacité et une précision remarquables.

```python
%pip install -U langchain openai singlestoredb langchain-experimental # (newest versions required for multi-modal)
```

```python
import os

from langchain_community.vectorstores import SingleStoreDB
from langchain_experimental.open_clip import OpenCLIPEmbeddings

os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

TEST_IMAGES_DIR = "../../modules/images"

docsearch = SingleStoreDB(OpenCLIPEmbeddings())

image_uris = sorted(
    [
        os.path.join(TEST_IMAGES_DIR, image_name)
        for image_name in os.listdir(TEST_IMAGES_DIR)
        if image_name.endswith(".jpg")
    ]
)

# Add images
docsearch.add_images(uris=image_uris)
```
