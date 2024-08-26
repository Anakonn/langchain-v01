---
sidebar_label: YandexGPT
translated: true
---

# ChatYandexGPT

이 노트북은 [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt) 채팅 모델을 Langchain과 함께 사용하는 방법을 다룹니다.

사용하려면 `yandexcloud` 파이썬 패키지가 설치되어 있어야 합니다.

```python
%pip install --upgrade --quiet yandexcloud
```

먼저, `ai.languageModels.user` 역할을 가진 [서비스 계정 생성](https://cloud.yandex.com/en/docs/iam/operations/sa/create)을 해야 합니다.

다음으로 두 가지 인증 옵션이 있습니다:

- [IAM 토큰](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa).
  토큰은 생성자 매개변수 `iam_token` 또는 환경 변수 `YC_IAM_TOKEN`에 지정할 수 있습니다.

- [API 키](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
  키는 생성자 매개변수 `api_key` 또는 환경 변수 `YC_API_KEY`에 지정할 수 있습니다.

모델을 지정하려면 `model_uri` 매개변수를 사용할 수 있습니다. 자세한 내용은 [문서](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation)를 참조하십시오.

기본적으로 `yandexgpt-lite`의 최신 버전이 매개변수 `folder_id` 또는 환경 변수 `YC_FOLDER_ID`에 지정된 폴더에서 사용됩니다.

```python
from langchain_community.chat_models import ChatYandexGPT
from langchain_core.messages import HumanMessage, SystemMessage
```

```python
chat_model = ChatYandexGPT()
```

```python
answer = chat_model.invoke(
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love programming."),
    ]
)
answer
```

```output
AIMessage(content='J'adore programmer.')
```