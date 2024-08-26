---
keywords:
- ConfigurableField
- configurable_fields
- ConfigurableAlternatives
- configurable_alternatives
- LCEL
sidebar_position: 7
title: 런타임 체인 내부 구성
translated: true
---

# 런타임에 체인 내부 구성하기

때때로 여러 가지 방법을 실험하거나 최종 사용자에게 노출시키고 싶을 때가 있습니다.
이 경험을 최대한 쉽게 만들기 위해 두 가지 방법을 정의했습니다.

첫째, `configurable_fields` 메서드입니다.
이 메서드를 사용하면 실행 가능한 항목의 특정 필드를 구성할 수 있습니다.

둘째, `configurable_alternatives` 메서드입니다.
이 메서드를 사용하면 런타임 중에 설정할 수 있는 특정 실행 가능한 항목에 대한 대안을 나열할 수 있습니다.

## 구성 필드

### LLM과 함께

LLM의 온도와 같은 항목을 구성할 수 있습니다.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import ConfigurableField
from langchain_openai import ChatOpenAI

model = ChatOpenAI(temperature=0).configurable_fields(
    temperature=ConfigurableField(
        id="llm_temperature",
        name="LLM 온도",
        description="LLM의 온도",
    )
)
```

```python
model.invoke("랜덤 숫자를 고르세요")
```

```output
AIMessage(content='7')
```

```python
model.with_config(configurable={"llm_temperature": 0.9}).invoke("랜덤 숫자를 고르세요")
```

```output
AIMessage(content='34')
```

체인의 일부로 사용될 때도 이 작업을 수행할 수 있습니다.

```python
prompt = PromptTemplate.from_template("x 이상의 랜덤 숫자를 고르세요")
chain = prompt | model
```

```python
chain.invoke({"x": 0})
```

```output
AIMessage(content='57')
```

```python
chain.with_config(configurable={"llm_temperature": 0.9}).invoke({"x": 0})
```

```output
AIMessage(content='6')
```

### HubRunnables와 함께

프롬프트를 전환하는 데 유용합니다.

```python
from langchain.runnables.hub import HubRunnable
```

```python
prompt = HubRunnable("rlm/rag-prompt").configurable_fields(
    owner_repo_commit=ConfigurableField(
        id="hub_commit",
        name="Hub 커밋",
        description="끌어올 Hub 커밋",
    )
)
```

```python
prompt.invoke({"question": "foo", "context": "bar"})
```

```output
ChatPromptValue(messages=[HumanMessage(content="당신은 질문 응답 작업을 위한 어시스턴트입니다. 질문에 답하기 위해 다음 검색된 컨텍스트 조각을 사용하세요. 답을 모르면 모른다고 말하세요. 최대 세 문장으로 답변을 간결하게 유지하세요.\n질문: foo \n컨텍스트: bar \n답변:")])
```

```python
prompt.with_config(configurable={"hub_commit": "rlm/rag-prompt-llama"}).invoke(
    {"question": "foo", "context": "bar"}
)
```

```output
ChatPromptValue(messages=[HumanMessage(content="[INST]<<SYS>> 당신은 질문 응답 작업을 위한 어시스턴트입니다. 질문에 답하기 위해 다음 검색된 컨텍스트 조각을 사용하세요. 답을 모르면 모른다고 말하세요. 최대 세 문장으로 답변을 간결하게 유지하세요.<</SYS>> \n질문: foo \n컨텍스트: bar \n답변: [/INST]")])
```

## 구성 가능한 대안

### LLM과 함께

LLM을 사용한 예제를 살펴보겠습니다.

```python
from langchain_community.chat_models import ChatAnthropic
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import ConfigurableField
from langchain_openai import ChatOpenAI
```

```python
llm = ChatAnthropic(temperature=0).configurable_alternatives(
    # 이 필드에 ID를 부여합니다.
    # 최종 실행 가능한 항목을 구성할 때 이 ID를 사용하여 이 필드를 구성할 수 있습니다.
    ConfigurableField(id="llm"),
    # 이 키를 지정하면 기본 LLM(ChatAnthropic으로 초기화된 위)이 사용됩니다.
    default_key="anthropic",
    # 새로운 옵션을 추가합니다. 이름 `openai`는 `ChatOpenAI()`와 같습니다.
    openai=ChatOpenAI(),
    # 새로운 옵션을 추가합니다. 이름 `gpt4`는 `ChatOpenAI(model="gpt-4")`와 같습니다.
    gpt4=ChatOpenAI(model="gpt-4"),
    # 여기서 더 많은 구성 옵션을 추가할 수 있습니다.
)
prompt = PromptTemplate.from_template("주제 {topic}에 대한 농담을 해주세요")
chain = prompt | llm
```

```python
# 기본적으로 Anthropic을 호출합니다.

