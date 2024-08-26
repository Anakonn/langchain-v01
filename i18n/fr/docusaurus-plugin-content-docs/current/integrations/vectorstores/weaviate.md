---
sidebar_label: Weaviate
translated: true
---

# Weaviate

Ce notebook couvre comment commencer avec le magasin de vecteurs Weaviate dans LangChain, en utilisant le package `langchain-weaviate`.

> [Weaviate](https://weaviate.io/) est une base de données de vecteurs open-source. Elle vous permet de stocker des objets de données et des embeddings de vecteurs de vos modèles d'apprentissage automatique préférés, et de passer à l'échelle de manière transparente jusqu'à des milliards d'objets de données.

Pour utiliser cette intégration, vous devez avoir une instance de base de données Weaviate en cours d'exécution.

## Versions minimales

Ce module nécessite Weaviate `1.23.7` ou une version supérieure. Cependant, nous vous recommandons d'utiliser la dernière version de Weaviate.

## Connexion à Weaviate

Dans ce notebook, nous supposons que vous avez une instance locale de Weaviate en cours d'exécution sur `http://localhost:8080` et que le port 50051 est ouvert pour le trafic [gRPC](https://weaviate.io/blog/grpc-performance-improvements). Donc, nous nous connecterons à Weaviate avec :

```python
weaviate_client = weaviate.connect_to_local()
```

### Autres options de déploiement

Weaviate peut être [déployé de nombreuses manières différentes](https://weaviate.io/developers/weaviate/starter-guides/which-weaviate) comme en utilisant [Weaviate Cloud Services (WCS)](https://console.weaviate.cloud), [Docker](https://weaviate.io/developers/weaviate/installation/docker-compose) ou [Kubernetes](https://weaviate.io/developers/weaviate/installation/kubernetes).

Si votre instance Weaviate est déployée d'une autre manière, [lisez plus ici](https://weaviate.io/developers/weaviate/client-libraries/python#instantiate-a-client) sur les différentes façons de se connecter à Weaviate. Vous pouvez utiliser différentes [fonctions d'assistance](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-helper-functions) ou [créer une instance personnalisée](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-explicit-connection).

> Notez que vous avez besoin d'une API client `v4`, qui créera un objet `weaviate.WeaviateClient`.

### Authentification

Certaines instances Weaviate, comme celles qui fonctionnent sur WCS, ont l'authentification activée, comme la clé API et/ou l'authentification par nom d'utilisateur + mot de passe.

Lisez le [guide d'authentification client](https://weaviate.io/developers/weaviate/client-libraries/python#authentication) pour plus d'informations, ainsi que la [page de configuration d'authentification approfondie](https://weaviate.io/developers/weaviate/configuration/authentication).

## Installation

```python
# install package
# %pip install -Uqq langchain-weaviate
# %pip install openai tiktoken langchain
```

## Configuration de l'environnement

Ce notebook utilise l'API OpenAI via `OpenAIEmbeddings`. Nous vous suggérons d'obtenir une clé API OpenAI et de l'exporter en tant que variable d'environnement avec le nom `OPENAI_API_KEY`.

Une fois cela fait, votre clé API OpenAI sera lue automatiquement. Si vous êtes nouveau dans les variables d'environnement, lisez-en plus [ici](https://docs.python.org/3/library/os.html#os.environ) ou dans [ce guide](https://www.twilio.com/en-us/blog/environment-variables-python).

# Utilisation

## Trouver des objets par similarité

Voici un exemple de la façon de trouver des objets par similarité avec une requête, de l'importation des données à l'interrogation de l'instance Weaviate.

### Étape 1 : Importation des données

Tout d'abord, nous allons créer des données à ajouter à `Weaviate` en chargeant et en découpant le contenu d'un long fichier texte.

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.openai import OpenAIEmbeddings
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.embeddings.openai.OpenAIEmbeddings` was deprecated in langchain-community 0.1.0 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAIEmbeddings`.
  warn_deprecated(
```

Maintenant, nous pouvons importer les données.

Pour ce faire, connectez-vous à l'instance Weaviate et utilisez l'objet `weaviate_client` résultant. Par exemple, nous pouvons importer les documents comme indiqué ci-dessous :

```python
import weaviate
from langchain_weaviate.vectorstores import WeaviateVectorStore
```

```python
weaviate_client = weaviate.connect_to_local()
db = WeaviateVectorStore.from_documents(docs, embeddings, client=weaviate_client)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

### Étape 2 : Effectuer la recherche

Nous pouvons maintenant effectuer une recherche par similarité. Cela renverra les documents les plus similaires au texte de la requête, en fonction des embeddings stockés dans Weaviate et d'un embedding équivalent généré à partir du texte de la requête.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# Print the first 100 characters of each result
for i, doc in enumerate(docs):
    print(f"\nDocument {i+1}:")
    print(doc.page_content[:100] + "...")
```

```output

Document 1:
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...

Document 2:
And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of ...

Document 3:
Vice President Harris and I ran for office with a new economic vision for America.

Invest in Ameri...

Document 4:
A former top litigator in private practice. A former federal public defender. And from a family of p...
```

Vous pouvez également ajouter des filtres, qui incluront ou excluront les résultats en fonction des conditions de filtre. (Voir [plus d'exemples de filtres](https://weaviate.io/developers/weaviate/search/filters).))

```python
from weaviate.classes.query import Filter

for filter_str in ["blah.txt", "state_of_the_union.txt"]:
    search_filter = Filter.by_property("source").equal(filter_str)
    filtered_search_results = db.similarity_search(query, filters=search_filter)
    print(len(filtered_search_results))
    if filter_str == "state_of_the_union.txt":
        assert len(filtered_search_results) > 0  # There should be at least one result
    else:
        assert len(filtered_search_results) == 0  # There should be no results
```

```output
0
4
```

Il est également possible de fournir `k`, qui est la limite supérieure du nombre de résultats à renvoyer.

```python
search_filter = Filter.by_property("source").equal("state_of_the_union.txt")
filtered_search_results = db.similarity_search(query, filters=search_filter, k=3)
assert len(filtered_search_results) <= 3
```

### Quantifier la similarité des résultats

Vous pouvez éventuellement récupérer un "score" de pertinence. Il s'agit d'un score relatif qui indique à quel point un résultat de recherche particulier est bon, parmi l'ensemble des résultats de recherche.

Notez que ce score est relatif, ce qui signifie qu'il ne doit pas être utilisé pour déterminer des seuils de pertinence. Cependant, il peut être utilisé pour comparer la pertinence de différents résultats de recherche au sein de l'ensemble complet des résultats de recherche.

```python
docs = db.similarity_search_with_score("country", k=5)

for doc in docs:
    print(f"{doc[1]:.3f}", ":", doc[0].page_content[:100] + "...")
```

```output
0.935 : For that purpose we’ve mobilized American ground forces, air squadrons, and ship deployments to prot...
0.500 : And built the strongest, freest, and most prosperous nation the world has ever known.

Now is the h...
0.462 : If you travel 20 miles east of Columbus, Ohio, you’ll find 1,000 empty acres of land.

It won’t loo...
0.450 : And my report is this: the State of the Union is strong—because you, the American people, are strong...
0.442 : Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...
```

## Mécanisme de recherche

`similarity_search` utilise la [recherche hybride](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid) de Weaviate.

Une recherche hybride combine une recherche par vecteur et une recherche par mot-clé, avec `alpha` comme poids de la recherche par vecteur. La fonction `similarity_search` vous permet de passer des arguments supplémentaires en tant que kwargs. Consultez cette [documentation de référence](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid) pour connaître les arguments disponibles.

Ainsi, vous pouvez effectuer une recherche purement par mot-clé en ajoutant `alpha=0` comme indiqué ci-dessous :

```python
docs = db.similarity_search(query, alpha=0)
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

## Persistance

Toutes les données ajoutées via `langchain-weaviate` persisteront dans Weaviate selon sa configuration.

Les instances WCS, par exemple, sont configurées pour conserver les données indéfiniment, et les instances Docker peuvent être configurées pour conserver les données dans un volume. En savoir plus sur la [persistance de Weaviate](https://weaviate.io/developers/weaviate/configuration/persistence).

## Multi-tenancy

[Multi-tenancy](https://weaviate.io/developers/weaviate/concepts/data#multi-tenancy) vous permet d'avoir un grand nombre de collections de données isolées, avec la même configuration de collection, dans une seule instance Weaviate. C'est idéal pour les environnements multi-utilisateurs comme la construction d'une application SaaS, où chaque utilisateur final aura sa propre collection de données isolée.

Pour utiliser le multi-tenancy, le magasin de vecteurs doit être conscient du paramètre `tenant`.

Donc lors de l'ajout de données, fournissez le paramètre `tenant` comme indiqué ci-dessous.

```python
db_with_mt = WeaviateVectorStore.from_documents(
    docs, embeddings, client=weaviate_client, tenant="Foo"
)
```

```output
2024-Mar-26 03:40 PM - langchain_weaviate.vectorstores - INFO - Tenant Foo does not exist in index LangChain_30b9273d43b3492db4fb2aba2e0d6871. Creating tenant.
```

Et lors de l'exécution de requêtes, fournissez également le paramètre `tenant`.

```python
db_with_mt.similarity_search(query, tenant="Foo")
```

```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand. \n\nI remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. \n\nThat’s why one of the first things I did as President was fight to pass the American Rescue Plan.  \n\nBecause people were hurting. We needed to act, and we did. \n\nFew pieces of legislation have done more in a critical moment in our history to lift us out of crisis. \n\nIt fueled our efforts to vaccinate the nation and combat COVID-19. It delivered immediate economic relief for tens of millions of Americans.  \n\nHelped put food on their table, keep a roof over their heads, and cut the cost of health insurance. \n\nAnd as my Dad used to say, it gave people a little breathing room.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='He and his Dad both have Type 1 diabetes, which means they need insulin every day. Insulin costs about $10 a vial to make.  \n\nBut drug companies charge families like Joshua and his Dad up to 30 times more. I spoke with Joshua’s mom. \n\nImagine what it’s like to look at your child who needs insulin and have no idea how you’re going to pay for it.  \n\nWhat it does to your dignity, your ability to look your child in the eye, to be the parent you expect to be. \n\nJoshua is here with us tonight. Yesterday was his birthday. Happy birthday, buddy.  \n\nFor Joshua, and for the 200,000 other young people with Type 1 diabetes, let’s cap the cost of insulin at $35 a month so everyone can afford it.  \n\nDrug companies will still do very well. And while we’re at it let Medicare negotiate lower prices for prescription drugs, like the VA already does.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. \n\nHe rejected repeated efforts at diplomacy. \n\nHe thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   \n\nWe prepared extensively and carefully. \n\nWe spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. \n\nI spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  \n\nWe countered Russia’s lies with truth.   \n\nAnd now that he has acted the free world is holding him accountable. \n\nAlong with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland.', metadata={'source': 'state_of_the_union.txt'})]
```

## Options du récupérateur

Weaviate peut également être utilisé comme un récupérateur

### Recherche de pertinence marginale maximale (MMR)

En plus d'utiliser `similaritysearch` dans l'objet récupérateur, vous pouvez également utiliser `mmr`.

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)[0]
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

# Utilisation avec LangChain

Une limitation connue des modèles de langage à grande échelle (LLM) est que leurs données d'entraînement peuvent être obsolètes ou ne pas inclure les connaissances spécifiques au domaine dont vous avez besoin.

Jetez un coup d'œil à l'exemple ci-dessous :

```python
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
llm.predict("What did the president say about Justice Breyer")
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.chat_models.openai.ChatOpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import ChatOpenAI`.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `predict` was deprecated in LangChain 0.1.7 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
"I'm sorry, I cannot provide real-time information as my responses are generated based on a mixture of licensed data, data created by human trainers, and publicly available data. The last update was in October 2021."
```

Les magasins de vecteurs complètent les LLM en fournissant un moyen de stocker et de récupérer les informations pertinentes. Cela vous permet de combiner les forces des LLM et des magasins de vecteurs, en utilisant les capacités de raisonnement et linguistiques des LLM avec la capacité des magasins de vecteurs à récupérer les informations pertinentes.

Deux applications bien connues pour combiner les LLM et les magasins de vecteurs sont :
- Réponse aux questions
- Génération augmentée par la récupération (RAG)

### Réponse aux questions avec sources

La réponse aux questions dans langchain peut être améliorée par l'utilisation de magasins de vecteurs. Voyons comment cela peut être fait.

Cette section utilise la `RetrievalQAWithSourcesChain`, qui effectue la recherche des documents à partir d'un index.

Tout d'abord, nous allons à nouveau découper le texte et les importer dans le magasin de vecteurs Weaviate.

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_community.llms import OpenAI
```

```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)
```

Maintenant, nous pouvons construire la chaîne, avec le récupérateur spécifié :

```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.llms.openai.OpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAI`.
  warn_deprecated(
```

Et exécuter la chaîne, pour poser la question :

```python
chain(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `__call__` was deprecated in LangChain 0.1.0 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
{'answer': ' The president thanked Justice Stephen Breyer for his service and announced his nomination of Judge Ketanji Brown Jackson to the Supreme Court.\n',
 'sources': '31-pl'}
```

### Génération augmentée par la récupération

Une autre application très populaire de la combinaison des LLM et des magasins de vecteurs est la génération augmentée par la récupération (RAG). Il s'agit d'une technique qui utilise un récupérateur pour trouver les informations pertinentes d'un magasin de vecteurs, puis utilise un LLM pour fournir une sortie basée sur les données récupérées et une invite.

Nous commençons par une configuration similaire :

```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)

retriever = docsearch.as_retriever()
```

Nous devons construire un modèle pour le modèle RAG afin que les informations récupérées soient remplies dans le modèle.

```python
from langchain_core.prompts import ChatPromptTemplate

template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

print(prompt)
```

```output
input_variables=['context', 'question'] messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template="You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\nQuestion: {question}\nContext: {context}\nAnswer:\n"))]
```

```python
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

Et en exécutant la cellule, nous obtenons une sortie très similaire.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain.invoke("What did the president say about Justice Breyer")
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
"The president honored Justice Stephen Breyer for his service to the country as an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. The president also mentioned nominating Circuit Court of Appeals Judge Ketanji Brown Jackson to continue Justice Breyer's legacy of excellence. The president expressed gratitude towards Justice Breyer and highlighted the importance of nominating someone to serve on the United States Supreme Court."
```

Mais notez que puisque le modèle dépend de vous, vous pouvez le personnaliser selon vos besoins.

### Récapitulatif et ressources

Weaviate est un magasin de vecteurs évolutif et prêt pour la production.

Cette intégration permet à Weaviate d'être utilisé avec LangChain pour améliorer les capacités des modèles de langage à grande échelle avec un magasin de données robuste. Sa scalabilité et sa préparation à la production en font un excellent choix comme magasin de vecteurs pour vos applications LangChain, et cela réduira votre temps de mise en production.
