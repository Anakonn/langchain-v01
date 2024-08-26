---
translated: true
---

# Clarifai

>[Clarifai](https://www.clarifai.com/) est une plateforme IA qui fournit le cycle de vie complet de l'IA, allant de l'exploration des données, à l'étiquetage des données, à l'entraînement des modèles, à l'évaluation et à l'inférence. Une application Clarifai peut être utilisée comme une base de données vectorielle après avoir téléchargé des entrées.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `Clarifai`. Des exemples sont présentés pour démontrer les capacités de recherche sémantique de texte. Clarifai prend également en charge la recherche sémantique avec des images, des images de vidéo et la recherche localisée (voir [Rank](https://docs.clarifai.com/api-guide/search/rank))) et la recherche d'attributs (voir [Filter](https://docs.clarifai.com/api-guide/search/filter))).

Pour utiliser Clarifai, vous devez avoir un compte et une clé de jeton d'accès personnel (PAT).
[Vérifiez ici](https://clarifai.com/settings/security) pour obtenir ou créer un PAT.

# Dépendances

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# Imports

Ici, nous allons définir le jeton d'accès personnel. Vous pouvez trouver votre PAT dans les paramètres/sécurité de la plateforme.

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```output
 ········
```

```python
# Import the required modules
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Clarifai
from langchain_text_splitters import CharacterTextSplitter
```

# Configuration

Configurez l'identifiant utilisateur et l'identifiant d'application où les données textuelles seront téléchargées. Remarque : lors de la création de cette application, veuillez sélectionner un workflow de base approprié pour l'indexation de vos documents texte, comme le workflow de compréhension du langage.

Vous devrez d'abord créer un compte sur [Clarifai](https://clarifai.com/login), puis créer une application.

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 2
```

## À partir de textes

Créez une base de données vectorielle Clarifai à partir d'une liste de textes. Cette section téléchargera chaque texte avec ses métadonnées respectives dans une application Clarifai. L'application Clarifai peut ensuite être utilisée pour la recherche sémantique afin de trouver des textes pertinents.

```python
texts = [
    "I really enjoy spending time with you",
    "I hate spending time with my dog",
    "I want to go for a run",
    "I went to the movies yesterday",
    "I love playing soccer with my friends",
]

metadatas = [
    {"id": i, "text": text, "source": "book 1", "category": ["books", "modern"]}
    for i, text in enumerate(texts)
]
```

Vous avez également la possibilité de donner des identifiants d'entrée personnalisés aux entrées.

```python
idlist = ["text1", "text2", "text3", "text4", "text5"]
metadatas = [
    {"id": idlist[i], "text": text, "source": "book 1", "category": ["books", "modern"]}
    for i, text in enumerate(texts)
]
```

```python
# There is an option to initialize clarifai vector store with pat as argument!
clarifai_vector_db = Clarifai(
    user_id=USER_ID,
    app_id=APP_ID,
    number_of_docs=NUMBER_OF_DOCS,
)
```

Téléchargez les données dans l'application Clarifai.

```python
# upload with metadata and custom input ids.
response = clarifai_vector_db.add_texts(texts=texts, ids=idlist, metadatas=metadatas)

# upload without metadata (Not recommended)- Since you will not be able to perform Search operation with respect to metadata.
# custom input_id (optional)
response = clarifai_vector_db.add_texts(texts=texts)
```

Vous pouvez créer une base de données vectorielle Clarifai et ingérer tous les éléments dans votre application directement par,

```python
clarifai_vector_db = Clarifai.from_texts(
    user_id=USER_ID,
    app_id=APP_ID,
    texts=texts,
    metadatas=metadatas,
)
```

Recherchez des textes similaires à l'aide de la fonction de recherche par similarité.

```python
docs = clarifai_vector_db.similarity_search("I would like to see you")
docs
```

```output
[Document(page_content='I really enjoy spending time with you', metadata={'text': 'I really enjoy spending time with you', 'id': 'text1', 'source': 'book 1', 'category': ['books', 'modern']})]
```

De plus, vous pouvez filtrer vos résultats de recherche par métadonnées.

```python
# There is lots powerful filtering you can do within an app by leveraging metadata filters.
# This one will limit the similarity query to only the texts that have key of "source" matching value of "book 1"
book1_similar_docs = clarifai_vector_db.similarity_search(
    "I would love to see you", filter={"source": "book 1"}
)

# you can also use lists in the input's metadata and then select things that match an item in the list. This is useful for categories like below:
book_category_similar_docs = clarifai_vector_db.similarity_search(
    "I would love to see you", filter={"category": ["books"]}
)
```

## À partir de documents

Créez une base de données vectorielle Clarifai à partir d'une liste de documents. Cette section téléchargera chaque document avec ses métadonnées respectives dans une application Clarifai. L'application Clarifai peut ensuite être utilisée pour la recherche sémantique afin de trouver des documents pertinents.

```python
loader = TextLoader("your_local_file_path.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 4
```

Créez une classe de base de données vectorielle Clarifai et ingérez tous vos documents dans l'application Clarifai.

```python
clarifai_vector_db = Clarifai.from_documents(
    user_id=USER_ID,
    app_id=APP_ID,
    documents=docs,
    number_of_docs=NUMBER_OF_DOCS,
)
```

```python
docs = clarifai_vector_db.similarity_search("Texts related to population")
docs
```

## À partir d'une application existante

Dans Clarifai, nous avons de très bons outils pour ajouter des données aux applications (essentiellement des projets) via l'API ou l'interface utilisateur. La plupart des utilisateurs auront déjà fait cela avant d'interagir avec LangChain, donc cet exemple utilisera les données d'une application existante pour effectuer des recherches. Consultez nos [documents d'API](https://docs.clarifai.com/api-guide/data/create-get-update-delete) et [documents d'interface utilisateur](https://docs.clarifai.com/portal-guide/data). L'application Clarifai peut ensuite être utilisée pour la recherche sémantique afin de trouver des documents pertinents.

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 4
```

```python
clarifai_vector_db = Clarifai(
    user_id=USER_ID,
    app_id=APP_ID,
    number_of_docs=NUMBER_OF_DOCS,
)
```

```python
docs = clarifai_vector_db.similarity_search(
    "Texts related to ammuniction and president wilson"
)
```

```python
docs[0].page_content
```

```output
"President Wilson, generally acclaimed as the leader of the world's democracies,\nphrased for civilization the arguments against autocracy in the great peace conference\nafter the war. The President headed the American delegation to that conclave of world\nre-construction. With him as delegates to the conference were Robert Lansing, Secretary\nof State; Henry White, former Ambassador to France and Italy; Edward M. House and\nGeneral Tasker H. Bliss.\nRepresenting American Labor at the International Labor conference held in Paris\nsimultaneously with the Peace Conference were Samuel Gompers, president of the\nAmerican Federation of Labor; William Green, secretary-treasurer of the United Mine\nWorkers of America; John R. Alpine, president of the Plumbers' Union; James Duncan,\npresident of the International Association of Granite Cutters; Frank Duffy, president of\nthe United Brotherhood of Carpenters and Joiners, and Frank Morrison, secretary of the\nAmerican Federation of Labor.\nEstimating the share of each Allied nation in the great victory, mankind will\nconclude that the heaviest cost in proportion to prewar population and treasure was paid\nby the nations that first felt the shock of war, Belgium, Serbia, Poland and France. All\nfour were the battle-grounds of huge armies, oscillating in a bloody frenzy over once\nfertile fields and once prosperous towns.\nBelgium, with a population of 8,000,000, had a casualty list of more than 350,000;\nFrance, with its casualties of 4,000,000 out of a population (including its colonies) of\n90,000,000, is really the martyr nation of the world. Her gallant poilus showed the world\nhow cheerfully men may die in defense of home and liberty. Huge Russia, including\nhapless Poland, had a casualty list of 7,000,000 out of its entire population of\n180,000,000. The United States out of a population of 110,000,000 had a casualty list of\n236,117 for nineteen months of war; of these 53,169 were killed or died of disease;\n179,625 were wounded; and 3,323 prisoners or missing."
```
