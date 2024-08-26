---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino) एक ओपन-सोर्स टूलकिट है जो AI inference को अनुकूलित और तैनात करने के लिए उपयोग किया जाता है। OpenVINO™ Runtime विभिन्न हार्डवेयर [उपकरणों](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix) जैसे x86 और ARM CPU, और Intel GPU का समर्थन करता है। यह कंप्यूटर विजन, ऑटोमेटिक स्पीच रिकग्निशन, प्राकृतिक भाषा प्रोसेसिंग और अन्य सामान्य कार्यों में गहरी सीखने की प्रदर्शन को बढ़ाने में मदद कर सकता है।

Hugging Face embedding मॉडल को ``OpenVINOEmbeddings`` क्लास के माध्यम से OpenVINO द्वारा समर्थित किया जा सकता है। यदि आपके पास Intel GPU है, तो आप `model_kwargs={"device": "GPU"}` निर्दिष्ट कर सकते हैं ताकि इसपर inference चलाया जा सके।

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_community.embeddings import OpenVINOEmbeddings
```

```python
model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {"device": "CPU"}
encode_kwargs = {"mean_pooling": True, "normalize_embeddings": True}

ov_embeddings = OpenVINOEmbeddings(
    model_name_or_path=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```

```python
text = "This is a test document."
```

```python
query_result = ov_embeddings.embed_query(text)
```

```python
query_result[:3]
```

```output
[-0.048951778560876846, -0.03986183926463127, -0.02156277745962143]
```

```python
doc_result = ov_embeddings.embed_documents([text])
```

## IR मॉडल निर्यात करें

``OVModelForFeatureExtraction`` के साथ आप अपने embedding मॉडल को OpenVINO IR प्रारूप में निर्यात कर सकते हैं, और स्थानीय फोल्डर से मॉडल लोड कर सकते हैं।

```python
from pathlib import Path

ov_model_dir = "all-mpnet-base-v2-ov"
if not Path(ov_model_dir).exists():
    ov_embeddings.save_model(ov_model_dir)
```

```python
ov_embeddings = OpenVINOEmbeddings(
    model_name_or_path=ov_model_dir,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```

```output
Compiling the model to CPU ...
```

## OpenVINO के साथ BGE

हम ``OpenVINOBgeEmbeddings`` क्लास के माध्यम से OpenVINO के साथ BGE embedding मॉडल तक भी पहुंच सकते हैं।

```python
from langchain_community.embeddings import OpenVINOBgeEmbeddings

model_name = "BAAI/bge-small-en"
model_kwargs = {"device": "CPU"}
encode_kwargs = {"normalize_embeddings": True}
ov_embeddings = OpenVINOBgeEmbeddings(
    model_name_or_path=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```

```python
embedding = ov_embeddings.embed_query("hi this is harrison")
len(embedding)
```

```output
384
```

अधिक जानकारी के लिए देखें:

* [OpenVINO LLM गाइड](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)।

* [OpenVINO प्रलेखन](https://docs.openvino.ai/2024/home.html)।

* [OpenVINO शुरू करने का गाइड](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html)।

* [LangChain के साथ RAG नोटबुक](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain)।