chain.invoke({"topic": "곰"})
```

```output
AIMessage(content="곰에 관한 농담이 있습니다:\n\n이를 가진 곰을 뭐라고 부르나요?\n젤리 곰!")
```

```python
# `.with_config(configurable={"llm": "openai"})`를 사용하여 사용할 llm을 지정할 수 있습니다.

chain.with_config(configurable={"llm": "openai"}).invoke({"topic": "곰"})
```

```output
AIMessage(content="물론이죠, 곰에 대한 농담을 하나 들려드릴게요:\n\n곰은 왜 신발을 신지 않을까요?\n\n곰발바닥이 있기 때문이죠!")
```

```python
# `default_key`를 사용하면 기본값을 사용합니다.

chain.with_config(configurable={"llm": "anthropic"}).invoke({"topic": "곰"})
```

```output
AIMessage(content="곰에 관한 농담이 있습니다:\n\n이를 가진 곰을 뭐라고 부르나요?\n젤리 곰!")
```

### 프롬프트와 함께

유사한 작업을 수행할 수 있지만, 프롬프트 간에 대체할 수 있습니다.

```python
llm = ChatAnthropic(temperature=0)
prompt = PromptTemplate.from_template(
    "주제 {topic}에 대한 농담을 해주세요"
).configurable_alternatives(
    # 이 필드에 ID를 부여합니다.
    # 최종 실행 가능한 항목을 구성할 때 이 ID를 사용하여 이 필드를 구성할 수 있습니다.
    ConfigurableField(id="prompt"),
    # 이 키를 지정하면 기본 LLM(ChatAnthropic으로 초기화된 위)이 사용됩니다.
    default_key="joke",
    # 새로운 옵션을 추가합니다. 이름 `poem`
    poem=PromptTemplate.from_template("주제 {topic}에 대한 짧은 시를 작성해주세요"),
    # 여기서 더 많은 구성 옵션을 추가할 수 있습니다.
)
chain = prompt | llm
```

```python
# 기본적으로 농담을 작성합니다.

chain.invoke({"topic": "곰"})
```

```output
AIMessage(content="곰에 관한 농담이 있습니다:\n\n이를 가진 곰을 뭐라고 부르나요?\n젤리 곰!")
```

```python
# 시를 작성하도록 구성할 수 있습니다.

