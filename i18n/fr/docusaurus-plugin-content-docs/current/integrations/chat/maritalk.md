---
translated: true
---

<a href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/chat/maritalk.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

# Maritalk

## Introduction

MariTalk est un assistant développé par la société brésilienne [Maritaca AI](https://www.maritaca.ai). 
MariTalk est basé sur des modèles de langage qui ont été spécialement entraînés pour bien comprendre le portugais.

Ce notebook montre comment utiliser MariTalk avec LangChain à travers deux exemples :

1. Un exemple simple de la façon d'utiliser MariTalk pour effectuer une tâche.
2. LLM + RAG : Le deuxième exemple montre comment répondre à une question dont la réponse se trouve dans un long document qui ne rentre pas dans la limite de jetons de MariTalk. Pour cela, nous utiliserons un simple moteur de recherche (BM25) pour d'abord rechercher les sections les plus pertinentes, puis les transmettre à MariTalk pour répondre.

## Installation

Tout d'abord, installez la bibliothèque LangChain (et toutes ses dépendances) à l'aide de la commande suivante :

```python
!pip install langchain langchain-core langchain-community httpx
```

## Clé API

Vous aurez besoin d'une clé API qui peut être obtenue à partir de chat.maritaca.ai (section "Chaves da API").

### Exemple 1 - Suggestions de noms d'animaux de compagnie

Définissons notre modèle de langage, ChatMaritalk, et configurons-le avec votre clé API.

```python
from langchain_community.chat_models import ChatMaritalk
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate

llm = ChatMaritalk(
    model="sabia-2-medium",  # Available models: sabia-2-small and sabia-2-medium
    api_key="",  # Insert your API key here
    temperature=0.7,
    max_tokens=100,
)

output_parser = StrOutputParser()

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an assistant specialized in suggesting pet names. Given the animal, you must suggest 4 names.",
        ),
        ("human", "I have a {animal}"),
    ]
)

chain = chat_prompt | llm | output_parser

response = chain.invoke({"animal": "dog"})
print(response)  # should answer something like "1. Max\n2. Bella\n3. Charlie\n4. Rocky"
```

### Génération en flux

Pour les tâches impliquant la génération de longs textes, comme la création d'un article détaillé ou la traduction d'un gros document, il peut être avantageux de recevoir la réponse par parties, au fur et à mesure que le texte est généré, plutôt que d'attendre le texte complet. Cela rend l'application plus réactive et efficace, surtout lorsque le texte généré est important. Nous proposons deux approches pour répondre à ce besoin : l'une synchrone et l'autre asynchrone.

#### Synchrone :

```python
from langchain_core.messages import HumanMessage

messages = [HumanMessage(content="Suggest 3 names for my dog")]

for chunk in llm.stream(messages):
    print(chunk.content, end="", flush=True)
```

#### Asynchrone :

```python
from langchain_core.messages import HumanMessage


async def async_invoke_chain(animal: str):
    messages = [HumanMessage(content=f"Suggest 3 names for my {animal}")]
    async for chunk in llm._astream(messages):
        print(chunk.message.content, end="", flush=True)


await async_invoke_chain("dog")
```

### Exemple 2 - RAG + LLM : Système de réponse aux questions de l'examen d'entrée de l'UNICAMP 2024

Pour cet exemple, nous devons installer quelques bibliothèques supplémentaires :

```python
!pip install unstructured rank_bm25 pdf2image pdfminer-six pikepdf pypdf unstructured_inference fastapi kaleido uvicorn "pillow<10.1.0" pillow_heif -q
```

#### Chargement de la base de données

La première étape consiste à créer une base de données avec les informations de l'avis. Pour cela, nous allons télécharger l'avis du site web de COMVEST et segmenter le texte extrait en fenêtres de 500 caractères.

```python
from langchain.document_loaders import OnlinePDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Loading the COMVEST 2024 notice
loader = OnlinePDFLoader(
    "https://www.comvest.unicamp.br/wp-content/uploads/2023/10/31-2023-Dispoe-sobre-o-Vestibular-Unicamp-2024_com-retificacao.pdf"
)
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=100, separators=["\n", " ", ""]
)
texts = text_splitter.split_documents(data)
```

#### Création d'un moteur de recherche

Maintenant que nous avons notre base de données, nous avons besoin d'un moteur de recherche. Pour cet exemple, nous utiliserons un simple BM25 comme système de recherche, mais celui-ci pourrait être remplacé par n'importe quel autre moteur de recherche (comme la recherche par embeddings).

```python
from langchain.retrievers import BM25Retriever

retriever = BM25Retriever.from_documents(texts)
```

#### Combinaison du système de recherche + LLM

Maintenant que nous avons notre moteur de recherche, il suffit de mettre en œuvre une invite spécifiant la tâche et d'invoquer la chaîne.

```python
from langchain.chains.question_answering import load_qa_chain

prompt = """Baseado nos seguintes documentos, responda a pergunta abaixo.

{context}

Pergunta: {query}
"""

qa_prompt = ChatPromptTemplate.from_messages([("human", prompt)])

chain = load_qa_chain(llm, chain_type="stuff", verbose=True, prompt=qa_prompt)

query = "Qual o tempo máximo para realização da prova?"

docs = retriever.invoke(query)

chain.invoke(
    {"input_documents": docs, "query": query}
)  # Should output something like: "O tempo máximo para realização da prova é de 5 horas."
```
