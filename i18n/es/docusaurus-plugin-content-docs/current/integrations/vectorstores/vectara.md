---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) es la plataforma confiable de GenAI que proporciona una API fácil de usar para la indexación y consulta de documentos.

Vectara proporciona un servicio gestionado de extremo a extremo para la Generación Aumentada por Recuperación o [RAG](https://vectara.com/grounded-generation/), que incluye:

1. Una forma de extraer texto de archivos de documentos y dividirlos en oraciones.

2. El modelo de embeddings [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) de última generación. Cada fragmento de texto se codifica en una incrustación vectorial utilizando Boomerang, y se almacena en el almacén de conocimiento interno de Vectara (vector+texto)

3. Un servicio de consulta que codifica automáticamente la consulta en una incrustación, y recupera los segmentos de texto más relevantes (incluyendo soporte para [Búsqueda Híbrida](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) y [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/)).

4. Una opción para crear [resúmenes generativos](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview) basados en los documentos recuperados, incluyendo citas.

Consulta la [documentación de la API de Vectara](https://docs.vectara.com/docs/) para obtener más información sobre cómo usar la API.

Este cuaderno muestra cómo usar la funcionalidad básica de recuperación, cuando se utiliza Vectara solo como un Almacén Vectorial (sin resumen), incluyendo: `similarity_search` y `similarity_search_with_score`, así como el uso de la funcionalidad `as_retriever` de LangChain.

# Configuración

Necesitarás una cuenta de Vectara para usar Vectara con LangChain. Para comenzar, utiliza los siguientes pasos:

1. [Regístrate](https://www.vectara.com/integrations/langchain) para obtener una cuenta de Vectara si aún no tienes una. Una vez que completes tu registro, tendrás un ID de cliente de Vectara. Puedes encontrar tu ID de cliente haciendo clic en tu nombre, en la parte superior derecha de la ventana de la consola de Vectara.

2. Dentro de tu cuenta puedes crear uno o más corpus. Cada corpus representa un área que almacena datos de texto tras la ingestión de documentos de entrada. Para crear un corpus, utiliza el botón **"Create Corpus"**. Luego proporcionas un nombre a tu corpus así como una descripción. Opcionalmente, puedes definir atributos de filtrado y aplicar algunas opciones avanzadas. Si haces clic en tu corpus creado, puedes ver su nombre e ID de corpus en la parte superior.

3. A continuación, necesitarás crear claves API para acceder al corpus. Haz clic en la pestaña **"Authorization"** en la vista del corpus y luego en el botón **"Create API Key"**. Dale un nombre a tu clave y elige si deseas solo consulta o consulta+indexado para tu clave. Haz clic en "Create" y ahora tienes una clave API activa. Mantén esta clave confidencial.

Para usar LangChain con Vectara, necesitarás tener estos tres valores: ID de cliente, ID de corpus y api_key.
Puedes proporcionar estos a LangChain de dos maneras:

1. Incluye en tu entorno estas tres variables: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` y `VECTARA_API_KEY`.

> Por ejemplo, puedes configurar estas variables usando os.environ y getpass de la siguiente manera:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Añádelas al constructor del vectorstore de Vectara:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

## Conectándose a Vectara desde LangChain

Para comenzar, vamos a ingerir los documentos usando el método from_documents().
Asumimos aquí que has añadido tu VECTARA_CUSTOMER_ID, VECTARA_CORPUS_ID y VECTARA_API_KEY de consulta+indexado como variables de entorno.

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

La API de indexación de Vectara proporciona una API de carga de archivos donde el archivo es manejado directamente por Vectara: preprocesado, dividido óptimamente y añadido al almacén vectorial de Vectara.
Para usar esto, añadimos el método add_files() (así como from_files()).

Vamos a ver esto en acción. Elegimos dos documentos PDF para cargar:

1. El discurso "I have a dream" del Dr. King
2. El discurso "We Shall Fight on the Beaches" de Churchill

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

## Búsqueda por similitud

El escenario más simple para usar Vectara es realizar una búsqueda por similitud.

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

## Búsqueda por similitud con puntuación

A veces queremos realizar la búsqueda, pero también obtener una puntuación de relevancia para saber qué tan bueno es un resultado en particular.

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

Ahora hagamos una búsqueda similar para contenido en los archivos que cargamos

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

MMR es una capacidad de recuperación importante para muchas aplicaciones, mediante la cual los resultados de búsqueda que alimentan tu aplicación GenAI se reordenan para mejorar la diversidad de los resultados.

Vamos a ver cómo funciona esto con Vectara:

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

Como puedes ver, en el primer ejemplo el bias de diversidad se configuró en 0.0 (equivalente a la reordenación de diversidad deshabilitada), lo que resultó en los 5 documentos más relevantes. Con diversity_bias=1.0 maximizamos la diversidad y, como puedes ver, los documentos principales resultantes son mucho más diversos en sus significados semánticos.

## Vectara como un Recuperador

Finalmente, veamos cómo usar Vectara con la interfaz `as_retriever()`:

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
