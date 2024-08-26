---
translated: true
---

# YandexGPT

이 노트북은 [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt)와 Langchain 사용 방법을 다룹니다.

사용하려면 `yandexcloud` Python 패키지가 설치되어 있어야 합니다.

```python
%pip install --upgrade --quiet  yandexcloud
```

먼저 `ai.languageModels.user` 역할이 있는 [서비스 계정](https://cloud.yandex.com/en/docs/iam/operations/sa/create)을 만들어야 합니다.

다음으로 두 가지 인증 옵션이 있습니다:
- [IAM 토큰](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa)
    생성자 매개변수 `iam_token` 또는 환경 변수 `YC_IAM_TOKEN`에 토큰을 지정할 수 있습니다.

- [API 키](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    생성자 매개변수 `api_key` 또는 환경 변수 `YC_API_KEY`에 키를 지정할 수 있습니다.

모델을 지정하려면 `model_uri` 매개변수를 사용할 수 있습니다. 자세한 내용은 [문서](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation)를 참조하세요.

기본적으로 `folder_id` 매개변수 또는 `YC_FOLDER_ID` 환경 변수에 지정된 폴더의 최신 버전의 `yandexgpt-lite`가 사용됩니다.

```python
from langchain.chains import LLMChain
from langchain_community.llms import YandexGPT
from langchain_core.prompts import PromptTemplate
```

```python
template = "What is the capital of {country}?"
prompt = PromptTemplate.from_template(template)
```

```python
llm = YandexGPT()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
country = "Russia"

llm_chain.invoke(country)
```

```output
'The capital of Russia is Moscow.'
```
