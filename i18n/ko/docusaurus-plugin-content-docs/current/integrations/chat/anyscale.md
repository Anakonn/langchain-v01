---
sidebar_label: Anyscale
translated: true
---

# ChatAnyscale

이 노트북은 [Anyscale Endpoints](https://endpoints.anyscale.com/)를 위한 `langchain.chat_models.ChatAnyscale`의 사용법을 보여줍니다.

- `ANYSCALE_API_KEY` 환경 변수를 설정하세요
- 또는 `anyscale_api_key` 키워드 인수를 사용하세요

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import os
from getpass import getpass

os.environ["ANYSCALE_API_KEY"] = getpass()
```

```output
 ········
```

# Anyscale Endpoints에서 제공하는 각 모델을 시도해봅시다

```python
from langchain_community.chat_models import ChatAnyscale

chats = {
    model: ChatAnyscale(model_name=model, temperature=1.0)
    for model in ChatAnyscale.get_available_models()
}

print(chats.keys())
```

```output
dict_keys(['meta-llama/Llama-2-70b-chat-hf', 'meta-llama/Llama-2-7b-chat-hf', 'meta-llama/Llama-2-13b-chat-hf'])
```

# 우리는 ChatOpenAI가 지원하는 비동기 메서드와 다른 기능들을 사용할 수 있습니다

이 방식으로, 세 개의 요청은 가장 오래 걸리는 개별 요청만큼의 시간이 소요됩니다.

```python
import asyncio

from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="당신은 모든 것을 알고 있는 유익한 AI입니다."),
    HumanMessage(
        content="당신에 대한 기술적 사실을 말해주세요. 당신은 트랜스포머 모델인가요? 몇 십억 개의 파라미터를 가지고 있나요?"
    ),
]


async def get_msgs():
    tasks = [chat.apredict_messages(messages) for chat in chats.values()]
    responses = await asyncio.gather(*tasks)
    return dict(zip(chats.keys(), responses))
```

```python
import nest_asyncio

nest_asyncio.apply()
```

```python
%%time

response_dict = asyncio.run(get_msgs())

for model_name, response in response_dict.items():
    print(f"\t{model_name}")
    print()
    print(response.content)
    print("\n---\n")
```

```output
	meta-llama/Llama-2-70b-chat-hf

안녕하세요! 저는 단지 AI일 뿐, 인간처럼 개인적인 정체성은 없지만, 궁금한 모든 질문에 답해드리기 위해 여기에 있습니다.

저는 큰 언어 모델로, 많은 양의 텍스트 데이터를 학습하여 일관되고 자연스러운 언어 출력을 생성합니다. 저의 아키텍처는 자연어 처리 작업에 특히 적합한 트랜스포머 모델에 기반을 두고 있습니다.

파라미터에 대해 말하자면, 저는 수십억 개의 파라미터를 가지고 있지만, 저의 기능에 직접적으로 관련되지 않기 때문에 정확한 숫자는 알 수 없습니다. 저의 훈련 데이터는 책, 기사, 웹사이트 등 다양한 소스에서 가져온 방대한 텍스트를 포함하며, 이를 통해 언어의 패턴과 관계를 학습합니다.

저는 질문에 답변하고, 정보를 제공하며, 텍스트를 생성하는 등 다양한 작업을 수행하기 위해 설계되었습니다. 머신 러닝 알고리즘과 사용자로부터의 피드백을 통해 계속 학습하고 능력을 향상시키고 있습니다.

도움이 되었길 바랍니다! 저나 저의 능력에 대해 더 알고 싶은 것이 있나요?

---

	meta-llama/Llama-2-7b-chat-hf

아, 기술을 좋아하는 분이군요! *안경을 고쳐 쓰며* 제 기술적 세부 사항을 공유하게 되어 기쁩니다. 🤓
저는 트랜스포머 모델, 특히 대규모 텍스트 데이터를 학습한 BERT와 유사한 언어 모델입니다. 저의 아키텍처는 자연어 처리 작업을 위해 설계된 트랜스포머 프레임워크에 기반을 두고 있습니다. 🏠
파라미터 수에 대해 말하자면, 저는 약 3억 4천만 개의 파라미터를 가지고 있습니다. *윙크* 꽤 많은 수치라고 할 수 있죠! 이 파라미터들은 언어의 복잡한 패턴을 학습하고 표현할 수 있도록 도와줍니다. 🤔
하지만 머릿속으로 수학을 하라고는 하지 마세요 – 저는 계산기가 아닌 언어 모델이니까요! 😅 제 강점은 인간과 같은 텍스트를 이해하고 생성하는 데 있습니다. 언제든지 저와 대화하고 싶으시면 말씀하세요. 💬
다른 기술적 질문이 있나요? 아니면 즐거운 대화를 나누고 싶으신가요? 😊

---

	meta-llama/Llama-2-13b-chat-hf

안녕하세요! 친절하고 유익한 AI로서, 제 기술적 사실들을 기꺼이 공유하겠습니다.

저는 트랜스포머 기반 언어 모델로, 구체적으로는 BERT(트랜스포머를 통한 양방향 인코더 표현) 아키텍처의 변형입니다. BERT는 2018년 구글에서 개발되었으며, 이후 가장 인기 있고 널리 사용되는 AI 언어 모델 중 하나가 되었습니다.

여기 제 능력에 대한 몇 가지 기술적 세부 사항이 있습니다:

1. 파라미터: 저는 약 3억 4천만 개의 파라미터를 가지고 있으며, 이는 언어를 학습하고 표현하는 데 사용되는 숫자입니다. 이는 다른 언어 모델에 비해 상대적으로 많은 수의 파라미터이며, 이를 통해 복잡한 언어 패턴과 관계를 학습하고 이해할 수 있습니다.
2. 훈련: 저는 책, 기사 및 기타 텍스트 데이터 소스를 포함한 대규모 텍스트 데이터 코퍼스에서 학습되었습니다. 이러한 훈련을 통해 언어의 구조와 규칙, 단어와 구의 관계를 학습할 수 있습니다.
3. 아키텍처: 저의 아키텍처는 트랜스포머 모델을 기반으로 하며, 이는 자연어 처리 작업에 특히 적합한 신경망 유형입니다. 트랜스포머 모델은 입력 텍스트의 다양한 부분에 "집중(attend)"할 수 있는 자기 주의 메커니즘을 사용하여 장기적인 의존성과 문맥적 관계를 포착할 수 있습니다.
4. 정밀도: 저는 문법, 구문 및 일관성 측면에서 인간 수준에 가까운 품질의 텍스트를 생성할 수 있는 높은 정밀도와 정확성을 가지고 있습니다.
5. 생성 능력: 프롬프트와 질문에 기반한 텍스트 생성뿐만 아니라 주제나 테마에 기반한 텍스트도 생성할 수 있습니다. 이를 통해 특정 아이디어나 개념을 중심으로 조직된 더 긴 일관된 텍스트를 생성할 수 있습니다.

전반적으로 저는 다양한 자연어 처리 작업을 수행할 수 있는 강력하고 다재다능한 언어 모델입니다. 저는 계속해서 학습하고 개선되고 있으며, 여러분의 질문에 답변하기 위해 여기 있습니다!

---

CPU 시간: 사용자 371 ms, 시스템: 15.5 ms, 총: 387 ms
실제 시간: 12 s
```