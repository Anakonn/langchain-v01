---
translated: true
---

# MLX Local Pipelines

MLX मॉडल को `MLXPipeline` क्लास के माध्यम से स्थानीय रूप से चलाया जा सकता है।

[MLX समुदाय](https://huggingface.co/mlx-community) में 150 से अधिक मॉडल हैं, जो सभी ओपन सोर्स और हगिंग फेस मॉडल हब पर सार्वजनिक रूप से उपलब्ध हैं, जो एक ऑनलाइन प्लेटफॉर्म है जहां लोग आसानी से एमएल का निर्माण और सहयोग कर सकते हैं।

इन्हें LangChain से इस स्थानीय पाइपलाइन रैपर के माध्यम से या MlXPipeline क्लास के माध्यम से उनके होस्ट किए गए अनुमान अंतःक्रियाओं को कॉल करके बुलाया जा सकता है। एमएलएक्स के बारे में अधिक जानकारी के लिए, [उदाहरण रिपॉजिटरी](https://github.com/ml-explore/mlx-examples/tree/main/llms) नोटबुक देखें।

उपयोग करने के लिए, आपके पास `mlx-lm` पायथन [पैकेज इंस्टॉल](https://pypi.org/project/mlx-lm/) होना चाहिए, साथ ही [transformers](https://pypi.org/project/transformers/) भी। आप `huggingface_hub` भी इंस्टॉल कर सकते हैं।

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

### मॉडल लोडिंग

मॉडल को `from_model_id` विधि का उपयोग करके मॉडल पैरामीटर निर्दिष्ट करके लोड किया जा सकता है।

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

pipe = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

उन्हें एक मौजूदा `transformers` पाइपलाइन को सीधे पास करके भी लोड किया जा सकता है।

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from mlx_lm import load

model, tokenizer = load("mlx-community/quantized-gemma-2b-it")
pipe = MLXPipeline(model=model, tokenizer=tokenizer)
```

### श्रृंखला बनाएं

मॉडल को मेमोरी में लोड करने के बाद, आप इसे प्रॉम्प्ट के साथ संयोजित कर सकते हैं।

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | pipe

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```
