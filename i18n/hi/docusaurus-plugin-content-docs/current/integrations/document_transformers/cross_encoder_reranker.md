---
translated: true
---

# क्रॉस एन्कोडर रीरैंकर

यह नोटबुक दिखाती है कि अपने खुद के क्रॉस एन्कोडर का उपयोग करके रीरैंकर को एक रिट्रीवर में कैसे लागू करें [Hugging Face क्रॉस एन्कोडर मॉडल्स](https://huggingface.co/cross-encoder) या Hugging Face मॉडल्स जो क्रॉस एन्कोडर फंक्शन को लागू करते हैं ([उदाहरण: BAAI/bge-reranker-base](https://huggingface.co/BAAI/bge-reranker-base)). `SagemakerEndpointCrossEncoder` आपको इन HuggingFace मॉडल्स का उपयोग करने में सक्षम बनाता है जो Sagemaker पर लोड होते हैं।

यह [ContextualCompressionRetriever](/docs/modules/data_connection/retrievers/contextual_compression/) में विचारों के आधार पर है। इस दस्तावेज़ की समग्र संरचना [Cohere Reranker दस्तावेज़ीकरण](/docs/integrations/retrievers/cohere-reranker) से आई है।

बेहतर रिट्रीवल के लिए एम्बेडिंग्स के साथ संयोजन में रीरैंकिंग तंत्र के रूप में क्रॉस एन्कोडर का उपयोग क्यों किया जा सकता है, इसके बारे में अधिक जानकारी के लिए [Hugging Face Cross-Encoders दस्तावेज़ीकरण](https://www.sbert.net/examples/applications/cross-encoder/README.html) देखें।

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

## बेस वेक्टर स्टोर रिट्रीवर सेट करें

आइए एक साधारण वेक्टर स्टोर रिट्रीवर को प्रारंभ करके और 2023 के स्टेट ऑफ द यूनियन भाषण (टुकड़ों में) को स्टोर करके शुरू करें। हम रिट्रीवर को उच्च संख्या (20) के डॉक्यूमेंट्स को रिट्रीव करने के लिए सेट कर सकते हैं। 

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

## CrossEncoderReranker के साथ रीरैंकिंग करना

अब आइए हमारे बेस रिट्रीवर को `ContextualCompressionRetriever` के साथ रैप करें। `CrossEncoderReranker` लौटाए गए परिणामों को रीरैंक करने के लिए `HuggingFaceCrossEncoder` का उपयोग करता है।

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

## Hugging Face मॉडल को SageMaker एन्डपॉइंट पर अपलोड करना

यहां `SagemakerEndpointCrossEncoder` के साथ काम करने वाले एक एन्डपॉइंट बनाने के लिए एक नमूना `inference.py` है। स्टेप-बाय-स्टेप मार्गदर्शन के साथ अधिक विवरण के लिए, [इस लेख](https://huggingface.co/blog/kchoe/deploy-any-huggingface-model-to-sagemaker) का संदर्भ लें।

यह Hugging Face मॉडल को फ्लाई पर डाउनलोड करता है, इसलिए आपको `model.tar.gz` में `pytorch_model.bin` जैसे मॉडल आर्टिफैक्ट्स को रखने की आवश्यकता नहीं है। 

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
