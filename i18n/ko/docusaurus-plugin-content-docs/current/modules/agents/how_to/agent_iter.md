---
translated: true
---

# 에이전트를 반복기로 실행하기

에이전트를 반복기로 실행하면 필요에 따라 사람이 개입하여 확인할 수 있습니다.

`AgentExecutorIterator` 기능을 보여주기 위해 에이전트가 다음을 수행해야 하는 문제를 설정하겠습니다:

- 도구에서 세 개의 소수를 가져오기
- 이를 곱하기

이 간단한 문제에서 중간 단계의 출력이 소수인지 확인하는 논리를 추가하여 보여줄 수 있습니다.

```python
from langchain.agents import AgentType, initialize_agent
from langchain.chains import LLMMathChain
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI
```

```python
%pip install --upgrade --quiet  numexpr
```

```python
# need to use GPT-4 here as GPT-3.5 does not understand, however hard you insist, that
# it should use the calculator to perform the final calculation
llm = ChatOpenAI(temperature=0, model="gpt-4")
llm_math_chain = LLMMathChain.from_llm(llm=llm, verbose=True)
```

다음과 같은 도구를 정의합니다:

- `n`번째 소수 (이 예제에서는 작은 부분집합 사용)

- 계산기 역할을 하는 `LLMMathChain`

```python
primes = {998: 7901, 999: 7907, 1000: 7919}


class CalculatorInput(BaseModel):
    question: str = Field()


class PrimeInput(BaseModel):
    n: int = Field()


def is_prime(n: int) -> bool:
    if n <= 1 or (n % 2 == 0 and n > 2):
        return False
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True


def get_prime(n: int, primes: dict = primes) -> str:
    return str(primes.get(int(n)))


async def aget_prime(n: int, primes: dict = primes) -> str:
    return str(primes.get(int(n)))


tools = [
    Tool(
        name="GetPrime",
        func=get_prime,
        description="A tool that returns the `n`th prime number",
        args_schema=PrimeInput,
        coroutine=aget_prime,
    ),
    Tool.from_function(
        func=llm_math_chain.run,
        name="Calculator",
        description="Useful for when you need to compute mathematical expressions",
        args_schema=CalculatorInput,
        coroutine=llm_math_chain.arun,
    ),
]
```

에이전트를 구성합니다. 여기서는 OpenAI Functions 에이전트를 사용할 것입니다.

```python
from langchain import hub

# Get the prompt to use - you can modify this!
# You can see the full prompt used at: https://smith.langchain.com/hub/hwchase17/openai-functions-agent
prompt = hub.pull("hwchase17/openai-functions-agent")
```

```python
from langchain.agents import create_openai_functions_agent

agent = create_openai_functions_agent(llm, tools, prompt)
```

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

반복을 실행하고 특정 단계에 대한 사용자 정의 확인을 수행합니다:

```python
question = "What is the product of the 998th, 999th and 1000th prime numbers?"

for step in agent_executor.iter({"input": question}):
    if output := step.get("intermediate_step"):
        action, value = output[0]
        if action.tool == "GetPrime":
            print(f"Checking whether {value} is prime...")
            assert is_prime(int(value))
        # Ask user if they want to continue
        _continue = input("Should the agent continue (Y/n)?:\n") or "Y"
        if _continue.lower() != "y":
            break
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `GetPrime` with `{'n': 998}`


[0m[36;1m[1;3m7901[0mChecking whether 7901 is prime...
Should the agent continue (Y/n)?:
y
[32;1m[1;3m
Invoking: `GetPrime` with `{'n': 999}`


[0m[36;1m[1;3m7907[0mChecking whether 7907 is prime...
Should the agent continue (Y/n)?:
y
[32;1m[1;3m
Invoking: `GetPrime` with `{'n': 1000}`


[0m[36;1m[1;3m7919[0mChecking whether 7919 is prime...
Should the agent continue (Y/n)?:
y
[32;1m[1;3m
Invoking: `Calculator` with `{'question': '7901 * 7907 * 7919'}`


[0m

[1m> Entering new LLMMathChain chain...[0m
7901 * 7907 * 7919[32;1m[1;3m```text
7901 * 7907 * 7919

...numexpr.evaluate("7901 * 7907 * 7919")...
[0m
Answer: [33;1m[1;3m494725326233[0m
[1m> Finished chain.[0m
[33;1m[1;3mAnswer: 494725326233[0mShould the agent continue (Y/n)?:
y
[32;1m[1;3mThe product of the 998th, 999th and 1000th prime numbers is 494,725,326,233.[0m

[1m> Finished chain.[0m
```
