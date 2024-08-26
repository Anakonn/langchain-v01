---
translated: true
---

# Activeloop Deep Memory

>[Activeloop Deep Memory](https://docs.activeloop.ai/performance-features/deep-memory) est une suite d'outils qui vous permet d'optimiser votre Vector Store pour votre cas d'utilisation et d'atteindre une plus grande précision dans vos applications LLM.

`Retrieval-Augmented Generatation` (`RAG`) a récemment gagné en importance. À mesure que les techniques et agents RAG avancés émergent, ils élargissent le potentiel de ce que les RAG peuvent accomplir. Cependant, plusieurs défis peuvent limiter l'intégration des RAG dans la production. Les principaux facteurs à prendre en compte lors de la mise en œuvre des RAG dans des environnements de production sont la précision (rappel), le coût et la latence. Pour les cas d'utilisation de base, le modèle Ada d'OpenAI associé à une recherche de similarité naïve peut produire des résultats satisfaisants. Pourtant, pour une plus grande précision ou un rappel plus élevé lors des recherches, il peut être nécessaire d'employer des techniques de récupération avancées. Ces méthodes peuvent impliquer des tailles de chunks de données variables, la réécriture de requêtes plusieurs fois et plus encore, ce qui peut augmenter la latence et les coûts. [Deep Memory](https://www.activeloop.ai/resources/use-deep-memory-to-boost-rag-apps-accuracy-by-up-to-22/) d'Activeloop, une fonctionnalité disponible pour les utilisateurs d'Activeloop Deep Lake, s'attaque à ces problèmes en introduisant une couche de réseau neuronal minuscule formée pour faire correspondre les requêtes des utilisateurs aux données pertinentes d'un corpus. Bien que cet ajout entraîne une latence minimale pendant la recherche, il peut augmenter la précision de la récupération jusqu'à 27% et reste rentable et simple à utiliser, sans nécessiter de techniques rag avancées supplémentaires.

Pour ce tutoriel, nous analyserons la documentation `DeepLake` et créerons un système RAG qui pourrait répondre à la question à partir des documents.

## 1. Création du jeu de données

Nous analyserons les documents d'Activeloop pour ce tutoriel à l'aide de la bibliothèque `BeautifulSoup` et des parseurs de documents de LangChain comme `Html2TextTransformer` et `AsyncHtmlLoader`. Nous devrons donc installer les bibliothèques suivantes :

```python
%pip install --upgrade --quiet  tiktoken langchain-openai python-dotenv datasets langchain deeplake beautifulsoup4 html2text ragas
```

Vous devrez également créer un compte [Activeloop](https://activeloop.ai).

```python
ORG_ID = "..."
```

```python
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import DeepLake
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API token: ")
# # activeloop token is needed if you are not signed in using CLI: `activeloop login -u <USERNAME> -p <PASSWORD>`
os.environ["ACTIVELOOP_TOKEN"] = getpass.getpass(
    "Enter your ActiveLoop API token: "
)  # Get your API token from https://app.activeloop.ai, click on your profile picture in the top right corner, and select "API Tokens"

token = os.getenv("ACTIVELOOP_TOKEN")
openai_embeddings = OpenAIEmbeddings()
```

```python
db = DeepLake(
    dataset_path=f"hub://{ORG_ID}/deeplake-docs-deepmemory",  # org_id stands for your username or organization from activeloop
    embedding=openai_embeddings,
    runtime={"tensor_db": True},
    token=token,
    # overwrite=True, # user overwrite flag if you want to overwrite the full dataset
    read_only=False,
)
```

Analyse de tous les liens de la page web à l'aide de `BeautifulSoup`

```python
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


def get_all_links(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve the page: {url}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")

    # Finding all 'a' tags which typically contain href attribute for links
    links = [
        urljoin(url, a["href"]) for a in soup.find_all("a", href=True) if a["href"]
    ]

    return links


base_url = "https://docs.deeplake.ai/en/latest/"
all_links = get_all_links(base_url)
```

Chargement des données :

```python
from langchain_community.document_loaders.async_html import AsyncHtmlLoader

loader = AsyncHtmlLoader(all_links)
docs = loader.load()
```

Conversion des données dans un format lisible par l'utilisateur :

```python
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
```

Maintenant, découpons davantage les documents car certains d'entre eux contiennent trop de texte :

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

chunk_size = 4096
docs_new = []

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size,
)

for doc in docs_transformed:
    if len(doc.page_content) < chunk_size:
        docs_new.append(doc)
    else:
        docs = text_splitter.create_documents([doc.page_content])
        docs_new.extend(docs)
```

Peuplement du VectorStore :

```python
docs = db.add_documents(docs_new)
```

## 2. Génération de requêtes synthétiques et formation de Deep Memory

L'étape suivante consisterait à former un modèle deep_memory qui alignera les requêtes de vos utilisateurs sur le jeu de données que vous avez déjà. Si vous n'avez pas encore de requêtes d'utilisateurs, ne vous inquiétez pas, nous les générerons à l'aide d'un LLM !

#### TODO: Add image

Ci-dessus, nous avons montré le schéma global du fonctionnement de deep_memory. Comme vous pouvez le voir, pour le former, vous avez besoin de pertinence, de requêtes ainsi que de données de corpus (données que nous voulons interroger). Les données de corpus ont déjà été peuplées dans la section précédente, ici nous allons générer des questions et de la pertinence.

1. `questions` - est un texte de chaînes de caractères, où chaque chaîne représente une requête
2. `relevance` - contient des liens vers la vérité de terrain pour chaque question. Il peut y avoir plusieurs documents qui contiennent la réponse à une question donnée. C'est pourquoi la pertinence est `List[List[tuple[str, float]]]`, où la liste extérieure représente les requêtes et la liste intérieure les documents pertinents. Le tuple contient une paire str, float où la chaîne représente l'identifiant du document source (correspond au tenseur `id` dans le jeu de données), tandis que le float correspond à la mesure dans laquelle le document actuel est lié à la question.

Maintenant, générons des questions synthétiques et de la pertinence :

```python
from typing import List

from langchain.chains.openai_functions import (
    create_structured_output_chain,
)
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
```

```python
# fetch dataset docs and ids if they exist (optional you can also ingest)
docs = db.vectorstore.dataset.text.data(fetch_chunks=True, aslist=True)["value"]
ids = db.vectorstore.dataset.id.data(fetch_chunks=True, aslist=True)["value"]
```

```python
# If we pass in a model explicitly, we need to make sure it supports the OpenAI function-calling API.
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


class Questions(BaseModel):
    """Identifying information about a person."""

    question: str = Field(..., description="Questions about text")


prompt_msgs = [
    SystemMessage(
        content="You are a world class expert for generating questions based on provided context. \
                You make sure the question can be answered by the text."
    ),
    HumanMessagePromptTemplate.from_template(
        "Use the given text to generate a question from the following input: {input}"
    ),
    HumanMessage(content="Tips: Make sure to answer in the correct format"),
]
prompt = ChatPromptTemplate(messages=prompt_msgs)
chain = create_structured_output_chain(Questions, llm, prompt, verbose=True)

text = "# Understanding Hallucinations and Bias ## **Introduction** In this lesson, we'll cover the concept of **hallucinations** in LLMs, highlighting their influence on AI applications and demonstrating how to mitigate them using techniques like the retriever's architectures. We'll also explore **bias** within LLMs with examples."
questions = chain.run(input=text)
print(questions)
```

```python
import random

from langchain_openai import OpenAIEmbeddings
from tqdm import tqdm


def generate_queries(docs: List[str], ids: List[str], n: int = 100):
    questions = []
    relevances = []
    pbar = tqdm(total=n)
    while len(questions) < n:
        # 1. randomly draw a piece of text and relevance id
        r = random.randint(0, len(docs) - 1)
        text, label = docs[r], ids[r]

        # 2. generate queries and assign and relevance id
        generated_qs = [chain.run(input=text).question]
        questions.extend(generated_qs)
        relevances.extend([[(label, 1)] for _ in generated_qs])
        pbar.update(len(generated_qs))
        if len(questions) % 10 == 0:
            print(f"q: {len(questions)}")
    return questions[:n], relevances[:n]


chain = create_structured_output_chain(Questions, llm, prompt, verbose=False)
questions, relevances = generate_queries(docs, ids, n=200)

train_questions, train_relevances = questions[:100], relevances[:100]
test_questions, test_relevances = questions[100:], relevances[100:]
```

Nous avons maintenant créé 100 requêtes d'entraînement ainsi que 100 requêtes de test. Entraînons maintenant le deep_memory :

```python
job_id = db.vectorstore.deep_memory.train(
    queries=train_questions,
    relevance=train_relevances,
)
```

Suivons la progression de l'entraînement :

```python
db.vectorstore.deep_memory.status("6538939ca0b69a9ca45c528c")
```

```output

--------------------------------------------------------------
|                  6538e02ecda4691033a51c5b                  |
--------------------------------------------------------------
| status                     | completed                     |
--------------------------------------------------------------
| progress                   | eta: 1.4 seconds              |
|                            | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
| results                    | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
```

## 3. Évaluation des performances de Deep Memory

Excellent, nous avons entraîné le modèle ! Il montre une amélioration substantielle du rappel, mais comment pouvons-nous l'utiliser maintenant et l'évaluer sur de nouvelles données inédites ? Dans cette section, nous approfondirons l'évaluation du modèle et la partie inférence, et verrons comment il peut être utilisé avec LangChain afin d'augmenter la précision de la récupération.

### 3.1 Évaluation de Deep Memory

Pour commencer, nous pouvons utiliser la méthode d'évaluation intégrée de deep_memory.
Il calcule plusieurs métriques de `rappel`.
Cela peut être fait facilement en quelques lignes de code.

```python
recall = db.vectorstore.deep_memory.evaluate(
    queries=test_questions,
    relevance=test_relevances,
)
```

```output

Embedding queries took 0.81 seconds
---- Evaluating without model ----
Recall@1:	  9.0%
Recall@3:	  19.0%
Recall@5:	  24.0%
Recall@10:	  42.0%
Recall@50:	  93.0%
Recall@100:	  98.0%
---- Evaluating with model ----
Recall@1:	  19.0%
Recall@3:	  42.0%
Recall@5:	  49.0%
Recall@10:	  69.0%
Recall@50:	  97.0%
Recall@100:	  97.0%
```

Il montre une amélioration assez substantielle sur un jeu de test inédit également !!!

### 3.2 Deep Memory + RAG

```python
from ragas.langchain import RagasEvaluatorChain
from ragas.metrics import (
    context_recall,
)
```

Convertissons le rappel en vérités de terrain :

```python
def convert_relevance_to_ground_truth(docs, relevance):
    ground_truths = []

    for rel in relevance:
        ground_truth = []
        for doc_id, _ in rel:
            ground_truth.append(docs[doc_id])
        ground_truths.append(ground_truth)
    return ground_truths
```

```python
ground_truths = convert_relevance_to_ground_truth(docs, test_relevances)

for deep_memory in [False, True]:
    print("\nEvaluating with deep_memory =", deep_memory)
    print("===================================")

    retriever = db.as_retriever()
    retriever.search_kwargs["deep_memory"] = deep_memory

    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(model="gpt-3.5-turbo"),
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
    )

    metrics = {
        "context_recall_score": 0,
    }

    eval_chains = {m.name: RagasEvaluatorChain(metric=m) for m in [context_recall]}

    for question, ground_truth in zip(test_questions, ground_truths):
        result = qa_chain({"query": question})
        result["ground_truths"] = ground_truth
        for name, eval_chain in eval_chains.items():
            score_name = f"{name}_score"
            metrics[score_name] += eval_chain(result)[score_name]

    for metric in metrics:
        metrics[metric] /= len(test_questions)
        print(f"{metric}: {metrics[metric]}")
    print("===================================")
```

```output

Evaluating with deep_memory = False
===================================
context_recall_score = 0.3763423145
===================================

Evaluating with deep_memory = True
===================================
context_recall_score = 0.5634545323
===================================
```

### 3.3 Inférence Deep Memory

#### TODO: Add image

avec deep_memory

```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = True
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
print(qa.run(query))
```

```output
The base htype of the 'video_seq' tensor is 'video'.
```

sans deep_memory

```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = False
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
qa.run(query)
```

```output
The text does not provide information on the base htype of the 'video_seq' tensor.
```

### 3.4 Économies de coûts de Deep Memory

Deep Memory augmente la précision de la récupération sans modifier votre flux de travail existant. De plus, en réduisant le top_k en entrée dans le LLM, vous pouvez réduire considérablement les coûts d'inférence grâce à une utilisation de jetons plus faible.
