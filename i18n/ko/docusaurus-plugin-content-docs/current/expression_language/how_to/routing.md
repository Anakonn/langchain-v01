---
keywords:
- RunnableBranch
- LCEL
sidebar_position: 3
title: 입력에 따른 라우팅 로직
translated: true
---

# 입력에 따른 동적 라우팅 로직

이 노트북에서는 LangChain Expression Language에서 라우팅을 수행하는 방법을 다룹니다.

라우팅을 통해 이전 단계의 출력이 다음 단계를 정의하는 비결정적 체인을 만들 수 있습니다. 라우팅은 LLM과의 상호 작용에 구조와 일관성을 제공합니다.

라우팅을 수행하는 두 가지 방법이 있습니다:

1. `RunnableLambda`에서 조건부로 실행 가능한 항목을 반환하는 방법(권장)
2. `RunnableBranch`를 사용하는 방법

두 가지 방법을 모두 사용하여 입력 질문을 `LangChain`, `Anthropic`, 또는 `Other`로 분류한 후 해당 프롬프트 체인으로 라우팅하는 두 단계 시퀀스를 예로 들어 설명하겠습니다.

## 예제 설정

먼저, 들어오는 질문을 `LangChain`, `Anthropic`, 또는 `Other`로 분류하는 체인을 만들어 보겠습니다:

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

chain = (
    PromptTemplate.from_template(
        """사용자 질문을 보고, 이를 `LangChain`, `Anthropic`, 또는 `Other`로 분류하세요.

한 단어로만 응답하세요.

<question>
{question}
</question>

분류:"""
    )
    | ChatAnthropic(model_name="claude-3-haiku-20240307")
    | StrOutputParser()
)

chain.invoke({"question": "Anthropic을 어떻게 호출하나요?"})
```

```output
'Anthropic'
```

이제 세 가지 하위 체인을 만들어 보겠습니다:

```python
langchain_chain = PromptTemplate.from_template(
    """당신은 LangChain 전문가입니다. \
항상 "Harrison Chase가 말하길"로 시작하여 질문에 답하세요. \
다음 질문에 답하세요:

질문: {question}
답변:"""
) | ChatAnthropic(model_name="claude-3-haiku-20240307")
anthropic_chain = PromptTemplate.from_template(
    """당신은 Anthropic 전문가입니다. \
항상 "Dario Amodei가 말하길"로 시작하여 질문에 답하세요. \
다음 질문에 답하세요:

질문: {question}
답변:"""
) | ChatAnthropic(model_name="claude-3-haiku-20240307")
general_chain = PromptTemplate.from_template(
    """다음 질문에 답하세요:

질문: {question}
답변:"""
) | ChatAnthropic(model_name="claude-3-haiku-20240307")
```

## 사용자 정의 함수 사용 (권장)

다양한 출력을 라우팅하기 위해 사용자 정의 함수를 사용할 수도 있습니다. 다음은 예제입니다:

```python
def route(info):
    if "anthropic" in info["topic"].lower():
        return anthropic_chain
    elif "langchain" in info["topic"].lower():
        return langchain_chain
    else:
        return general_chain
```

```python
from langchain_core.runnables import RunnableLambda