chain.with_config(configurable={"prompt": "poem"}).invoke({"topic": "곰"})
```

```output
AIMessage(content='곰에 관한 짧은 시입니다:\n\n곰은 숲속을 거닐며\n밤이 오기 전 먹이를 찾고\n높은 나무들 사이를 배회한다\n그들의 털은 두껍고 발톱은 날카롭다\n베리와 물고기를 찾아다니며\n거침없이 돌아다니는 곰들\n위엄 있는 존재들, 자유롭고 야생의\n숲을 지배하는 강력한 곰들\n그들의 영역을 방어하며\n굳건히 그 자리를 지킨다')
```

### 프롬프트와 LLM을 함께

여러 항목을 구성할 수도 있습니다!
다음은 프롬프트와 LLM을 함께 사용하는 예제입니다.

```python
llm = ChatAnthropic(temperature=0).configurable_alternatives(
    # 이 필드에 ID를 부여합니다.
    # 최종 실행 가능한 항목을 구성할 때 이 ID를 사용하여 이 필드를 구성할 수 있습니다.
    ConfigurableField(id="llm"),
    # 이 키를 지정하면 기본 LLM(ChatAnthropic으로 초기화된 위)이 사용됩니다.
    default_key="anthropic",
    # 새로운 옵션을 추가합니다. 이름 `openai`는 `ChatOpenAI()`와 같습니다.
    openai=ChatOpenAI(),
    # 새로운 옵션을 추가합니다. 이름 `gpt4`는 `ChatOpenAI(model="gpt-4")`와 같습니다.
    gpt4=ChatOpenAI(model="gpt-4"),
    # 여기서 더 많은 구성 옵션을 추가할 수 있습니다.
)
prompt = PromptTemplate.from_template(
    "주제 {topic}에 대한 농담을 해주세요"
).configurable_alternatives(
    # 이 필드에 ID를 부여합니다.
    # 최종 실행 가능한 항목을 구성할 때 이 ID를 사용하여 이 필드를 구성할 수 있습니다.
    ConfigurableField(id="prompt"),
    # 이 키를 지정하면 기본 LLM(ChatAnthropic으로 초기화된 위)이 사용됩니다.
    default_key="joke",
    # 새로운 옵션을 추가합니다. 이름 `poem`
    poem=PromptTemplate.from_template("주제 {topic}에 대한 짧은 시를 작성해주세요"),
    # 여기서 더 많은 구성 옵션을 추가할 수 있습니다.
)
chain = prompt | llm
```

```python
# OpenAI를 사용하여 시를 작성하도록 구성할 수 있습니다.

chain.with_config(configurable={"prompt": "poem", "llm": "openai"}).invoke(
    {"topic": "곰"}
)
```

```output
AIMessage(content="숲속에서, 키 큰 나무들이 흔들리는 곳,\n회색의 강력한 생물이 거닙니다.\n강력한 발톱과 날카로운 눈으로,\n곰, 힘의 상징이 도전합니다.\n\n눈 덮인 산을 넘나들며,\n그들의 숲속 집을 지키는 수호자입니다.\n두꺼운 털로 감싼 방패로,\n가장 추운 겨울 밤을 이겨냅니다.\n\n온화한 거인, 그러나 자유롭고 야생의,\n곰은 존경받는 존재입니다.\n걸음마다 자취를 남기며,\n그들은 미지의 힘과 고대의 우아함을 보여줍니다.\n\n꿀을 먹고 연어를 잡으며,\n자연의 영역에서 그들의 자리를 차지합니다.\n자연의 기쁨의 상징,\n곰, 낮과 밤을 통틀어 경이로운 존재입니다.\n\n이 고귀한 생물을 기립합시다,\n그들의 영혼이 평화를 찾는 숲속에서.\n그들의 존재 속에서 우리는 알게 됩니다,\n우리 안에도 흐르는 미지의 정신을.")
```

```python
# 원한다면 하나만 구성할 수도 있습니다.

chain.with_config(configurable={"llm": "openai"}).invoke({"topic": "곰"})
```

```output
AIMessage(content="물론이죠, 곰에 대한 농담을 하나 들려드릴게요:\n\n곰은 왜 신발을 신지 않을까요?\n\n곰발바닥이 있기 때문이죠!")
```

### 구성 저장

구성된 체인을 개체로 저장할 수도 있습니다.

```python
openai_joke = chain.with_config(configurable={"llm": "openai"})
```

```python
openai_joke.invoke({"topic": "곰"})
```

```output
AIMessage(content="곰은 왜 신발을 신지 않을까요?\n\n곰발바닥이 있기 때문이죠!")
```