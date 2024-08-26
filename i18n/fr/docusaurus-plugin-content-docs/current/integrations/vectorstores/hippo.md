---
translated: true
---

# Hippo

>[Transwarp Hippo](https://www.transwarp.cn/en/subproduct/hippo) est une base de données vectorielle distribuée de niveau entreprise, native du cloud, qui prend en charge le stockage, la récupération et la gestion de jeux de données vectoriels massifs. Il résout efficacement des problèmes tels que la recherche de similarité vectorielle et le clustering vectoriel haute densité. `Hippo` offre une haute disponibilité, de hautes performances et une évolutivité facile. Il dispose de nombreuses fonctions, telles que plusieurs index de recherche vectorielle, le partitionnement et le fractionnement des données, la persistance des données, l'ingestion de données incrémentielle, le filtrage des champs scalaires vectoriels et les requêtes mixtes. Il peut répondre efficacement aux demandes de recherche en temps réel élevées des entreprises pour les données vectorielles massives.

## Démarrage

La seule condition préalable ici est une clé API du site Web d'OpenAI. Assurez-vous d'avoir déjà démarré une instance Hippo.

## Installation des dépendances

Initialement, nous devons installer certaines dépendances, telles que OpenAI, Langchain et Hippo-API. Veuillez noter que vous devez installer les versions appropriées adaptées à votre environnement.

```python
%pip install --upgrade --quiet  langchain tiktoken langchain-openai
%pip install --upgrade --quiet  hippo-api==1.1.0.rc3
```

```output
Requirement already satisfied: hippo-api==1.1.0.rc3 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (1.1.0rc3)
Requirement already satisfied: pyyaml>=6.0 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (from hippo-api==1.1.0.rc3) (6.0.1)
```

Remarque : la version Python doit être ≥ 3.8.

## Meilleures pratiques

### Importation des packages de dépendance

```python
import os

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hippo import Hippo
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Chargement des documents de connaissances

```python
os.environ["OPENAI_API_KEY"] = "YOUR OPENAI KEY"
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

### Segmentation du document de connaissances

Ici, nous utilisons CharacterTextSplitter de Langchain pour la segmentation. Le délimiteur est un point. Après la segmentation, le segment de texte ne dépasse pas 1000 caractères et le nombre de caractères répétés est de 0.

```python
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### Déclaration du modèle d'intégration

Ci-dessous, nous créons le modèle d'intégration OpenAI ou Azure à l'aide de la méthode OpenAIEmbeddings de Langchain.

```python
# openai
embeddings = OpenAIEmbeddings()
# azure
# embeddings = OpenAIEmbeddings(
#     openai_api_type="azure",
#     openai_api_base="x x x",
#     openai_api_version="x x x",
#     model="x x x",
#     deployment="x x x",
#     openai_api_key="x x x"
# )
```

### Déclaration du client Hippo

```python
HIPPO_CONNECTION = {"host": "IP", "port": "PORT"}
```

### Stockage du document

```python
print("input...")
# insert docs
vector_store = Hippo.from_documents(
    docs,
    embedding=embeddings,
    table_name="langchain_test",
    connection_args=HIPPO_CONNECTION,
)
print("success")
```

```output
input...
success
```

### Conduite de la question-réponse basée sur les connaissances

#### Création d'un modèle de question-réponse en langage naturel à grande échelle

Ci-dessous, nous créons le modèle de question-réponse en langage naturel à grande échelle OpenAI ou Azure respectivement à l'aide des méthodes AzureChatOpenAI et ChatOpenAI de Langchain.

```python
# llm = AzureChatOpenAI(
#     openai_api_base="x x x",
#     openai_api_version="xxx",
#     deployment_name="xxx",
#     openai_api_key="xxx",
#     openai_api_type="azure"
# )

llm = ChatOpenAI(openai_api_key="YOUR OPENAI KEY", model_name="gpt-3.5-turbo-16k")
```

### Acquisition des connaissances connexes en fonction de la question :

```python
query = "Please introduce COVID-19"
# query = "Please introduce Hippo Core Architecture"
# query = "What operations does the Hippo Vector Database support for vector data?"
# query = "Does Hippo use hardware acceleration technology? Briefly introduce hardware acceleration technology."


# Retrieve similar content from the knowledge base,fetch the top two most similar texts.
res = vector_store.similarity_search(query, 2)
content_list = [item.page_content for item in res]
text = "".join(content_list)
```

### Construction d'un modèle d'invite

```python
prompt = f"""
Please use the content of the following [Article] to answer my question. If you don't know, please say you don't know, and the answer should be concise."
[Article]:{text}
Please answer this question in conjunction with the above article:{query}
"""
```

### Attente de la génération de la réponse par le modèle de langage à grande échelle

```python
response_with_hippo = llm.predict(prompt)
print(f"response_with_hippo:{response_with_hippo}")
response = llm.predict(query)
print("==========================================")
print(f"response_without_hippo:{response}")
```

```output
response_with_hippo:COVID-19 is a virus that has impacted every aspect of our lives for over two years. It is a highly contagious and mutates easily, requiring us to remain vigilant in combating its spread. However, due to progress made and the resilience of individuals, we are now able to move forward safely and return to more normal routines.
==========================================
response_without_hippo:COVID-19 is a contagious respiratory illness caused by the novel coronavirus SARS-CoV-2. It was first identified in December 2019 in Wuhan, China and has since spread globally, leading to a pandemic. The virus primarily spreads through respiratory droplets when an infected person coughs, sneezes, talks, or breathes, and can also spread by touching contaminated surfaces and then touching the face. COVID-19 symptoms include fever, cough, shortness of breath, fatigue, muscle or body aches, sore throat, loss of taste or smell, headache, and in severe cases, pneumonia and organ failure. While most people experience mild to moderate symptoms, it can lead to severe illness and even death, particularly among older adults and those with underlying health conditions. To combat the spread of the virus, various preventive measures have been implemented globally, including social distancing, wearing face masks, practicing good hand hygiene, and vaccination efforts.
```
