---
translated: true
---

# गहरा स्पार्स

यह पृष्ठ LangChain में [DeepSparse](https://github.com/neuralmagic/deepsparse) अनुमान रन-टाइम का उपयोग करने के बारे में कवर करता है।
यह दो भागों में विभाजित है: स्थापना और सेटअप, और फिर DeepSparse उपयोग के उदाहरण।

## स्थापना और सेटअप

- `pip install deepsparse` के साथ Python पैकेज स्थापित करें
- एक [SparseZoo मॉडल](https://sparsezoo.neuralmagic.com/?useCase=text_generation) चुनें या [Optimum का उपयोग करके](https://github.com/neuralmagic/notebooks/blob/main/notebooks/opt-text-generation-deepsparse-quickstart/OPT_Text_Generation_DeepSparse_Quickstart.md) समर्थित मॉडल को ONNX में निर्यात करें

DeepSparse LLM रैपर मौजूद है, जो सभी मॉडलों के लिए एकीकृत इंटरफ़ेस प्रदान करता है:

```python
from langchain_community.llms import DeepSparse

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none"
)

print(llm.invoke("def fib():"))
```

अतिरिक्त पैरामीटर `config` पैरामीटर का उपयोग करके पास किए जा सकते हैं:

```python
config = {"max_generated_tokens": 256}

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none",
    config=config,
)
```
