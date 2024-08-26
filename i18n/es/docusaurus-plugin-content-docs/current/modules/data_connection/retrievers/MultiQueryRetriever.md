---
translated: true
---

# MultiQueryRetriever

La recuperación de bases de datos de vectores basada en distancia representa (representa) consultas en un espacio de alta dimensionalidad y encuentra documentos incrustados similares en función de la "distancia". Pero la recuperación puede producir diferentes resultados con cambios sutiles en la redacción de la consulta o si los incrustados no capturan bien la semántica de los datos. La ingeniería/ajuste de indicaciones a veces se realiza para abordar manualmente estos problemas, pero puede ser tedioso.

El `MultiQueryRetriever` automatiza el proceso de ajuste de indicaciones utilizando un LLM para generar múltiples consultas desde diferentes perspectivas para una consulta de entrada de usuario dada. Para cada consulta, recupera un conjunto de documentos relevantes y toma la unión única entre todas las consultas para obtener un conjunto más grande de documentos potencialmente relevantes. Al generar múltiples perspectivas sobre la misma pregunta, el `MultiQueryRetriever` podría ser capaz de superar algunas de las limitaciones de la recuperación basada en distancia y obtener un conjunto de resultados más rico.

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

#### Uso sencillo

Especifique el LLM que se utilizará para la generación de consultas, y el recuperador se encargará del resto.

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

#### Suministrar tu propia indicación

También puedes suministrar una indicación junto con un analizador de salida para dividir los resultados en una lista de consultas.

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
