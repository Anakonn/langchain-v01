---
translated: true
---

# RAGatouille

[RAGatouille](https://github.com/bclavie/RAGatouille) facilita al máximo el uso de ColBERT. [ColBERT](https://github.com/stanford-futuredata/ColBERT) es un modelo de recuperación rápido y preciso, que permite una búsqueda escalable basada en BERT sobre grandes colecciones de texto en decenas de milisegundos.

Hay múltiples formas de usar RAGatouille.

## Configuración

La integración se encuentra en el paquete `ragatouille`.

```bash
pip install -U ragatouille
```

```python
from ragatouille import RAGPretrainedModel

RAG = RAGPretrainedModel.from_pretrained("colbert-ir/colbertv2.0")
```

```output
[Jan 10, 10:53:28] Loading segmented_maxsim_cpp extension (set COLBERT_LOAD_TORCH_EXTENSION_VERBOSE=True for more info)...

/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/cuda/amp/grad_scaler.py:125: UserWarning: torch.cuda.amp.GradScaler is enabled, but CUDA is not available.  Disabling.
  warnings.warn(
```

## Recuperador

Podemos usar RAGatouille como un recuperador. Para más información sobre esto, consulta [RAGatouille Retriever](/docs/integrations/retrievers/ragatouille)

## Compresor de documentos

También podemos usar RAGatouille fuera de la caja como un reordenador. Esto nos permitirá usar ColBERT para reordenar los resultados recuperados de cualquier recuperador genérico. Los beneficios de esto son que podemos hacerlo sobre cualquier índice existente, por lo que no necesitamos crear un nuevo índice. Podemos hacer esto usando la abstracción [document compressor](/docs/modules/data_connection/retrievers/contextual_compression) en LangChain.

## Configurar el recuperador básico

Primero, configuremos un recuperador básico como ejemplo.

```python
import requests
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


def get_wikipedia_page(title: str):
    """
    Retrieve the full text content of a Wikipedia page.

    :param title: str - Title of the Wikipedia page.
    :return: str - Full text content of the page as raw string.
    """
    # Wikipedia API endpoint
    URL = "https://en.wikipedia.org/w/api.php"

    # Parameters for the API request
    params = {
        "action": "query",
        "format": "json",
        "titles": title,
        "prop": "extracts",
        "explaintext": True,
    }

    # Custom User-Agent header to comply with Wikipedia's best practices
    headers = {"User-Agent": "RAGatouille_tutorial/0.0.1 (ben@clavie.eu)"}

    response = requests.get(URL, params=params, headers=headers)
    data = response.json()

    # Extracting page content
    page = next(iter(data["query"]["pages"].values()))
    return page["extract"] if "extract" in page else None


text = get_wikipedia_page("Hayao_Miyazaki")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
texts = text_splitter.create_documents([text])
```

```python
retriever = FAISS.from_documents(texts, OpenAIEmbeddings()).as_retriever(
    search_kwargs={"k": 10}
)
```

```python
docs = retriever.invoke("What animation studio did Miyazaki found")
docs[0]
```

```output
Document(page_content='collaborative projects. In April 1984, Miyazaki opened his own office in Suginami Ward, naming it Nibariki.')
```

Podemos ver que el resultado no es muy relevante para la pregunta planteada.

## Usar ColBERT como reordenador

```python
from langchain.retrievers import ContextualCompressionRetriever

compression_retriever = ContextualCompressionRetriever(
    base_compressor=RAG.as_langchain_document_compressor(), base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What animation studio did Miyazaki found"
)
```

```output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/amp/autocast_mode.py:250: UserWarning: User provided device_type of 'cuda', but CUDA is not available. Disabling
  warnings.warn(
```

```python
compressed_docs[0]
```

```output
Document(page_content='In June 1985, Miyazaki, Takahata, Tokuma and Suzuki founded the animation production company Studio Ghibli, with funding from Tokuma Shoten. Studio Ghibli\'s first film, Laputa: Castle in the Sky (1986), employed the same production crew of Nausicaä. Miyazaki\'s designs for the film\'s setting were inspired by Greek architecture and "European urbanistic templates". Some of the architecture in the film was also inspired by a Welsh mining town; Miyazaki witnessed the mining strike upon his first', metadata={'relevance_score': 26.5194149017334})
```

¡Esta respuesta es mucho más relevante!
