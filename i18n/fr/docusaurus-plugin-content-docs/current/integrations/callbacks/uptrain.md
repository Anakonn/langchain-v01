---
translated: true
---

<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/uptrain.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Ouvrir dans Colab"/>
</a>

# UpTrain

> UpTrain [[github](https://github.com/uptrain-ai/uptrain) || [site web](https://uptrain.ai/) || [documentation](https://docs.uptrain.ai/getting-started/introduction)] est une plateforme open-source pour évaluer et améliorer les applications de LLM. Elle fournit des notes pour plus de 20 vérifications préconfigurées (couvrant les cas d'utilisation du langage, du code, des embeddings), effectue des analyses des causes profondes sur les cas d'échec et fournit des conseils pour les résoudre.

## Gestionnaire de rappels UpTrain

Ce notebook présente le gestionnaire de rappels UpTrain s'intégrant en douceur dans votre pipeline, facilitant diverses évaluations. Nous avons choisi quelques évaluations que nous avons jugées appropriées pour évaluer les chaînes. Ces évaluations s'exécutent automatiquement, avec les résultats affichés dans la sortie. Plus de détails sur les évaluations d'UpTrain peuvent être trouvés [ici](https://github.com/uptrain-ai/uptrain?tab=readme-ov-file#pre-built-evaluations-we-offer-).

Les retrievers sélectionnés de Langchain sont mis en évidence pour la démonstration :

### 1. **Vanilla RAG** :

RAG joue un rôle crucial dans la récupération du contexte et la génération de réponses. Pour assurer ses performances et la qualité de ses réponses, nous effectuons les évaluations suivantes :

- **[Pertinence du contexte](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)** : Détermine si le contexte extrait de la requête est pertinent pour la réponse.
- **[Exactitude factuelle](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)** : Évalue si le LLM hallucine ou fournit des informations incorrectes.
- **[Exhaustivité de la réponse](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)** : Vérifie si la réponse contient toutes les informations demandées par la requête.

### 2. **Génération de requêtes multiples** :

MultiQueryRetriever crée plusieurs variantes d'une question ayant un sens similaire à la question d'origine. Compte tenu de la complexité, nous incluons les évaluations précédentes et ajoutons :

- **[Précision des requêtes multiples](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)** : Assure que les multi-requêtes générées ont le même sens que la requête d'origine.

### 3. **Compression et reclassement du contexte** :

Le reclassement implique le reclassement des nœuds en fonction de leur pertinence par rapport à la requête et le choix des n meilleurs nœuds. Comme le nombre de nœuds peut être réduit une fois le reclassement terminé, nous effectuons les évaluations suivantes :

- **[Reclassement du contexte](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)** : Vérifie si l'ordre des nœuds reclassés est plus pertinent à la requête que l'ordre d'origine.
- **[Concision du contexte](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)** : Examine si le nombre réduit de nœuds fournit toujours toutes les informations nécessaires.

Ces évaluations assurent collectivement la robustesse et l'efficacité de RAG, MultiQueryRetriever et du processus de reclassement dans la chaîne.

## Installer les dépendances

```python
%pip install -qU langchain langchain_openai uptrain faiss-cpu flashrank
```

```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)

[33mWARNING: There was an error checking the latest version of pip.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

REMARQUE : vous pouvez également installer `faiss-gpu` au lieu de `faiss-cpu` si vous voulez utiliser la version activée par GPU de la bibliothèque.

## Importer les bibliothèques

```python
from getpass import getpass

from langchain.chains import RetrievalQA
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import FlashrankRerank
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.runnables.passthrough import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)
```

## Charger les documents

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

## Diviser le document en morceaux

```python
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
chunks = text_splitter.split_documents(documents)
```

## Créer le retriever

```python
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(chunks, embeddings)
retriever = db.as_retriever()
```

## Définir le LLM

```python
llm = ChatOpenAI(temperature=0, model="gpt-4")
```

## Définir la clé API openai

Cette clé est nécessaire pour effectuer les évaluations. UpTrain utilise les modèles GPT pour évaluer les réponses générées par le LLM.

```python
OPENAI_API_KEY = getpass()
```

## Configuration

Pour chacun des retrievers ci-dessous, il est préférable de définir à nouveau le gestionnaire de rappels pour éviter les interférences. Vous pouvez choisir entre les options suivantes pour évaluer à l'aide d'UpTrain :

### 1. **Logiciel open-source (OSS) d'UpTrain** :

Vous pouvez utiliser le service d'évaluation open-source pour évaluer votre modèle.
Dans ce cas, vous devrez fournir une clé API OpenAI. Vous pouvez obtenir la vôtre [ici](https://platform.openai.com/account/api-keys).

Paramètres :
- key_type="openai"
- api_key="OPENAI_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

### 2. **Service géré et tableaux de bord d'UpTrain** :

Vous pouvez créer un compte gratuit UpTrain [ici](https://uptrain.ai/) et obtenir des crédits d'essai gratuits. Si vous voulez plus de crédits d'essai, [réservez un appel avec les responsables d'UpTrain ici](https://calendly.com/uptrain-sourabh/30min).

Le service géré d'UpTrain fournit :
1. Tableaux de bord avec des options de ventilation et de filtrage avancées
1. Informations et sujets courants parmi les cas d'échec
1. Observabilité et surveillance en temps réel des données de production
1. Tests de régression via une intégration transparente avec vos pipelines CI/CD

Le notebook contient quelques captures d'écran des tableaux de bord et des informations que vous pouvez obtenir à partir du service géré d'UpTrain.

Paramètres :
- key_type="uptrain"
- api_key="UPTRAIN_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

**Remarque :** Le `project_name_prefix` sera utilisé comme préfixe pour les noms de projet dans le tableau de bord UpTrain. Ils seront différents pour les différents types d'évaluations. Par exemple, si vous définissez project_name_prefix="langchain" et effectuez l'évaluation multi_query, le nom du projet sera "langchain_multi_query".

# 1. Vanilla RAG

Le gestionnaire de rappels UpTrain capturera automatiquement la requête, le contexte et la réponse une fois générés et exécutera les trois évaluations suivantes *(notées de 0 à 1)* sur la réponse :
- **[Pertinence du contexte](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)** : Vérifier si le contexte extrait de la requête est pertinent pour la réponse.
- **[Exactitude factuelle](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)** : Vérifier la précision factuelle de la réponse.
- **[Exhaustivité de la réponse](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)** : Vérifier si la réponse contient toutes les informations demandées par la requête.

```python
# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

# Create the chain
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Create the uptrain callback handler
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:03:44.969[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:05.809[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that she is a former top litigator in private practice, a former federal public defender, and comes from a family of public school educators and police officers. He described her as a consensus builder and noted that since her nomination, she has received a broad range of support from various groups, including the Fraternal Order of Police and former judges appointed by both Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 2. Génération de requêtes multiples

Le **MultiQueryRetriever** est utilisé pour résoudre le problème que le pipeline RAG pourrait ne pas renvoyer le meilleur ensemble de documents en fonction de la requête. Il génère plusieurs requêtes ayant le même sens que la requête d'origine, puis récupère des documents pour chacune d'entre elles.

Pour évaluer ce récupérateur, UpTrain exécutera l'évaluation suivante :
- **[Précision des requêtes multiples](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)** : Vérifie si les requêtes multiples générées ont le même sens que la requête d'origine.

```python
# Create the retriever
multi_query_retriever = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

chain = (
    {"context": multi_query_retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Invoke the chain with a query
question = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(question, config=config)
```

```output
[32m2024-04-17 17:04:10.675[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:16.804[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Multi Queries:
  - How did the president comment on Ketanji Brown Jackson?
  - What were the president's remarks regarding Ketanji Brown Jackson?
  - What statements has the president made about Ketanji Brown Jackson?

Multi Query Accuracy Score: 0.5

[32m2024-04-17 17:04:22.027[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:44.033[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that since her nomination, she has received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 3. Compression et reclassement du contexte

Le processus de reclassement consiste à réordonner les nœuds en fonction de leur pertinence par rapport à la requête et à choisir les n premiers nœuds. Étant donné que le nombre de nœuds peut être réduit une fois le reclassement terminé, nous effectuons les évaluations suivantes :
- **[Reclassement du contexte](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)** : Vérifier si l'ordre des nœuds reclassés est plus pertinent pour la requête que l'ordre d'origine.
- **[Concision du contexte](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)** : Vérifier si le nombre réduit de nœuds fournit toujours toutes les informations nécessaires.

```python
# Create the retriever
compressor = FlashrankRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

# Create the chain
chain = RetrievalQA.from_chain_type(llm=llm, retriever=compression_retriever)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
result = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:04:46.462[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:53.561[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson

Context Conciseness Score: 0.0
Context Reranking Score: 1.0

[32m2024-04-17 17:04:56.947[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:05:16.551[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The President mentioned that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 0.5
```
