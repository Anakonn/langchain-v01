---
sidebar_position: 2
title: 다중 체인
translated: true
---

실행 가능한 코드(Runnables)는 여러 체인을 쉽게 연결할 수 있습니다

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
from operator import itemgetter

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt1 = ChatPromptTemplate.from_template("그 사람이 {person} 출신인 도시는 어디인가요?")
prompt2 = ChatPromptTemplate.from_template(
    "그 도시는 어떤 나라에 있나요? {language}로 대답해주세요"
)

model = ChatOpenAI()

chain1 = prompt1 | model | StrOutputParser()

chain2 = (
    {"city": chain1, "language": itemgetter("language")}
    | prompt2
    | model
    | StrOutputParser()
)

chain2.invoke({"person": "obama", "language": "spanish"})
```

```output
'El país donde se encuentra la ciudad de Honolulu, donde nació Barack Obama, el 44º Presidente de los Estados Unidos, es Estados Unidos. Honolulu se encuentra en la isla de Oahu, en el estado de Hawái.'
```

```python
from langchain_core.runnables import RunnablePassthrough

prompt1 = ChatPromptTemplate.from_template(
    "{attribute} 색상을 생성하세요. 색상 이름만 반환하세요:"
)
prompt2 = ChatPromptTemplate.from_template(
    "다음 색상의 과일은 무엇인가요: {color}. 과일 이름만 반환하세요:"
)
prompt3 = ChatPromptTemplate.from_template(
    "다음 색상이 들어간 국기를 가진 나라는 어디인가요: {color}. 나라 이름만 반환하세요:"
)
prompt4 = ChatPromptTemplate.from_template(
    "{fruit}의 색상과 {country}의 국기의 색상은 무엇인가요?"
)

model_parser = model | StrOutputParser()

color_generator = (
    {"attribute": RunnablePassthrough()} | prompt1 | {"color": model_parser}
)
color_to_fruit = prompt2 | model_parser
color_to_country = prompt3 | model_parser
question_generator = (
    color_generator | {"fruit": color_to_fruit, "country": color_to_country} | prompt4
)
```

```python
question_generator.invoke("warm")
```

```output
ChatPromptValue(messages=[HumanMessage(content='딸기의 색상과 중국의 국기의 색상은 무엇인가요?', additional_kwargs={}, example=False)])
```

```python
prompt = question_generator.invoke("warm")
model.invoke(prompt)
```

```output
AIMessage(content='사과의 색상은 일반적으로 빨간색이나 녹색입니다. 중국 국기는 왼쪽 상단 모서리에 큰 노란색 별 하나와 그 주위에 작은 노란색 별 네 개가 있는 빨간색입니다.', additional_kwargs={}, example=False)
```

### 분기 및 병합

어떤 구성 요소의 출력을 2개 이상의 다른 구성 요소에서 처리하고 싶을 수 있습니다. [RunnableParallels](https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableParallel.html#langchain_core.runnables.base.RunnableParallel)를 사용하면 체인을 분기하거나 포크하여 여러 구성 요소가 입력을 병렬로 처리할 수 있습니다. 나중에 다른 구성 요소가 결과를 결합하여 최종 응답을 종합할 수 있습니다. 이 유형의 체인은 다음과 같은 계산 그래프를 생성합니다:

```text
     입력
      / \
     /   \
 분기1 분기2
     \   /
      \ /
      결합
```

```python
planner = (
    ChatPromptTemplate.from_template("다음 주제에 대해 주장을 생성하세요: {input}")
    | ChatOpenAI()
    | StrOutputParser()
    | {"base_response": RunnablePassthrough()}
)

arguments_for = (
    ChatPromptTemplate.from_template(
        "{base_response}의 장점이나 긍정적인 측면을 나열하세요"
    )
    | ChatOpenAI()
    | StrOutputParser()
)
arguments_against = (
    ChatPromptTemplate.from_template(
        "{base_response}의 단점이나 부정적인 측면을 나열하세요"
    )
    | ChatOpenAI()
    | StrOutputParser()
)

final_responder = (
    ChatPromptTemplate.from_messages(
        [
            ("ai", "{original_response}"),
            ("human", "장점:\n{results_1}\n\n단점:\n{results_2}"),
            ("system", "비평을 고려하여 최종 응답을 생성하세요"),
        ]
    )
    | ChatOpenAI()
    | StrOutputParser()
)

chain = (
    planner
    | {
        "results_1": arguments_for,
        "results_2": arguments_against,
        "original_response": itemgetter("base_response"),
    }
    | final_responder
)
```

```python
chain.invoke({"input": "스크럼"})
```

```output
'스크럼에는 잠재적인 단점과 도전 과제가 있지만, 많은 조직들이 이 프로젝트 관리 프레임워크를 성공적으로 채택하고 구현했습니다. 위에 언급된 단점들은 적절한 교육, 지원, 지속적인 개선을 통해 완화되거나 극복될 수 있습니다. 모든 단점이 모든 조직이나 프로젝트에 적용되는 것은 아닙니다.\n\n예를 들어, 초기에는 스크럼이 복잡할 수 있지만, 적절한 교육과 지침을 통해 팀은 개념과 실천을 빠르게 습득할 수 있습니다. 예측 불가능성은 속도 추적 및 릴리스 계획과 같은 기술을 구현하여 완화할 수 있습니다. 문서화가 부족한 것은 간결한 문서화와 팀 구성원 간의 명확한 의사 소통을 통해 해결할 수 있습니다. 팀 협업에 대한 의존성은 효과적인 의사 소통 채널과 정기적인 팀 빌딩 활동을 통해 개선될 수 있습니다.\n\n스크럼은 스크럼 오브 스크럼(Scrum of Scrums)이나 대규모 스크럼(LeSS)과 같은 프레임워크를 사용하여 더 큰 프로젝트에 확장하고 적응할 수 있습니다. 속도와 품질에 대한 우려는 지속적인 통합과 자동화 테스트와 같은 품질 보증 실천을 스크럼 프로세스에 통합하여 해결할 수 있습니다. 스코프 크리프(Scope creep)는 잘 정의되고 우선순위가 매겨진 제품 백로그를 보유함으로써 관리할 수 있으며, 강력한 제품 소유자는 교육과 멘토링을 통해 개발될 수 있습니다.\n\n변화에 대한 저항은 이해 관계자에게 적절한 교육과 소통을 제공하고, 그들을 의사 결정 과정에 참여시킴으로써 극복할 수 있습니다. 궁극적으로, 스크럼의 단점은 성장과 개선의 기회로 볼 수 있으며, 올바른 사고 방식과 지원을 통해 효과적으로 관리될 수 있습니다.\n\n결론적으로, 스크럼에는 도전과 잠재적인 단점이 있을 수 있지만, 협업, 유연성, 적응력, 투명성, 고객 만족도 측면에서 제공하는 이점과 장점은 많은 조직이 스크럼을 널리 채택하고 성공적인 프로젝트 관리 프레임워크로 삼게 합니다. 적절한 구현과 지속적인 개선을 통해 조직은 스크럼을 활용하여 혁신, 효율성 및 프로젝트 성공을 이끌어낼 수 있습니다.'
```