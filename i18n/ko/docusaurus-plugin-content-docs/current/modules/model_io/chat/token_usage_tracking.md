---
translated: true
---

# 토큰 사용량 추적하기

이 노트북은 특정 호출에 대한 토큰 사용량을 추적하는 방법을 설명합니다.

## AIMessage.response_metadata 사용하기

많은 모델 제공업체들이 채팅 생성 응답의 일부로 토큰 사용량 정보를 반환합니다. 사용 가능한 경우 이는 [AIMessage.response_metadata](/docs/modules/model_io/chat/response_metadata/)에 포함됩니다. 다음은 OpenAI의 예시입니다:

```python
# !pip install -qU langchain-openai

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4-turbo")
msg = llm.invoke([("human", "What's the oldest known example of cuneiform")])
msg.response_metadata
```

```output
{'token_usage': {'completion_tokens': 225,
  'prompt_tokens': 17,
  'total_tokens': 242},
 'model_name': 'gpt-4-turbo',
 'system_fingerprint': 'fp_76f018034d',
 'finish_reason': 'stop',
 'logprobs': None}
```

그리고 Anthropic의 예시는 다음과 같습니다:

```python
# !pip install -qU langchain-anthropic

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229")
msg = llm.invoke([("human", "What's the oldest known example of cuneiform")])
msg.response_metadata
```

```output
{'id': 'msg_01P61rdHbapEo6h3fjpfpCQT',
 'model': 'claude-3-sonnet-20240229',
 'stop_reason': 'end_turn',
 'stop_sequence': None,
 'usage': {'input_tokens': 17, 'output_tokens': 306}}
```

## 콜백 사용하기

API 특정 콜백 컨텍스트 관리자를 사용하여 여러 호출에 걸쳐 토큰 사용량을 추적할 수도 있습니다. 현재 OpenAI API와 Bedrock Anthropic API에만 구현되어 있습니다.

### OpenAI

먼저 단일 Chat 모델 호출에 대한 토큰 사용량 추적의 매우 간단한 예를 살펴보겠습니다.

```python
# !pip install -qU langchain-community wikipedia

from langchain_community.callbacks.manager import get_openai_callback
```

```python
llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)
```

```python
with get_openai_callback() as cb:
    result = llm.invoke("Tell me a joke")
    print(cb)
```

```output
Tokens Used: 26
	Prompt Tokens: 11
	Completion Tokens: 15
Successful Requests: 1
Total Cost (USD): $0.00056
```

컨텍스트 관리자 내부의 모든 것이 추적됩니다. 여기에는 순차적으로 여러 호출을 추적하는 예가 있습니다.

```python
with get_openai_callback() as cb:
    result = llm.invoke("Tell me a joke")
    result2 = llm.invoke("Tell me a joke")
    print(cb.total_tokens)
```

```output
52
```

체인 또는 에이전트에 여러 단계가 있는 경우 모든 단계가 추적됩니다.

```python
from langchain.agents import AgentExecutor, create_tool_calling_agent, load_tools
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You're a helpful assistant"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)
tools = load_tools(["wikipedia"])
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, stream_runnable=False
)
```

:::note
토큰 계산이 작동하려면 `stream_runnable=False`로 설정해야 합니다. 기본적으로 AgentExecutor는 가장 세부적인 결과를 얻을 수 있도록 기반 에이전트의 스트리밍을 수행합니다. 그러나 OpenAI는 모델 응답을 스트리밍할 때 토큰 수를 반환하지 않으므로 기본 스트리밍을 꺼야 합니다.
:::

