---
translated: true
---

# 크로스 인코더 리랭커

이 노트북은 [Hugging Face 크로스 인코더 모델](https://huggingface.co/cross-encoder) 또는 크로스 인코더 기능을 구현하는 Hugging Face 모델([예: BAAI/bge-reranker-base](https://huggingface.co/BAAI/bge-reranker-base))을 사용하여 리트리버에서 리랭커를 구현하는 방법을 보여줍니다. `SagemakerEndpointCrossEncoder`를 사용하면 이러한 Hugging Face 모델을 Sagemaker에 로드할 수 있습니다.

이는 [ContextualCompressionRetriever](/docs/modules/data_connection/retrievers/contextual_compression/)의 아이디어를 기반으로 합니다. 이 문서의 전체 구조는 [Cohere Reranker 문서](/docs/integrations/retrievers/cohere-reranker)에서 가져왔습니다.

임베딩과 함께 리랭킹 메커니즘으로 크로스 인코더를 사용할 수 있는 이유에 대해서는 [Hugging Face Cross-Encoders 문서](https://www.sbert.net/examples/applications/cross-encoder/README.html)를 참조하십시오.

```python
#!pip install faiss sentence_transformers

# OR  (depending on Python version)

#!pip install faiss-cpu sentence_transformers
```

```python
# Helper function for printing docs


def pretty_print_docs(docs):
    print(
        f"\n{'-' * 100}\n".join(
            [f"Document {i+1}:\n\n" + d.page_content for i, d in enumerate(docs)]
        )
    )
```

## 기본 벡터 스토어 리트리버 설정

먼저 간단한 벡터 스토어 리트리버를 초기화하고 2023년 국정연설(chunks)을 저장해 보겠습니다. 리트리버를 설정하여 많은 수(20개)의 문서를 검색할 수 있습니다.

```python
from langchain.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = text_splitter.split_documents(documents)
embeddingsModel = HuggingFaceEmbeddings(
    model_name="sentence-transformers/msmarco-distilbert-dot-v5"
)
retriever = FAISS.from_documents(texts, embeddingsModel).as_retriever(
    search_kwargs={"k": 20}
)

query = "What is the plan for the economy?"
docs = retriever.invoke(query)
pretty_print_docs(docs)
```

## CrossEncoderReranker를 사용한 리랭킹

이제 기본 리트리버를 `ContextualCompressionRetriever`로 래핑해 보겠습니다. `CrossEncoderReranker`는 `HuggingFaceCrossEncoder`를 사용하여 반환된 결과를 다시 순위를 매깁니다.

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
compressor = CrossEncoderReranker(model=model, top_n=3)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke("What is the plan for the economy?")
pretty_print_docs(compressed_docs)
```

```output
Document 1:

More infrastructure and innovation in America.

More goods moving faster and cheaper in America.

More jobs where you can earn a good living in America.

And instead of relying on foreign supply chains, let’s make it in America.

Economists call it “increasing the productive capacity of our economy.”

I call it building a better America.

My plan to fight inflation will lower your costs and lower the deficit.
----------------------------------------------------------------------------------------------------
Document 2:

Second – cut energy costs for families an average of $500 a year by combatting climate change.

Let’s provide investments and tax credits to weatherize your homes and businesses to be energy efficient and you get a tax credit; double America’s clean energy production in solar, wind, and so much more;  lower the price of electric vehicles, saving you another $80 a month because you’ll never have to pay at the gas pump again.
----------------------------------------------------------------------------------------------------
Document 3:

Look at cars.

Last year, there weren’t enough semiconductors to make all the cars that people wanted to buy.

And guess what, prices of automobiles went up.

So—we have a choice.

One way to fight inflation is to drive down wages and make Americans poorer.

I have a better plan to fight inflation.

Lower your costs, not your wages.

Make more cars and semiconductors in America.

More infrastructure and innovation in America.

More goods moving faster and cheaper in America.
```

## Hugging Face 모델을 SageMaker 엔드포인트에 업로드하기

`SagemakerEndpointCrossEncoder`와 작동하는 엔드포인트를 만들기 위한 샘플 `inference.py`입니다. 자세한 내용과 단계별 지침은 [이 기사](https://huggingface.co/blog/kchoe/deploy-any-huggingface-model-to-sagemaker)를 참조하십시오.

모델 아티팩트(예: `pytorch_model.bin`)를 `model.tar.gz`에 보관할 필요 없이 Hugging Face 모델을 즉시 다운로드합니다.

```python
import json
import logging
from typing import List

import torch
from sagemaker_inference import encoder
from transformers import AutoModelForSequenceClassification, AutoTokenizer

PAIRS = "pairs"
SCORES = "scores"


class CrossEncoder:
    def __init__(self) -> None:
        self.device = (
            torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
        )
        logging.info(f"Using device: {self.device}")
        model_name = "BAAI/bge-reranker-base"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model = self.model.to(self.device)

    def __call__(self, pairs: List[List[str]]) -> List[float]:
        with torch.inference_mode():
            inputs = self.tokenizer(
                pairs,
                padding=True,
                truncation=True,
                return_tensors="pt",
                max_length=512,
            )
            inputs = inputs.to(self.device)
            scores = (
                self.model(**inputs, return_dict=True)
                .logits.view(
                    -1,
                )
                .float()
            )

        return scores.detach().cpu().tolist()


def model_fn(model_dir: str) -> CrossEncoder:
    try:
        return CrossEncoder()
    except Exception:
        logging.exception(f"Failed to load model from: {model_dir}")
        raise


def transform_fn(
    cross_encoder: CrossEncoder, input_data: bytes, content_type: str, accept: str
) -> bytes:
    payload = json.loads(input_data)
    model_output = cross_encoder(**payload)
    output = {SCORES: model_output}
    return encoder.encode(output, accept)
```
