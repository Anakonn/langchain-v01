---
translated: true
---

# Clarifai

>[Clarifai](https://www.clarifai.com/)는 데이터 탐색, 데이터 레이블링, 모델 학습, 평가 및 추론에 이르는 전체 AI 수명 주기를 제공하는 AI 플랫폼입니다.

이 예제에서는 `Clarifai` [모델](https://clarifai.com/explore/models)과 상호 작용하는 방법을 LangChain을 사용하여 살펴봅니다. 특히 텍스트 임베딩 모델은 [여기](https://clarifai.com/explore/models?page=1&perPage=24&filterData=%5B%7B%22field%22%3A%22model_type_id%22%2C%22value%22%3A%5B%22text-embedder%22%5D%7D%5D)에서 찾을 수 있습니다.

Clarifai를 사용하려면 계정과 Personal Access Token(PAT) 키가 있어야 합니다.
[여기](https://clarifai.com/settings/security)에서 PAT를 가져오거나 생성할 수 있습니다.

# 종속성

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# 가져오기

여기서는 개인 액세스 토큰을 설정할 것입니다. Clarifai 계정의 [settings/security](https://clarifai.com/settings/security)에서 PAT를 찾을 수 있습니다.

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```python
# Import the required modules
from langchain.chains import LLMChain
from langchain_community.embeddings import ClarifaiEmbeddings
from langchain_core.prompts import PromptTemplate
```

# 입력

LLM Chain에 사용할 프롬프트 템플릿을 만듭니다:

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

# 설정

모델이 있는 애플리케이션의 사용자 ID와 앱 ID를 설정합니다. https://clarifai.com/explore/models에서 공개 모델 목록을 찾을 수 있습니다.

또한 모델 ID와 필요한 경우 모델 버전 ID를 초기화해야 합니다. 일부 모델에는 여러 버전이 있으므로 작업에 적합한 버전을 선택할 수 있습니다.

```python
USER_ID = "clarifai"
APP_ID = "main"
MODEL_ID = "BAAI-bge-base-en-v15"
MODEL_URL = "https://clarifai.com/clarifai/main/models/BAAI-bge-base-en-v15"

# Further you can also provide a specific model version as the model_version_id arg.
# MODEL_VERSION_ID = "MODEL_VERSION_ID"
```

```python
# Initialize a Clarifai embedding model
embeddings = ClarifaiEmbeddings(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)

# Initialize a clarifai embedding model using model URL
embeddings = ClarifaiEmbeddings(model_url=MODEL_URL)

# Alternatively you can initialize clarifai class with pat argument.
```

```python
text = "roses are red violets are blue."
text2 = "Make hay while the sun shines."
```

embed_query 함수를 사용하여 텍스트의 단일 줄을 임베딩할 수 있습니다!

```python
query_result = embeddings.embed_query(text)
```

또한 embed_documents 함수를 사용하여 텍스트/문서 목록을 임베딩할 수 있습니다.

```python
doc_result = embeddings.embed_documents([text, text2])
```
