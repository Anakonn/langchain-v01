---
translated: true
---

# IBM watsonx.ai

>WatsonxEmbeddings는 IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai) 기반 모델을 위한 래퍼입니다.

이 예제는 `LangChain`을 사용하여 `watsonx.ai` 모델과 통신하는 방법을 보여줍니다.

## 설정

`langchain-ibm` 패키지를 설치하세요.

```python
!pip install -qU langchain-ibm
```

이 셀은 watsonx Embeddings를 사용하기 위해 필요한 WML 자격 증명을 정의합니다.

**작업:** IBM Cloud 사용자 API 키를 제공하세요. 자세한 내용은 [문서](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)를 참조하세요.

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

추가로 환경 변수로 추가 비밀을 전달할 수 있습니다.

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## 모델 로드

다른 모델의 경우 `parameters`를 조정해야 할 수 있습니다.

```python
from ibm_watsonx_ai.metanames import EmbedTextParamsMetaNames

embed_params = {
    EmbedTextParamsMetaNames.TRUNCATE_INPUT_TOKENS: 3,
    EmbedTextParamsMetaNames.RETURN_OPTIONS: {"input_text": True},
}
```

이전에 설정한 매개변수로 `WatsonxEmbeddings` 클래스를 초기화합니다.

**참고:**

- API 호출에 대한 컨텍스트를 제공하려면 `project_id` 또는 `space_id`를 추가해야 합니다. 자세한 내용은 [문서](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects)를 참조하세요.
- 프로비저닝된 서비스 인스턴스의 지역에 따라 [여기](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication)에 설명된 URL 중 하나를 사용하세요.

이 예에서는 `project_id`와 Dallas URL을 사용할 것입니다.

추론에 사용할 `model_id`를 지정해야 합니다.

```python
from langchain_ibm import WatsonxEmbeddings

watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

또한 Cloud Pak for Data 자격 증명을 사용할 수 있습니다. 자세한 내용은 [문서](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)를 참조하세요.

```python
watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="5.0",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

## 사용

### 쿼리 임베딩

```python
text = "This is a test document."

query_result = watsonx_embedding.embed_query(text)
query_result[:5]
```

```output
[0.0094472, -0.024981909, -0.026013248, -0.040483925, -0.057804465]
```

### 문서 임베딩

```python
texts = ["This is a content of the document", "This is another document"]

doc_result = watsonx_embedding.embed_documents(texts)
doc_result[0][:5]
```

```output
[0.009447193, -0.024981918, -0.026013244, -0.040483937, -0.057804447]
```
