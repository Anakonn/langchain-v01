---
translated: true
---

# Vespa

>[Vespa](https://vespa.ai/) est un moteur de recherche et une base de données vectorielle entièrement fonctionnels. Il prend en charge la recherche vectorielle (ANN), la recherche lexicale et la recherche dans les données structurées, le tout dans la même requête.

Ce notebook montre comment utiliser `Vespa.ai` comme un magasin de vecteurs LangChain.

Afin de créer le magasin de vecteurs, nous utilisons
[pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) pour créer une
connexion à un service `Vespa`.

```python
%pip install --upgrade --quiet  pyvespa
```

En utilisant le package `pyvespa`, vous pouvez vous connecter à une
[instance Vespa Cloud](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
ou à une
[instance Docker locale](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html).
Ici, nous allons créer une nouvelle application Vespa et la déployer à l'aide de Docker.

#### Création d'une application Vespa

Tout d'abord, nous devons créer un package d'application :

```python
from vespa.package import ApplicationPackage, Field, RankProfile

app_package = ApplicationPackage(name="testapp")
app_package.schema.add_fields(
    Field(
        name="text", type="string", indexing=["index", "summary"], index="enable-bm25"
    ),
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary"],
        attribute=["distance-metric: angular"],
    ),
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="default",
        first_phase="closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

Cela configure une application Vespa avec un schéma pour chaque document contenant
deux champs : `text` pour contenir le texte du document et `embedding` pour contenir
le vecteur d'intégration. Le champ `text` est configuré pour utiliser un index BM25 pour
une récupération de texte efficace, et nous verrons comment utiliser cela et la recherche
hybride un peu plus tard.

Le champ `embedding` est configuré avec un vecteur de longueur 384 pour contenir la
représentation d'intégration du texte. Voir
[le guide Tensor de Vespa](https://docs.vespa.ai/en/tensor-user-guide.html)
pour plus d'informations sur les tenseurs dans Vespa.

Enfin, nous ajoutons un [profil de classement](https://docs.vespa.ai/en/ranking.html) pour
indiquer à Vespa comment classer les documents. Ici, nous le configurons avec une
[recherche des plus proches voisins](https://docs.vespa.ai/en/nearest-neighbor-search.html).

Maintenant, nous pouvons déployer cette application localement :

```python
from vespa.deployment import VespaDocker

vespa_docker = VespaDocker()
vespa_app = vespa_docker.deploy(application_package=app_package)
```

Cela déploie et crée une connexion à un service `Vespa`. Si vous
avez déjà une application Vespa en cours d'exécution, par exemple dans le cloud,
veuillez vous référer à l'application PyVespa pour savoir comment vous connecter.

#### Création d'un magasin de vecteurs Vespa

Maintenant, chargeons quelques documents :

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)

embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

Ici, nous configurons également un encodeur de phrases local pour transformer le texte en vecteurs d'intégration.
On pourrait également utiliser les intégrations d'OpenAI, mais la longueur du vecteur doit être mise à jour à
`1536` pour refléter la taille plus importante de cette intégration.

Pour les transmettre à Vespa, nous devons configurer la façon dont le magasin de vecteurs doit se mapper aux
champs de l'application Vespa. Ensuite, nous créons le magasin de vecteurs directement à partir
de cet ensemble de documents :

```python
vespa_config = dict(
    page_content_field="text",
    embedding_field="embedding",
    input_field="query_embedding",
)

from langchain_community.vectorstores import VespaStore

db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

Cela crée un magasin de vecteurs Vespa et transmet cet ensemble de documents à Vespa.
Le magasin de vecteurs s'occupe d'appeler la fonction d'intégration pour chaque document
et les insère dans la base de données.

Nous pouvons maintenant interroger le magasin de vecteurs :

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)

print(results[0].page_content)
```

Cela utilisera la fonction d'intégration donnée ci-dessus pour créer une représentation
pour la requête et l'utiliser pour rechercher dans Vespa. Notez que cela utilisera la
fonction de classement `default`, que nous avons configurée dans le package d'application
ci-dessus. Vous pouvez utiliser l'argument `ranking` de `similarity_search` pour
spécifier quelle fonction de classement utiliser.

Veuillez vous référer à la [documentation pyvespa](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query)
pour plus d'informations.

Cela couvre l'utilisation de base du magasin Vespa dans LangChain.
Vous pouvez maintenant renvoyer les résultats et continuer à les utiliser dans LangChain.

#### Mise à jour des documents

Une alternative à l'appel de `from_documents`, vous pouvez créer le magasin de vecteurs
directement et appeler `add_texts` à partir de celui-ci. Cela peut également être utilisé pour mettre à jour
les documents :

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
result = results[0]

result.page_content = "UPDATED: " + result.page_content
db.add_texts([result.page_content], [result.metadata], result.metadata["id"])

results = db.similarity_search(query)
print(results[0].page_content)
```

Cependant, la bibliothèque `pyvespa` contient des méthodes pour manipuler
le contenu sur Vespa que vous pouvez utiliser directement.

#### Suppression de documents

Vous pouvez supprimer des documents à l'aide de la fonction `delete` :

```python
result = db.similarity_search(query)
# docs[0].metadata["id"] == "id:testapp:testapp::32"

db.delete(["32"])
result = db.similarity_search(query)
# docs[0].metadata["id"] != "id:testapp:testapp::32"
```

Encore une fois, la connexion `pyvespa` contient des méthodes pour supprimer des documents également.

### Retour avec les scores

La méthode `similarity_search` ne renvoie que les documents dans l'ordre de
pertinence. Pour récupérer les scores réels :

```python
results = db.similarity_search_with_score(query)
result = results[0]
# result[1] ~= 0.463
```

C'est le résultat de l'utilisation du modèle d'intégration `"all-MiniLM-L6-v2"` en utilisant la
fonction de distance cosinus (comme indiqué par l'argument `angular` dans la
fonction d'application).

Différentes fonctions d'intégration nécessitent différentes fonctions de distance, et Vespa
doit savoir quelle fonction de distance utiliser lors du classement des documents.
Veuillez vous référer à la
[documentation sur les fonctions de distance](https://docs.vespa.ai/en/reference/schema-reference.html#distance-metric)
pour plus d'informations.

### En tant que récupérateur

Pour utiliser ce magasin de vecteurs comme un
[récupérateur LangChain](/docs/modules/data_connection/retrievers/)
il suffit d'appeler la fonction `as_retriever`, qui est une méthode standard du magasin de vecteurs :

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
retriever = db.as_retriever()
query = "What did the president say about Ketanji Brown Jackson"
results = retriever.invoke(query)

# results[0].metadata["id"] == "id:testapp:testapp::32"
```

Cela permet une récupération plus générale et non structurée à partir du magasin de vecteurs.

### Métadonnées

Dans l'exemple précédent, nous n'avons utilisé que le texte et l'intégration de ce
texte. Les documents contiennent généralement des informations supplémentaires, qui dans LangChain
sont appelées métadonnées.

Vespa peut contenir de nombreux champs de différents types en les ajoutant au package d'application :

```python
app_package.schema.add_fields(
    # ...
    Field(name="date", type="string", indexing=["attribute", "summary"]),
    Field(name="rating", type="int", indexing=["attribute", "summary"]),
    Field(name="author", type="string", indexing=["attribute", "summary"]),
    # ...
)
vespa_app = vespa_docker.deploy(application_package=app_package)
```

Nous pouvons ajouter quelques champs de métadonnées dans les documents :

```python
# Add metadata
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"2023-{(i % 12)+1}-{(i % 28)+1}"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["Joe Biden", "Unknown"][min(i, 1)]
```

Et faire savoir au magasin de vecteurs Vespa à propos de ces champs :

```python
vespa_config.update(dict(metadata_fields=["date", "rating", "author"]))
```

Maintenant, lors de la recherche de ces documents, ces champs seront renvoyés.
De plus, ces champs peuvent être filtrés :

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, filter="rating > 3")
# results[0].metadata["id"] == "id:testapp:testapp::34"
# results[0].metadata["author"] == "Unknown"
```

### Requête personnalisée

Si le comportement par défaut de la recherche de similarité ne correspond pas à vos
besoins, vous pouvez toujours fournir votre propre requête. Ainsi, vous n'avez pas
à fournir toute la configuration au magasin de vecteurs, mais
plutôt à l'écrire vous-même.

Tout d'abord, ajoutons une fonction de classement BM25 à notre application :

```python
from vespa.package import FieldSet

app_package.schema.add_field_set(FieldSet(name="default", fields=["text"]))
app_package.schema.add_rank_profile(RankProfile(name="bm25", first_phase="bm25(text)"))
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

Ensuite, pour effectuer une recherche de texte classique basée sur BM25 :

```python
query = "What did the president say about Ketanji Brown Jackson"
custom_query = {
    "yql": "select * from sources * where userQuery()",
    "query": query,
    "type": "weakAnd",
    "ranking": "bm25",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"] == "id:testapp:testapp::32"
# results[0][1] ~= 14.384
```

Toutes les puissantes capacités de recherche et de requête de Vespa peuvent être utilisées
en utilisant une requête personnalisée. Veuillez vous référer à la documentation Vespa sur son
[API de requête](https://docs.vespa.ai/en/query-api.html) pour plus de détails.

### Recherche hybride

La recherche hybride signifie utiliser à la fois une recherche classique basée sur les termes comme
BM25 et une recherche vectorielle et combiner les résultats. Nous devons créer
un nouveau profil de classement pour la recherche hybride sur Vespa :

```python
app_package.schema.add_rank_profile(
    RankProfile(
        name="hybrid",
        first_phase="log(bm25(text)) + 0.5 * closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

Ici, nous classons chaque document comme une combinaison de son score BM25 et de son
score de distance. Nous pouvons interroger à l'aide d'une requête personnalisée :

```python
query = "What did the president say about Ketanji Brown Jackson"
query_embedding = embedding_function.embed_query(query)
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(embedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression} and userQuery()",
    "query": query,
    "type": "weakAnd",
    "input.query(query_embedding)": query_embedding,
    "ranking": "hybrid",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 2.897
```

### Intégrateurs natifs dans Vespa

Jusqu'à présent, nous avons utilisé une fonction d'intégration en Python pour fournir
des intégrations pour les textes. Vespa prend en charge les fonctions d'intégration de manière native, donc
vous pouvez différer ce calcul dans Vespa. Un avantage est la possibilité d'utiliser
des GPU lors de l'intégration de documents si vous avez une grande collection.

Veuillez vous référer à [Vespa embeddings](https://docs.vespa.ai/en/embedding.html)
pour plus d'informations.

Tout d'abord, nous devons modifier notre package d'application :

```python
from vespa.package import Component, Parameter

app_package.components = [
    Component(
        id="hf-embedder",
        type="hugging-face-embedder",
        parameters=[
            Parameter("transformer-model", {"path": "..."}),
            Parameter("tokenizer-model", {"url": "..."}),
        ],
    )
]
Field(
    name="hfembedding",
    type="tensor<float>(x[384])",
    is_document_field=False,
    indexing=["input text", "embed hf-embedder", "attribute", "summary"],
    attribute=["distance-metric: angular"],
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="hf_similarity",
        first_phase="closeness(field, hfembedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

Veuillez vous référer à la documentation sur les intégrations pour ajouter des modèles d'intégrateur et
des tokeniseurs à l'application. Notez que le champ `hfembedding`
comprend des instructions pour l'intégration à l'aide de `hf-embedder`.

Maintenant, nous pouvons interroger avec une requête personnalisée :

```python
query = "What did the president say about Ketanji Brown Jackson"
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(internalembedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression}",
    "input.query(query_embedding)": f'embed(hf-embedder, "{query}")',
    "ranking": "internal_similarity",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 0.630
```

Notez que la requête ici inclut une instruction `embed` pour intégrer la requête
en utilisant le même modèle que pour les documents.

### Voisin le plus proche approximatif

Dans tous les exemples ci-dessus, nous avons utilisé le voisin le plus proche exact pour
trouver les résultats. Cependant, pour de grandes collections de documents, cela n'est pas
faisable car il faut parcourir tous les documents pour trouver les
meilleurs correspondances. Pour éviter cela, nous pouvons utiliser
[les voisins les plus proches approximatifs](https://docs.vespa.ai/en/approximate-nn-hnsw.html).

Tout d'abord, nous pouvons modifier le champ d'intégration pour créer un index HNSW :

```python
from vespa.package import HNSW

app_package.schema.add_fields(
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary", "index"],
        ann=HNSW(
            distance_metric="angular",
            max_links_per_node=16,
            neighbors_to_explore_at_insert=200,
        ),
    )
)
```

Cela crée un index HNSW sur les données d'intégration, ce qui permet une recherche efficace.
Avec cela défini, nous pouvons facilement rechercher en utilisant ANN en définissant
l'argument `approximate` sur `True` :

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, approximate=True)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
```

Cela couvre la plupart des fonctionnalités du magasin de vecteurs Vespa dans LangChain.