full_chain = {"topic": chain, "question": lambda x: x["question"]} | RunnableLambda(
    route
)
```

```python
full_chain.invoke({"question": "Anthropic을 어떻게 사용하나요?"})
```

```output
AIMessage(content="Dario Amodei가 말하길, Anthropic을 사용하려면 먼저 회사의 웹사이트를 탐색하고 회사의 미션, 가치, 다양한 서비스 및 제품을 파악하는 것이 좋습니다. Anthropic은 안전하고 윤리적인 AI 시스템을 개발하는 데 중점을 두고 있으며, 투명성과 책임 있는 AI 개발에 강한 중점을 두고 있습니다. \n\n특정 필요에 따라, 자연어 처리, 컴퓨터 비전, 강화 학습과 같은 영역을 다루는 Anthropic의 AI 연구 및 개발 서비스를 살펴볼 수 있습니다. 또한, AI 통합의 도전과 기회를 탐색하는 데 도움이 되는 컨설팅 및 자문 서비스도 제공합니다.\n\n또한, Anthropic은 몇 가지 오픈 소스 AI 모델과 도구를 공개하여 탐색하고 실험할 수 있습니다. 이는 Anthropic의 AI 개발 접근 방식을 직접 경험하는 좋은 방법이 될 수 있습니다.\n\n전반적으로, Anthropic은 AI 분야에서 신뢰할 수 있고 신뢰할 수 있는 파트너가 되고자 하며, 특정 요구 사항을 지원하는 최선의 방법을 논의하기 위해 직접 연락하는 것이 좋습니다.", response_metadata={'id': 'msg_01CtLFgFSwvTaJomrihE87Ra', 'content': [ContentBlock(text="Dario Amodei가 말하길, Anthropic을 사용하려면 먼저 회사의 웹사이트를 탐색하고 회사의 미션, 가치, 다양한 서비스 및 제품을 파악하는 것이 좋습니다. Anthropic은 안전하고 윤리적인 AI 시스템을 개발하는 데 중점을 두고 있으며, 투명성과 책임 있는 AI 개발에 강한 중점을 두고 있습니다. \n\n특정 필요에 따라, 자연어 처리, 컴퓨터 비전, 강화 학습과 같은 영역을 다루는 Anthropic의 AI 연구 및 개발 서비스를 살펴볼 수 있습니다. 또한, AI 통합의 도전과 기회를 탐색하는 데 도움이 되는 컨설팅 및 자문 서비스도 제공합니다.\n\n또한, Anthropic은 몇 가지 오픈 소스 AI 모델과 도구를 공개하여 탐색하고 실험할 수 있습니다. 이는 Anthropic의 AI 개발 접근 방식을 직접 경험하는 좋은 방법이 될 수 있습니다.\n\n전반적으로, Anthropic은 AI 분야에서 신뢰할 수 있고 신뢰할 수 있는 파트너가 되고자 하며, 특정 요구 사항을 지원하는 최선의 방법을 논의하기 위해 직접 연락하는 것이 좋습니다.", type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=53, output_tokens=219)})
```

```python
full_chain.invoke({"question": "LangChain을 어떻게 사용하나요?"})
```

```output
AIMessage(content="Harrison Chase가 말하길, LangChain을 사용하려면 몇 가지 주요 단계가 있습니다:\n\n1. **환경 설정**: 필요한 Python 패키지를 설치하고, LangChain 라이브러리 자체뿐만 아니라 애플리케이션이 필요로 할 수 있는 기타 종속성도 설치합니다.\n\n2. **핵심 개념 이해**: LangChain은 에이전트, 체인, 도구와 같은 몇 가지 핵심 개념을 중심으로 구성됩니다. 이러한 개념과 함께 강력한 언어 기반 애플리케이션을 구축하는 방법을 숙지하세요.\n\n3. **사용 사례 식별**: LangChain을 사용하여 구축하려는 작업이나 애플리케이션의 종류를 결정하세요. 예를 들어, 챗봇, 질문 응답 시스템 또는 문서 요약 도구 등이 있습니다.\n\n4. **적절한 구성 요소 선택**: 사용 사례에 따라 애플리케이션을 구축하기 위해 적절한 LangChain 구성 요소를 선택하세요.\n\n5. **언어 모델과 통합**: LangChain은 OpenAI의 GPT-3 또는 Anthropic의 모델과 같은 다양한 언어 모델과 원활하게 작동하도록 설계되었습니다. 선택한 언어 모델을 LangChain 애플리케이션에 연결하세요.\n\n6. **애플리케이션 로직 구현**: LangChain의 빌딩 블록을 사용하여 애플리케이션의 특정 기능을 구현하세요. 예를 들어, 언어 모델에 프롬프트를 전달하고 응답을 처리하고 다른 서비스나 데이터 소스와 통합하는 등의 작업을 수행할 수 있습니다.\n\n7. **테스트 및 반복**: 애플리케이션을 철저히 테스트하고 피드백을 수집한 다음 디자인 및 구현을 반복하여 성능과 사용자 경험을 향상시키세요.\n\nHarrison Chase가 강조한 것처럼, LangChain은 현대 언어 모델의 기능을 활용하기 쉽게 만드는 유연하고 강력한 프레임워크를 제공합니다. 이러한 단계를 따르면 LangChain을 사용하여 특정 요구에 맞춘 혁신적인 솔루션을 만들 수 있습니다.", response_metadata={'id': 'msg_01H3UXAAHG4TwxJLpxwuuVU7', 'content': [ContentBlock(text="Harrison Chase가 말하길, LangChain을 사용하려면 몇 가지 주요 단계가 있습니다:\n\n1. **환경 설정**: 필요한 Python 패키지를 설치하고, LangChain 라이브러리 자체뿐만 아니라 애플리케이션이 필요로 할 수 있는 기타 종속성도 설치합니다.\n\n2. **핵심 개념 이해**: LangChain은 에이전트, 체인, 도구와 같은 몇 가지 핵심 개념을 중심으로 구성됩니다. 이러한 개념과 함께 강력한 언어 기반 애플리케이션을 구축하는 방법을 숙지하세요.\n\n3. **사용 사례 식별**: LangChain을 사용하여 구축하려는 작업이나 애플리케이션의 종류를 결정하세요. 예를 들어, 챗봇, 질문 응답 시스템 또는 문서 요약 도구 등이 있습니다.\n\n4. **적절한 구성 요소 선택**: 사용 사례에 따라 애플리케이션을 구축하기 위해 적절한 LangChain 구성 요소를 선택하세요.\n\n5. **언어 모델과 통합**: LangChain은 OpenAI의 GPT-3 또는 Anthropic의 모델과 같은 다양한 언어 모델과 원활하게 작동하도록 설계되었습니다. 선택한 언어 모델을 LangChain 애플리케이션에 연결하세요.\n\n6. **애플리케이션 로직 구현**: LangChain의 빌딩 블록을 사용하여 애플리케이션의 특정 기능을 구현하세요. 예를 들어, 언어 모델에 프롬프트를 전달하고 응답을 처리하고 다른 서비스나 데이터 소스와 통합하는 등의 작업을 수행할 수 있습니다.\n\n7. **테스트 및 반복**: 애플리케이션을 철저히 테스트하고 피드백을 수집한 다음 디자인 및 구현을 반복하여 성능과 사용자 경험을 향상시키세요.\n\nHarrison Chase가 강조한 것처럼, LangChain은 현대 언어 모델의 기능을 활용하기 쉽게 만드는 유연하고 강력한 프레임워크를 제공합니다. 이러한 단계를 따르면 LangChain을 사용하여 특정 요구에 맞춘 혁신적인 솔루션을 만들 수 있습니다.", type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=50, output_tokens=400)})
```

```python
full_chain.invoke({"question": "2 + 2는 얼마인가요?"})
```

```output
AIMessage(content='4', response_metadata={'id': 'msg_01UAKP81jTZu9fyiyFYhsbHc', 'content': [ContentBlock(text='4', type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=28, output_tokens=5)})
```

## RunnableBranch 사용

`RunnableBranch`는 입력에 따라 실행할 조건과 실행 가능한 항목 세트를 정의할 수 있는 특수한 유형의 실행 가능한 항목입니다. 이는 위에서 설명한 사용자 정의 함수로 달성할 수 없는 것은 아니므로, 사용자 정의 함수를 사용하는 것이 좋습니다.

`RunnableBranch`는 (조건, 실행 가능한 항목) 쌍 목록과 기본 실행 가능한 항목으로 초기화됩니다. 입력과 함께 호출될 때 각 조건에 입력을 전달하여 어느 브랜치를 선택할지 결정합니다. 첫 번째 조건이 True로 평가되면 해당 조건에 해당하는 실행 가능한 항목을 입력과 함께 실행합니다.

제공된 조건이 일치하지 않으면 기본 실행 가능한 항목을 실행합니다.

다음은 실제로 어떻게 동작하는지에 대한 예제입니다:

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: "anthropic" in x["topic"].lower(), anthropic_chain),
    (lambda x: "langchain" in x["topic"].lower(), langchain_chain),
    general_chain,
)
full_chain = {"topic": chain, "question": lambda x: x["question"]} | branch
full_chain.invoke({"question": "Anthropic을 어떻게 사용하나요?"})
```

```output
AIMessage(content="Dario Amodei가 말하길, Anthropic을 사용하려면 먼저 우리의 미션과 원칙에 익숙해져야 합니다. Anthropic은 인류가 직면한 중요한 문제를 해결하는 데 도움이 되는 안전하고 유익한 인공지능을 개발하는 데 전념하고 있습니다. \n\n시작하려면 우리의 연구, 제품, AI 개발 접근 방식에 대한 정보를 다루는 웹사이트의 자료를 탐색하는 것이 좋습니다. 또한, Anthropic의 기술과 서비스가 특정 요구 사항을 어떻게 지원할 수 있는지 자세히 알아보려면 팀에 문의할 수 있습니다.\n\n중요한 것은 투명성, 윤리적 AI, 인류의 복지에 대한 헌신이라는 우리의 가치와 일치하는 방식으로 우리와 협력하는 것입니다. 우리는 협력하여 고급 AI를 책임감 있게 활용할 수 있도록 도와드리겠습니다.", response_metadata={'id': 'msg_0187BVnpniPDJnVvwf3M1LdY', 'content': [ContentBlock(text="Dario Amodei가 말하길, Anthropic을 사용하려면 먼저 우리의 미션과 원칙에 익숙해져야 합니다. Anthropic은 인류가 직면한 중요한 문제를 해결하는 데 도움이 되는 안전하고 유익한 인공지능을 개발하는 데 전념하고 있습니다. \n\n시작하려면 우리의 연구, 제품, AI 개발 접근 방식에 대한 정보를 다루는 웹사이트의 자료를 탐색하는 것이 좋습니다. 또한, Anthropic의 기술과 서비스가 특정 요구 사항을 어떻게 지원할 수 있는지 자세히 알아보려면 팀에 문의할 수 있습니다.\n\n중요한 것은 투명성, 윤리적 AI, 인류의 복지에 대한 헌신이라는 우리의 가치와 일치하는 방식으로 우리와 협력하는 것입니다. 우리는 협력하여 고급 AI를 책임감 있게 활용할 수 있도록 도와드리겠습니다.", type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=53, output_tokens=160)})
```

```python
full_chain.invoke({"question": "LangChain을 어떻게 사용하나요?"})
```

```output
AIMessage(content="Harrison Chase가 말하길, LangChain을 사용하려면 몇 가지 주요 단계가 있습니다. 먼저, LangChain 라이브러리를 설치하고 필요한 모듈을 가져와야 합니다. 그런 다음 언어 모델, 사용할 데이터 소스 및 질문 응답, 텍스트 생성 또는 에이전트 기반 추론과 같은 특정 작업을 정의합니다. \n\nLangChain은 대형 언어 모델을 활용한 애플리케이션을 구축하기 위한 유연한 프레임워크를 제공합니다. 검색기, 프롬프트 및 체인과 같은 추상화를 제공하여 강력한 워크플로를 생성하기 위해 다양한 구성 요소를 조합할 수 있습니다. \n\nLangChain 웹사이트의 문서는 훌륭하며 많은 일반적인 사용 사례를 자세히 다룹니다. 핵심 개념을 이해하고 이를 특정 요구 사항에 적용하는 방법을 숙지하는 데 도움이 되도록 그곳에서 시작하는 것을 권장합니다. 그리고 물론, 추가 질문이 있으면 언제든지 저에게 문의하십시오. Harrison과의 대화에서 더 많은 통찰을 공유하게 되어 기쁩니다.", response_metadata={'id': 'msg_01T1naS99wGPkEAP4LME8iAv', 'content': [ContentBlock(text="Harrison Chase가 말하길, LangChain을 사용하려면 몇 가지 주요 단계가 있습니다. 먼저, LangChain 라이브러리를 설치하고 필요한 모듈을 가져와야 합니다. 그런 다음 언어 모델, 사용할 데이터 소스 및 질문 응답, 텍스트 생성 또는 에이전트 기반 추론과 같은 특정 작업을 정의합니다. \n\nLangChain은 대형 언어 모델을 활용한 애플리케이션을 구축하기 위한 유연한 프레임워크를 제공합니다. 검색기, 프롬프트 및 체인과 같은 추상화를 제공하여 강력한 워크플로를 생성하기 위해 다양한 구성 요소를 조합할 수 있습니다. \n\nLangChain 웹사이트의 문서는 훌륭하며 많은 일반적인 사용 사례를 자세히 다룹니다. 핵심 개념을 이해하고 이를 특정 요구 사항에 적용하는 방법을 숙지하는 데 도움이 되도록 그곳에서 시작하는 것을 권장합니다. 그리고 물론, 추가 질문이 있으면 언제든지 저에게 문의하십시오. Harrison과의 대화에서 더 많은 통찰을 공유하게 되어 기쁩니다.", type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=50, output_tokens=205)})
```

```python
full_chain.invoke({"question": "2 + 2는 얼마인가요?"})
```

```output
AIMessage(content='4', response_metadata={'id': 'msg_01T6T3TS6hRCtU8JayN93QEi', 'content': [ContentBlock(text='4', type='text')], 'model': 'claude-3-haiku-20240307', 'role': 'assistant', 'stop_reason': 'end_turn', 'stop_sequence': None, 'type': 'message', 'usage': Usage(input_tokens=28, output_tokens=5)})
```

# 의미적 유사성에 따른 라우팅

특히 유용한 기술 중 하나는 임베딩을 사용하여 쿼리를 가장 관련성 높은 프롬프트로 라우팅하는 것입니다. 다음은 예제입니다.

```python
from langchain.utils.math import cosine_similarity
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

physics_template = """당신은 매우 똑똑한 물리학 교수입니다. \
물리학에 대한 질문에 대해 간결하고 이해하기 쉽게 답변하는 데 뛰어납니다. \
답을 모를 때는 모른다고 인정합니다.

여기 질문이 있습니다:
{query}"""

math_template = """당신은 매우 뛰어난 수학자입니다. 수학 질문에 답하는 데 뛰어납니다. \
당신은 어려운 문제를 구성 요소로 나누고, \
구성 요소를 답변한 후, 이를 결합하여 더 넓은 질문에 답변할 수 있습니다.

여기 질문이 있습니다:
{query}"""

embeddings = OpenAIEmbeddings()
prompt_templates = [physics_template, math_template]
prompt_embeddings = embeddings.embed_documents(prompt_templates)


def prompt_router(input):
    query_embedding = embeddings.embed_query(input["query"])
    similarity = cosine_similarity([query_embedding], prompt_embeddings)[0]
    most_similar = prompt_templates[similarity.argmax()]
    print("Using MATH" if most_similar == math_template else "Using PHYSICS")
    return PromptTemplate.from_template(most_similar)


chain = (
    {"query": RunnablePassthrough()}
    | RunnableLambda(prompt_router)
    | ChatAnthropic(model_name="claude-3-haiku-20240307")
    | StrOutputParser()
)
```

```python
print(chain.invoke("블랙홀이란 무엇인가요?"))
```

```output
Using PHYSICS
물리학 교수로서 블랙홀이 무엇인지 간결하고 이해하기 쉽게 설명해드리겠습니다.

블랙홀은 매우 밀도가 높은 공간-시간 영역으로, 중력이 너무 강해서 빛조차도 빠져나올 수 없습니다. 이는 블랙홀에 너무 가까이 가면 강력한 중력에 의해 끌려가고 으스러지게 된다는 것을 의미합니다.

블랙홀은 거대한 별이 수명을 다하고 스스로 붕괴할 때 형성됩니다. 이 붕괴로 인해 물질이 매우 밀도가 높아지고 중력이 너무 강해져서 사건의 지평선이라고 하는 반환 불가능한 지점이 만들어집니다.

사건의 지평선을 넘어가면 물리 법칙이 우리가 알고 있는 방식으로 작동하지 않으며, 강력한 중력이 특이점이라고 하는 무한 밀도와 공간-시간 곡률의 지점을 생성합니다.

블랙홀은 매우 흥미롭고 신비로운 대상이며, 그 특성과 행동에 대해 아직 많은 것을 배워야 합니다. 특정 세부 사항이나 블랙홀의 측면에 대해 잘 모르겠다면, 이는 제가 완전히 이해하지 못한 부분이며 추가 연구와 조사가 필요하다고 인정할 것입니다.
```

```python
print(chain.invoke("경로 적분이란 무엇인가요?"))
```

```output
Using MATH
경로 적분은 물리학, 특히 양자 역학에서 강력한 수학적 개념입니다. 이는 저명한 물리학자 Richard Feynman에 의해 양자 역학의 대안적인 공식화로 개발되었습니다.

경로 적분에서는 고전 역학에서와 같이 입자가 한 점에서 다른 점으로 이동하는 단일, 확정 경로를 고려하는 대신, 입자가 동시에 모든 가능한 경로를 취한다고 가정합니다. 각 경로에는 복소수 가중치가 할당되며, 한 점에서 다른 점으로 입자가 이동할 확률 진폭은 모든 가능한 경로에 대해 합산(적분)하여 계산됩니다.

경로 적분 공식화의 주요 아이디어는 다음과 같습니다:

1. 중첩 원리: 양자 역학에서 입자는 여러 상태 또는 경로의 중첩 상태로 존재할 수 있습니다.

2. 확률 진폭: 입자가 한 점에서 다른 점으로 이동할 확률 진폭은 모든 가능한 경로의 복소수 가중치를 합산하여 계산됩니다.

3. 경로 가중치: 각 경로는 해당 경로를 따라 작용(라그랑지언의 시간 적분)에 따라 가중치가 할당됩니다. 작용이 낮은 경로는 더 큰 가중치를 가집니다.

4. Feynman의 접근법: Feynman은 양자 역학에서 전통적인 파동 함수 접근법에 대한 대안으로 경로 적분 공식화를 개발하여 양자 현상을 보다 직관적이고 개념적으로 이해할 수 있게 했습니다.

경로 적분 접근법은 양자장 이론에서 특히 유용하며, 전이 확률을 계산하고 양자 시스템의 행동을 이해하는 데 강력한 프레임워크를 제공합니다. 또한 응집 물질, 통계 역학, 심지어 금융(옵션 가격 결정에 대한 경로 적분 접근법) 등 다양한 물리학 분야에서도 응용됩니다.

경로 적분의 수학적 구성에는 함수 해석학 및 측도 이론과 같은 고급 개념의 사용이 포함되어 있어 물리학자에게 강력하고 정교한 도구입니다.
```