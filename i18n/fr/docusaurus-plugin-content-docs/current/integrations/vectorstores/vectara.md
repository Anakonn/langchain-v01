---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) est la plateforme GenAI de confiance qui fournit une API facile à utiliser pour l'indexation et la requête de documents.

Vectara fournit un service géré de bout en bout pour la génération augmentée par récupération ou [RAG](https://vectara.com/grounded-generation/), qui comprend :

1. Une méthode pour extraire du texte à partir de fichiers de documents et les fragmenter en phrases.

2. Le modèle d'embeddings à la pointe de la technologie [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/). Chaque fragment de texte est encodé en une vector embedding utilisant Boomerang, et stocké dans le magasin de connaissances interne de Vectara (vecteur+texte).

3. Un service de requête qui encode automatiquement la requête en embedding, et récupère les segments de texte les plus pertinents (y compris le support pour [Hybrid Search](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) et [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/))).

4. Une option pour créer un [résumé génératif](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview) basé sur les documents récupérés, y compris les citations.

Voir la [documentation de l'API Vectara](https://docs.vectara.com/docs/) pour plus d'informations sur l'utilisation de l'API.

Ce carnet montre comment utiliser la fonctionnalité de récupération de base, en utilisant Vectara simplement comme un Vector Store (sans résumé), incluant : `similarity_search` et `similarity_search_with_score` ainsi que l'utilisation de la fonctionnalité LangChain `as_retriever`.

# Configuration

Vous aurez besoin d'un compte Vectara pour utiliser Vectara avec LangChain. Pour commencer, suivez les étapes suivantes :

1. [Inscrivez-vous](https://www.vectara.com/integrations/langchain) pour un compte Vectara si vous n'en avez pas déjà un. Une fois votre inscription terminée, vous recevrez un ID client Vectara. Vous pouvez trouver votre ID client en cliquant sur votre nom, en haut à droite de la fenêtre de la console Vectara.

2. Dans votre compte, vous pouvez créer un ou plusieurs corpus. Chaque corpus représente une zone qui stocke des données textuelles provenant des documents d'entrée. Pour créer un corpus, utilisez le bouton **"Create Corpus"**. Ensuite, donnez un nom à votre corpus ainsi qu'une description. Optionnellement, vous pouvez définir des attributs de filtrage et appliquer des options avancées. Si vous cliquez sur le corpus créé, vous pouvez voir son nom et son ID de corpus en haut.

3. Ensuite, vous devrez créer des clés API pour accéder au corpus. Cliquez sur l'onglet **"Authorization"** dans la vue du corpus, puis sur le bouton **"Create API Key"**. Donnez un nom à votre clé et choisissez si vous voulez une clé uniquement pour les requêtes ou pour les requêtes et l'indexation. Cliquez sur "Créer" et vous aurez maintenant une clé API active. Gardez cette clé confidentielle.

Pour utiliser LangChain avec Vectara, vous aurez besoin de ces trois valeurs : ID client, ID de corpus et clé API.
Vous pouvez les fournir à LangChain de deux manières :

1. Incluez dans votre environnement ces trois variables : `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` et `VECTARA_API_KEY`.

> Par exemple, vous pouvez définir ces variables en utilisant os.environ et getpass comme suit :

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Ajoutez-les au constructeur du vectorstore de Vectara :

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

## Connexion à Vectara depuis LangChain

Pour commencer, ingérons les documents en utilisant la méthode from_documents().
Nous supposons ici que vous avez ajouté vos VECTARA_CUSTOMER_ID, VECTARA_CORPUS_ID et VECTARA_API_KEY pour la requête et l'indexation en tant que variables d'environnement.

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vectara = Vectara.from_documents(
    docs,
    embedding=FakeEmbeddings(size=768),
    doc_metadata={"speech": "state-of-the-union"},
)
```

L'API d'indexation de Vectara fournit une API de téléchargement de fichiers où le fichier est traité directement par Vectara - pré-traité, fragmenté de manière optimale et ajouté au magasin de vecteurs de Vectara.
Pour utiliser cela, nous avons ajouté la méthode add_files() (ainsi que from_files()).

Voyons cela en action. Nous choisissons deux documents PDF à télécharger :

1. Le discours "I have a dream" du Dr. King
2. Le discours de Churchill "We Shall Fight on the Beaches"

```python
import tempfile
import urllib.request

urls = [
    [
        "https://www.gilderlehrman.org/sites/default/files/inline-pdfs/king.dreamspeech.excerpts.pdf",
        "I-have-a-dream",
    ],
    [
        "https://www.parkwayschools.net/cms/lib/MO01931486/Centricity/Domain/1578/Churchill_Beaches_Speech.pdf",
        "we shall fight on the beaches",
    ],
]
files_list = []
for url, _ in urls:
    name = tempfile.NamedTemporaryFile().name
    urllib.request.urlretrieve(url, name)
    files_list.append(name)

docsearch: Vectara = Vectara.from_files(
    files=files_list,
    embedding=FakeEmbeddings(size=768),
    metadatas=[{"url": url, "speech": title} for url, title in urls],
)
```

## Recherche de similarité

Le scénario le plus simple pour utiliser Vectara est d'effectuer une recherche de similarité.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search(
    query, n_sentence_context=0, filter="doc.speech = 'state-of-the-union'"
)
```

```python
found_docs
```

```output
[Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '141', 'len': '117', 'speech': 'state-of-the-union'}),
 Document(page_content='As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '77', 'speech': 'state-of-the-union'}),
 Document(page_content='Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '122', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought he could roll into Ukraine and the world would roll over.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '664', 'len': '68', 'speech': 'state-of-the-union'}),
 Document(page_content='That’s why one of the first things I did as President was fight to pass the American Rescue Plan.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '314', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='And he thought he could divide us at home.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '160', 'len': '42', 'speech': 'state-of-the-union'}),
 Document(page_content='He met the Ukrainian people.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '788', 'len': '28', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought the West and NATO wouldn’t respond.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '113', 'len': '46', 'speech': 'state-of-the-union'}),
 Document(page_content='In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '772', 'len': '131', 'speech': 'state-of-the-union'})]
```

```python
print(found_docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.
```

## Recherche de similarité avec score

Parfois, nous pouvons vouloir effectuer la recherche, mais aussi obtenir un score de pertinence pour savoir à quel point un résultat particulier est bon.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'state-of-the-union'",
    score_threshold=0.2,
)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.

Score: 0.74179757
```

Voyons maintenant une recherche similaire pour le contenu des fichiers que nous avons téléchargés.

```python
query = "We must forever conduct our struggle"
min_score = 1.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 1.2 we have 0 documents
```

```python
query = "We must forever conduct our struggle"
min_score = 0.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 0.2 we have 10 documents
```

MMR est une capacité de récupération importante pour de nombreuses applications, grâce à laquelle les résultats de recherche alimentant votre application GenAI sont reclassés pour améliorer la diversité des résultats.

Voyons comment cela fonctionne avec Vectara :

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 0.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

Grow the workforce. Build the economy from the bottom up
and the middle out, not from the top down.

When we invest in our workers, when we build the economy from the bottom up and the middle out together, we can do something we haven’t done in a long time: build a better America.

Our economy grew at a rate of 5.7% last year, the strongest growth in nearly 40 years, the first step in bringing fundamental change to an economy that hasn’t worked for the working people of this nation for too long.

Economists call it “increasing the productive capacity of our economy.”
```

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 1.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

The Russian stock market has lost 40% of its value and trading remains suspended.

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century.

In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

The federal government spends about $600 Billion a year to keep the country safe and secure.
```

Comme vous pouvez le voir, dans le premier exemple, diversity_bias a été réglé à 0.0 (équivalent à la désactivation du reclassement de la diversité), ce qui a donné les 5 documents les plus pertinents. Avec diversity_bias=1.0, nous maximisons la diversité et comme vous pouvez le voir, les documents de tête résultants sont beaucoup plus diversifiés dans leurs significations sémantiques.

## Vectara en tant que récupérateur

Enfin, voyons comment utiliser Vectara avec l'interface `as_retriever()` :

```python
retriever = vectara.as_retriever()
retriever
```

```output
VectorStoreRetriever(tags=['Vectara'], vectorstore=<langchain_community.vectorstores.vectara.Vectara object at 0x109a3c760>)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'})
```
