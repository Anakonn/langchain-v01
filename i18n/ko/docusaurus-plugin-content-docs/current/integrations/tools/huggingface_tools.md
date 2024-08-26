---
translated: true
---

# HuggingFace Hub 도구

>[Huggingface 도구](https://huggingface.co/docs/transformers/v4.29.0/en/custom_tools)는 `load_huggingface_tool` 함수를 사용하여 직접 로드할 수 있는 텍스트 I/O를 지원합니다.

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
