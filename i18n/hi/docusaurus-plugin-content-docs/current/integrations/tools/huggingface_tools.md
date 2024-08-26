---
translated: true
---

# HuggingFace Hub उपकरण

>[Huggingface उपकरण](https://huggingface.co/docs/transformers/v4.29.0/en/custom_tools) जो पाठ I/O का समर्थन करते हैं, उन्हें सीधे `load_huggingface_tool` फ़ंक्शन का उपयोग करके लोड किया जा सकता है।

```python
# Requires transformers>=4.29.0 and huggingface_hub>=0.14.1
%pip install --upgrade --quiet  transformers huggingface_hub > /dev/null
```

```python
from langchain.agents import load_huggingface_tool

tool = load_huggingface_tool("lysandre/hf-model-downloads")

print(f"{tool.name}: {tool.description}")
```

```output
model_download_counter: This is a tool that returns the most downloaded model of a given task on the Hugging Face Hub. It takes the name of the category (such as text-classification, depth-estimation, etc), and returns the name of the checkpoint
```

```python
tool.run("text-classification")
```

```output
'facebook/bart-large-mnli'
```