```python
with get_openai_callback() as cb:
    response = agent_executor.invoke(
        {
            "input": "What's a hummingbird's scientific name and what's the fastest bird species?"
        }
    )
    print(f"Total Tokens: {cb.total_tokens}")
    print(f"Prompt Tokens: {cb.prompt_tokens}")
    print(f"Completion Tokens: {cb.completion_tokens}")
    print(f"Total Cost (USD): ${cb.total_cost}")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `wikipedia` with `Hummingbird`


[0m[36;1m[1;3mPage: Hummingbird
Summary: Hummingbirds are birds native to the Americas and comprise the biological family Trochilidae. With approximately 366 species and 113 genera, they occur from Alaska to Tierra del Fuego, but most species are found in Central and South America. As of 2024, 21 hummingbird species are listed as endangered or critically endangered, with numerous species declining in population.Hummingbirds have varied specialized characteristics to enable rapid, maneuverable flight: exceptional metabolic capacity, adaptations to high altitude, sensitive visual and communication abilities, and long-distance migration in some species. Among all birds, male hummingbirds have the widest diversity of plumage color, particularly in blues, greens, and purples. Hummingbirds are the smallest mature birds, measuring 7.5–13 cm (3–5 in) in length. The smallest is the 5 cm (2.0 in) bee hummingbird, which weighs less than 2.0 g (0.07 oz), and the largest is the 23 cm (9 in) giant hummingbird, weighing 18–24 grams (0.63–0.85 oz). Noted for long beaks, hummingbirds are specialized for feeding on flower nectar, but all species also consume small insects.
They are known as hummingbirds because of the humming sound created by their beating wings, which flap at high frequencies audible to other birds and humans. They hover at rapid wing-flapping rates, which vary from around 12 beats per second in the largest species to 80 per second in small hummingbirds.
Hummingbirds have the highest mass-specific metabolic rate of any homeothermic animal. To conserve energy when food is scarce and at night when not foraging, they can enter torpor, a state similar to hibernation, and slow their metabolic rate to 1⁄15 of its normal rate. While most hummingbirds do not migrate, the rufous hummingbird has one of the longest migrations among birds, traveling twice per year between Alaska and Mexico, a distance of about 3,900 miles (6,300 km).
Hummingbirds split from their sister group, the swifts and treeswifts, around 42 million years ago. The oldest known fossil hummingbird is Eurotrochilus, from the Rupelian Stage of Early Oligocene Europe.



Page: Bee hummingbird
Summary: The bee hummingbird, zunzuncito or Helena hummingbird (Mellisuga helenae) is a species of hummingbird, native to the island of Cuba in the Caribbean. It is the smallest known bird. The bee hummingbird feeds on nectar of flowers and bugs found in Cuba.

Page: Hummingbird cake
Summary: Hummingbird cake is a banana-pineapple spice cake originating in Jamaica and a popular dessert in the southern United States since the 1970s. Ingredients include flour, sugar, salt, vegetable oil, ripe banana, pineapple, cinnamon, pecans, vanilla extract, eggs, and leavening agent. It is often served with cream cheese frosting.[0m[32;1m[1;3m
Invoking: `wikipedia` with `Fastest bird`


[0m[36;1m[1;3mPage: Fastest animals
Summary: This is a list of the fastest animals in the world, by types of animal.



Page: List of birds by flight speed
Summary: This is a list of the fastest flying birds in the world. A bird's velocity is necessarily variable; a hunting bird will reach much greater speeds while diving to catch prey than when flying horizontally. The bird that can achieve the greatest airspeed is the peregrine falcon, able to exceed 320 km/h (200 mph) in its dives. A close relative of the common swift, the white-throated needletail (Hirundapus caudacutus), is commonly reported as the fastest bird in level flight with a reported top speed of 169 km/h (105 mph). This record remains unconfirmed as the measurement methods have never been published or verified. The record for the fastest confirmed level flight by a bird is 111.5 km/h (69.3 mph) held by the common swift.

Page: Ostrich
Summary: Ostriches are large flightless birds. They are the heaviest and largest living birds, with adult common ostriches weighing anywhere between 63.5 and 145 kilograms and laying the largest eggs of any living land animal. With the ability to run at 70 km/h (43.5 mph), they are the fastest birds on land. They are farmed worldwide, with significant industries in the Philippines and in Namibia. Ostrich leather is a lucrative commodity, and the large feathers are used as plumes for the decoration of ceremonial headgear. Ostrich eggs have been used by humans for millennia.
Ostriches are of the genus Struthio in the order Struthioniformes, part of the infra-class Palaeognathae, a diverse group of flightless birds also known as ratites that includes the emus, rheas, cassowaries, kiwis and the extinct elephant birds and moas. There are two living species of ostrich: the common ostrich, native to large areas of sub-Saharan Africa, and the Somali ostrich, native to the Horn of Africa.  The common ostrich was historically native to the Arabian Peninsula, and ostriches were present across Asia as far east as China and Mongolia during the Late Pleistocene and possibly into the Holocene.[0m[32;1m[1;3m### Hummingbird's Scientific Name
The scientific name for the bee hummingbird, which is the smallest known bird and a species of hummingbird, is **Mellisuga helenae**. It is native to Cuba.

### Fastest Bird Species
The fastest bird in terms of airspeed is the **peregrine falcon**, which can exceed speeds of 320 km/h (200 mph) during its diving flight. In level flight, the fastest confirmed speed is held by the **common swift**, which can fly at 111.5 km/h (69.3 mph).[0m

[1m> Finished chain.[0m
Total Tokens: 1583
Prompt Tokens: 1412
Completion Tokens: 171
Total Cost (USD): $0.019250000000000003
```

### Bedrock Anthropic

`get_bedrock_anthropic_callback`은 매우 유사하게 작동합니다:

```python
# !pip install langchain-aws
from langchain_aws import ChatBedrock
from langchain_community.callbacks.manager import get_bedrock_anthropic_callback

llm = ChatBedrock(model_id="anthropic.claude-v2")

with get_bedrock_anthropic_callback() as cb:
    result = llm.invoke("Tell me a joke")
    result2 = llm.invoke("Tell me a joke")
    print(cb)
```

```output
Tokens Used: 0
	Prompt Tokens: 0
	Completion Tokens: 0
Successful Requests: 2
Total Cost (USD): $0.0
```
