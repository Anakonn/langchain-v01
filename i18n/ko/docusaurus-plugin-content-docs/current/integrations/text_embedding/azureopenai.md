---
keywords:
- AzureOpenAIEmbeddings
translated: true
---

# Azure OpenAI

Azure OpenAI 임베딩 클래스를 로드하고 Azure 엔드포인트를 사용하도록 환경 변수를 설정합시다.

```python
import os

os.environ["AZURE_OPENAI_API_KEY"] = "..."
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://<your-endpoint>.openai.azure.com/"
```

```python
from langchain_openai import AzureOpenAIEmbeddings

embeddings = AzureOpenAIEmbeddings(
    azure_deployment="<your-embeddings-deployment-name>",
    openai_api_version="2023-05-15",
)
```

```python
text = "this is a test document"
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
doc_result[0][:5]
```

```output
[-0.012222584727053133,
 0.0072103982392216145,
 -0.014818063280923775,
 -0.026444746872933557,
 -0.0034330499700826883]
```

## [Legacy] `openai<1`을 사용할 때

```python
# set the environment variables needed for openai package to know to reach out to azure
import os

os.environ["OPENAI_API_TYPE"] = "azure"
os.environ["OPENAI_API_BASE"] = "https://<your-endpoint.openai.azure.com/"
os.environ["OPENAI_API_KEY"] = "your AzureOpenAI key"
os.environ["OPENAI_API_VERSION"] = "2023-05-15"
```

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(deployment="your-embeddings-deployment-name")
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```
