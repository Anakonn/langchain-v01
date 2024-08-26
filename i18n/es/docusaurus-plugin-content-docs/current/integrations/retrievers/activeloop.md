---
translated: true
---

# Memoria profunda de Activeloop

>[Activeloop Deep Memory](https://docs.activeloop.ai/performance-features/deep-memory) es un conjunto de herramientas que le permite optimizar su Vector Store para su caso de uso y lograr una mayor precisión en sus aplicaciones LLM.

`Retrieval-Augmented Generatation` (`RAG`) ha ganado recientemente una atención significativa. A medida que surgen técnicas y agentes avanzados de RAG, expanden el potencial de lo que pueden lograr los RAG. Sin embargo, varios desafíos pueden limitar la integración de los RAG en la producción. Los principales factores a considerar al implementar los RAG en entornos de producción son la precisión (recuperación), el costo y la latencia. Para casos de uso básicos, el modelo Ada de OpenAI emparejado con una búsqueda de similitud ingenua puede producir resultados satisfactorios. Sin embargo, para una mayor precisión o recuperación durante las búsquedas, es posible que se deba emplear técnicas de recuperación avanzadas. Estos métodos pueden implicar variar los tamaños de los fragmentos de datos, reescribir las consultas varias veces y más, lo que potencialmente aumenta la latencia y los costos. [Deep Memory](https://www.activeloop.ai/resources/use-deep-memory-to-boost-rag-apps-accuracy-by-up-to-22/) de Activeloop, una función disponible para los usuarios de `Activeloop Deep Lake`, aborda estos problemas al introducir una capa de red neuronal diminuta entrenada para hacer coincidir las consultas de los usuarios con los datos relevantes de un corpus. Si bien esta adición conlleva una latencia mínima durante la búsqueda, puede aumentar la precisión de la recuperación en hasta un 27% y sigue siendo rentable y fácil de usar, sin requerir técnicas rag avanzadas adicionales.

Para este tutorial, analizaremos la documentación de `DeepLake` y crearemos un sistema RAG que podría responder a la pregunta de la documentación.

## 1. Creación del conjunto de datos

Analizaremos la documentación de Activeloop usando la biblioteca `BeautifulSoup` y los transformadores de documentos de LangChain como `Html2TextTransformer` y `AsyncHtmlLoader`. Por lo tanto, necesitaremos instalar las siguientes bibliotecas:

```python
%pip install --upgrade --quiet  tiktoken langchain-openai python-dotenv datasets langchain deeplake beautifulsoup4 html2text ragas
```

También deberá crear una cuenta de [Activeloop](https://activeloop.ai).

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

Analizando todos los enlaces de la página web usando `BeautifulSoup`

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

Cargando datos:

```python
from langchain_community.document_loaders.async_html import AsyncHtmlLoader

loader = AsyncHtmlLoader(all_links)
docs = loader.load()
```

Convirtiendo los datos a un formato legible para el usuario:

```python
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
```

Ahora, dividiremos aún más los documentos, ya que algunos de ellos contienen demasiado texto:

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

Poblando VectorStore:

```python
docs = db.add_documents(docs_new)
```

## 2. Generación de consultas sintéticas y entrenamiento de Deep Memory

El siguiente paso sería entrenar un modelo deep_memory que alineará las consultas de sus usuarios con el conjunto de datos que ya tiene. Si aún no tiene ninguna consulta de usuario, no se preocupe, ¡las generaremos usando LLM!

#### TODO: Agregar imagen

Aquí arriba mostramos el esquema general de cómo funciona deep_memory. Entonces, como puede ver, para entrenarlo necesita relevancia, consultas junto con los datos del corpus (datos que queremos consultar). Los datos del corpus ya se poblaron en la sección anterior, aquí estaremos generando preguntas y relevancia.

1. `questions` - es un texto de cadenas, donde cada cadena representa una consulta
2. `relevance` - contiene enlaces a la verdad fundamental para cada pregunta. Puede haber varios documentos que contengan la respuesta a la pregunta dada. Debido a esto, la relevancia es `List[List[tuple[str, float]]]`, donde la lista externa representa las consultas y la lista interna los documentos relevantes. La tupla contiene un par str, float donde la cadena representa el id del documento fuente (corresponde al tensor `id` en el conjunto de datos), mientras que el float corresponde a cuánto se relaciona el documento actual con la pregunta.

Ahora, generemos preguntas y relevancia sintéticas:

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

Ahora creamos 100 consultas de entrenamiento y 100 consultas de prueba. Ahora entrenemos el deep_memory:

```python
job_id = db.vectorstore.deep_memory.train(
    queries=train_questions,
    relevance=train_relevances,
)
```

Sigamos el progreso del entrenamiento:

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

## 3. Evaluación del rendimiento de Deep Memory

¡Genial, hemos entrenado el modelo! Muestra una mejora sustancial en la recuperación, pero ¿cómo podemos usarlo ahora y evaluarlo en datos nuevos y no vistos? En esta sección profundizaremos en la evaluación del modelo y la parte de inferencia y veremos cómo se puede usar con LangChain para aumentar la precisión de la recuperación.

### 3.1 Evaluación de Deep Memory

Para comenzar, podemos usar el método de evaluación incorporado de deep_memory.
Calcula varias métricas de `recall`.
Se puede hacer fácilmente en unas pocas líneas de código.

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

¡Está mostrando una mejora bastante sustancial en un conjunto de pruebas no visto también!

### 3.2 Deep Memory + RAG

```python
from ragas.langchain import RagasEvaluatorChain
from ragas.metrics import (
    context_recall,
)
```

Convirtamos la recuperación en verdades fundamentales:

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

### 3.3 Inferencia de Deep Memory

#### TODO: Agregar imagen

con deep_memory

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

sin deep_memory

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

### 3.4 Ahorro de costos de Deep Memory

Deep Memory aumenta la precisión de la recuperación sin alterar su flujo de trabajo existente. Además, al reducir la entrada top_k en el LLM, puede reducir significativamente los costos de inferencia a través de un menor uso de tokens.
