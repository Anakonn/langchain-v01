---
translated: true
---

# Reordenador de codificador cruzado

Este cuaderno muestra cómo implementar un reordenador en un buscador con tu propio codificador cruzado de [modelos de codificador cruzado de Hugging Face](https://huggingface.co/cross-encoder) o modelos de Hugging Face que implementan la función de codificador cruzado ([ejemplo: BAAI/bge-reranker-base](https://huggingface.co/BAAI/bge-reranker-base)). `SagemakerEndpointCrossEncoder` te permite usar estos modelos de Hugging Face cargados en Sagemaker.

Esto se basa en las ideas del [ContextualCompressionRetriever](/docs/modules/data_connection/retrievers/contextual_compression/). La estructura general de este documento proviene de la [documentación del reordenador de Cohere](/docs/integrations/retrievers/cohere-reranker).

Para más información sobre por qué el codificador cruzado se puede usar como mecanismo de reordenación junto con los incrustaciones para una mejor recuperación, consulta la [documentación de Hugging Face Cross-Encoders](https://www.sbert.net/examples/applications/cross-encoder/README.html).

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

## Configurar el buscador de almacén de vectores base

Comencemos inicializando un buscador de almacén de vectores simple y almacenando el discurso del Estado de la Unión de 2023 (en fragmentos). Podemos configurar el buscador para recuperar un número alto (20) de documentos.

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

## Realizar reordenación con CrossEncoderReranker

Ahora envolvamos nuestro buscador base con un `ContextualCompressionRetriever`. `CrossEncoderReranker` usa `HuggingFaceCrossEncoder` para reordenar los resultados devueltos.

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

## Cargar el modelo de Hugging Face en el punto final de SageMaker

Aquí hay una `inference.py` de muestra para crear un punto final que funcione con `SagemakerEndpointCrossEncoder`. Para más detalles con una guía paso a paso, consulta [este artículo](https://huggingface.co/blog/kchoe/deploy-any-huggingface-model-to-sagemaker).

Descarga el modelo de Hugging Face sobre la marcha, por lo que no necesitas mantener los artefactos del modelo como `pytorch_model.bin` en tu `model.tar.gz`.

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
