---
translated: true
---

# RAGatouille

[RAGatouille](https://github.com/bclavie/RAGatouille)는 ColBERT를 사용하는 것을 매우 간단하게 만듭니다! [ColBERT](https://github.com/stanford-futuredata/ColBERT)는 빠르고 정확한 검색 모델로, 대용량 텍스트 컬렉션에서 BERT 기반 검색을 수십 밀리초 내에 수행할 수 있습니다.

RAGatouille를 사용하는 다양한 방법이 있습니다.

## 설정

통합은 `ragatouille` 패키지에 있습니다.

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

## 검색기

RAGatouille를 검색기로 사용할 수 있습니다. 자세한 내용은 [RAGatouille 검색기](/docs/integrations/retrievers/ragatouille)를 참조하세요.

## 문서 압축기

또한 RAGatouille를 재순위화기로 사용할 수 있습니다. 이를 통해 ColBERT를 사용하여 검색 결과를 재순위화할 수 있습니다. 이 방법의 장점은 새로운 인덱스를 생성할 필요 없이 기존 인덱스 위에서 작업할 수 있다는 것입니다. LangChain의 [문서 압축기](/docs/modules/data_connection/retrievers/contextual_compression) 추상화를 사용하여 이를 수행할 수 있습니다.

## 기본 검색기 설정

먼저 예제로 기본 검색기를 설정해 보겠습니다.

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

질문에 매우 관련성이 없는 결과를 볼 수 있습니다.

## ColBERT를 재순위화기로 사용하기

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

이 답변이 훨씬 더 관련성이 높습니다!
