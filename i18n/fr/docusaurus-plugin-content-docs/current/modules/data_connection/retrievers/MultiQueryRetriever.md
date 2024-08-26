---
translated: true
---

# Récupérateur de requêtes multiples

La récupération de base de données vectorielles basée sur la distance intègre (représente) les requêtes dans un espace à haute dimension et trouve des documents intégrés similaires en fonction de la "distance". Mais la récupération peut produire des résultats différents avec de subtils changements dans le libellé de la requête ou si les intégrations ne capturent pas bien la sémantique des données. L'ingénierie/l'ajustement des invites est parfois effectué pour résoudre manuellement ces problèmes, mais peut être fastidieux.

Le `MultiQueryRetriever` automatise le processus d'ajustement des invites en utilisant un LLM pour générer plusieurs requêtes de différents points de vue pour une requête d'entrée d'utilisateur donnée. Pour chaque requête, il récupère un ensemble de documents pertinents et prend l'union unique de tous les requêtes pour obtenir un ensemble plus important de documents potentiellement pertinents. En générant plusieurs perspectives sur la même question, le `MultiQueryRetriever` pourrait être en mesure de surmonter certaines des limites de la récupération basée sur la distance et d'obtenir un ensemble de résultats plus riche.

```python
# Build a sample vectorDB
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load blog post
loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
data = loader.load()

# Split
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
splits = text_splitter.split_documents(data)

# VectorDB
embedding = OpenAIEmbeddings()
vectordb = Chroma.from_documents(documents=splits, embedding=embedding)
```

#### Utilisation simple

Spécifiez le LLM à utiliser pour la génération de requêtes, et le récupérateur fera le reste.

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

question = "What are the approaches to Task Decomposition?"
llm = ChatOpenAI(temperature=0)
retriever_from_llm = MultiQueryRetriever.from_llm(
    retriever=vectordb.as_retriever(), llm=llm
)
```

```python
# Set logging for the queries
import logging

logging.basicConfig()
logging.getLogger("langchain.retrievers.multi_query").setLevel(logging.INFO)
```

```python
unique_docs = retriever_from_llm.invoke(question)
len(unique_docs)
```

```output
INFO:langchain.retrievers.multi_query:Generated queries: ['1. How can Task Decomposition be approached?', '2. What are the different methods for Task Decomposition?', '3. What are the various approaches to decomposing tasks?']
```

```output
5
```

#### Fournir votre propre invite

Vous pouvez également fournir une invite avec un analyseur de sortie pour diviser les résultats en une liste de requêtes.

```python
from typing import List

from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field


# Output parser will split the LLM result into a list of queries
class LineList(BaseModel):
    # "lines" is the key (attribute name) of the parsed output
    lines: List[str] = Field(description="Lines of text")


class LineListOutputParser(PydanticOutputParser):
    def __init__(self) -> None:
        super().__init__(pydantic_object=LineList)

    def parse(self, text: str) -> LineList:
        lines = text.strip().split("\n")
        return LineList(lines=lines)


output_parser = LineListOutputParser()

QUERY_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an AI language model assistant. Your task is to generate five
    different versions of the given user question to retrieve relevant documents from a vector
    database. By generating multiple perspectives on the user question, your goal is to help
    the user overcome some of the limitations of the distance-based similarity search.
    Provide these alternative questions separated by newlines.
    Original question: {question}""",
)
llm = ChatOpenAI(temperature=0)

# Chain
llm_chain = LLMChain(llm=llm, prompt=QUERY_PROMPT, output_parser=output_parser)

# Other inputs
question = "What are the approaches to Task Decomposition?"
```

```python
# Run
retriever = MultiQueryRetriever(
    retriever=vectordb.as_retriever(), llm_chain=llm_chain, parser_key="lines"
)  # "lines" is the key (attribute name) of the parsed output

# Results
unique_docs = retriever.invoke(query="What does the course say about regression?")
len(unique_docs)
```

```output
INFO:langchain.retrievers.multi_query:Generated queries: ["1. What is the course's perspective on regression?", '2. Can you provide information on regression as discussed in the course?', '3. How does the course cover the topic of regression?', "4. What are the course's teachings on regression?", '5. In relation to the course, what is mentioned about regression?']
```

```output
11
```
