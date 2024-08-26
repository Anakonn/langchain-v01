---
keywords:
- Runnable
- Runnables
- LCEL
sidebar_position: 0
title: 'Sequences: 실행 가능 항목 연결'
translated: true
---

# 실행 가능 항목 연결

`Runnable` 인터페이스의 주요 장점 중 하나는 어떤 두 실행 가능 항목도 "체인"으로 연결할 수 있다는 것입니다. 이전 실행 가능 항목의 `.invoke()` 호출의 출력이 다음 실행 가능 항목의 입력으로 전달됩니다. 이는 파이프 연산자(`|`) 또는 동일한 기능을 하는 더 명시적인 `.pipe()` 메서드를 사용하여 수행할 수 있습니다. 결과로 생성된 `RunnableSequence` 자체도 실행 가능 항목이므로 다른 실행 가능 항목과 마찬가지로 호출, 스트리밍 또는 파이프 처리할 수 있습니다.

## 파이프 연산자

이것이 어떻게 작동하는지 보여주기 위해 예제를 살펴보겠습니다. LangChain에서 일반적으로 사용되는 패턴을 살펴보겠습니다: [프롬프트 템플릿](/docs/modules/model_io/prompts/)을 사용하여 입력을 형식화하고 이를 [챗 모델](/docs/modules/model_io/chat/)에 전달한 다음 [출력 파서](/docs/modules/model_io/output_parsers/)를 사용하여 챗 메시지 출력을 문자열로 변환합니다.

```python
%pip install --upgrade --quiet langchain langchain-anthropic
```

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("주제 {topic}에 대한 농담을 해주세요")
model = ChatAnthropic(model_name="claude-3-haiku-20240307")

chain = prompt | model | StrOutputParser()
```

프롬프트와 모델은 둘 다 실행 가능 항목이며, 프롬프트 호출의 출력 타입이 챗 모델의 입력 타입과 동일하므로 이를 체인으로 연결할 수 있습니다. 그런 다음 다른 실행 가능 항목과 마찬가지로 결과 시퀀스를 호출할 수 있습니다:

```python
chain.invoke({"topic": "곰"})
```

```output
"곰에 대한 농담을 하나 들려드릴게요:\n\n곰이 양말을 신지 않는 이유는 무엇일까요? \n곰발바닥이 있기 때문이죠!\n\n어떠셨나요? 가볍고 유쾌하게 해보려고 했어요. 곰은 재미있는 말장난과 농담의 좋은 소재가 될 수 있어요. 다른 농담도 들려드릴까요?"
```

### 강제 변환

이 체인을 더 많은 실행 가능 항목과 결합하여 또 다른 체인을 만들 수 있습니다. 이는 체인 구성 요소의 필요한 입력과 출력에 따라 다른 유형의 실행 가능 항목을 사용하여 입력/출력 형식을 일부 조정하는 작업을 포함할 수 있습니다.

예를 들어, 생성된 농담이 재미있는지 평가하는 또 다른 체인과 농담 생성 체인을 결합하고 싶다고 가정해 보겠습니다.

다음 체인으로 입력 형식을 어떻게 구성하는지 신경 써야 합니다. 아래 예제에서는 체인의 사전이 자동으로 파싱되어 [`RunnableParallel`](/docs/expression_language/primitives/parallel)로 변환되며, 이는 모든 값을 병렬로 실행하고 결과를 포함하는 사전을 반환합니다.

이는 다음 프롬프트 템플릿이 기대하는 형식과 동일합니다. 다음은 그 동작입니다:

```python
from langchain_core.output_parsers import StrOutputParser

analysis_prompt = ChatPromptTemplate.from_template("이 농담이 재미있나요? {joke}")

composed_chain = {"joke": chain} | analysis_prompt | model | StrOutputParser()
```

```python
composed_chain.invoke({"topic": "곰"})
```

```output
"이것은 꽤 고전적이고 잘 알려진 곰 말장난 농담입니다. 그것이 재미있다고 생각하는 것은 매우 주관적입니다. 유머는 매우 개인적인 것이기 때문입니다. 일부 사람들은 이러한 유형의 말장난 농담을 재미있다고 생각할 수 있지만, 다른 사람들은 그렇게 재미있지 않을 수도 있습니다. 궁극적으로 농담의 재미는 듣는 사람의 눈(또는 귀)에 달려 있습니다. 당신이 이 농담을 즐기고 웃음을 터뜨렸다면, 그게 가장 중요한 것입니다."
```

함수도 실행 가능 항목으로 강제 변환되므로 체인에 사용자 정의 로직을 추가할 수도 있습니다. 아래 체인은 이전과 동일한 논리적 흐름을 생성합니다:

```python
composed_chain_with_lambda = (
    chain
    | (lambda input: {"joke": input})
    | analysis_prompt
    | model
    | StrOutputParser()
)
```

```python
composed_chain_with_lambda.invoke({"topic": "비트"})
```

```output
'노력은 인정하지만, 솔직히 말해서 그 농담이 별로 재미있지 않았습니다. 비트 관련 말장난은 꽤 성공하기 어렵습니다. 이 농담은 더 예측 가능하고, 펀치라인이 그다지 강력하지 않습니다. 논리는 이해가 되지만, 농담의 핵심이 별로 웃기지 않습니다.\n\n그럼에도 불구하고, 야채를 주제로 한 농담과 말장난을 시도하는 당신의 의지를 존중합니다. 유머 감각을 키우는 것은 연습이 필요하며, 모든 농담이 성공할 수는 없습니다. 중요한 것은 계속해서 실험하고 효과적인 것을 찾는 것입니다. 다음 번에는 비트 관련 유머에 대한 좀 더 예상치 못한 창의적인 접근을 시도해 보세요. 그래도 공유해 주셔서 감사합니다. 농담을 시도해 주시는 것 자체가 항상 감사합니다.'
```

그러나 이러한 방식으로 함수를 사용하는 것은 스트리밍과 같은 작업에 방해가 될 수 있음을 유의하세요. 자세한 내용은 [이 섹션](/docs/expression_language/primitives/functions)을 참조하세요.

## `.pipe()` 메서드

`.pipe()` 메서드를 사용하여 동일한 시퀀스를 구성할 수도 있습니다. 다음은 그 예입니다:

```python
from langchain_core.runnables import RunnableParallel

composed_chain_with_pipe = (
    RunnableParallel({"joke": chain})
    .pipe(analysis_prompt)
    .pipe(model)
    .pipe(StrOutputParser())
)
```

```python
composed_chain_with_pipe.invoke({"topic": "배틀스타 갈락티카"})
```

```output
'그 농담은 꽤 괜찮은 배틀스타 갈락티카 관련 말장난입니다! "Centurion"과 "center on"을 이용한 재치있는 말장난을 높이 평가합니다. 이는 배틀스타 갈락티카 팬들이 즐길 수 있는 종류의 재미있는, 과학 소설 영감을 받은 유머입니다. 농담은 기발하며 배틀스타 갈락티카 세계에 대한 좋은 이해를 보여줍니다. 당신이 더 많은 배틀스타 관련 농담을 가지고 있다면 궁금하군요. 저작권이 있는 자료를 재생산하지 않는 한, 저는 쇼의 팬들에게 유머와 매력을 평가해 드리겠습니다.'
```