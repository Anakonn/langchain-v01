---
sidebar_position: 0
title: 빠른 시작
translated: true
---

# 빠른 시작

대규모 언어 모델(LLM)은 LangChain의 핵심 구성 요소입니다.
LangChain은 자체 LLM을 제공하지 않지만, 다양한 LLM과 상호 작용하기 위한 표준 인터페이스를 제공합니다.

LLM 공급업체(OpenAI, Cohere, Hugging Face 등)가 많이 있습니다. `LLM` 클래스는 이들 모두에 대한 표준 인터페이스를 제공하도록 설계되었습니다.

이 연습에서는 OpenAI LLM 래퍼를 사용하겠지만, 강조된 기능은 모든 LLM 유형에 일반적입니다.

### 설정

이 예제에서는 OpenAI Python 패키지를 설치해야 합니다:

```bash
pip install openai
```

API에 액세스하려면 API 키가 필요합니다. 계정을 만들고 [여기](https://platform.openai.com/account/api-keys)로 이동하여 키를 얻을 수 있습니다. 키를 얻으면 다음을 실행하여 환경 변수로 설정하고 싶습니다:

```bash
export OPENAI_API_KEY="..."
```

환경 변수를 설정하고 싶지 않다면 OpenAI LLM 클래스를 초기화할 때 `api_key` 매개변수로 직접 전달할 수 있습니다:

```python
from langchain_openai import OpenAI

llm = OpenAI(api_key="...")
```

그렇지 않으면 매개변수 없이 초기화할 수 있습니다:

```python
from langchain_openai import OpenAI

llm = OpenAI()
```

## LCEL

LLM은 [Runnable 인터페이스](/docs/expression_language/interface)를 구현하며, 이는 [LangChain Expression Language(LCEL)](/docs/expression_language/)의 기본 구성 요소입니다. 이는 `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log` 호출을 지원한다는 의미입니다.

LLM은 문자열 또는 문자열 프롬프트로 변환할 수 있는 객체(예: `List[BaseMessage]` 및 `PromptValue`)를 입력으로 허용합니다.

```python
llm.invoke(
    "What are some theories about the relationship between unemployment and inflation?"
)
```

```output
'\n\n1. The Phillips Curve Theory: This suggests that there is an inverse relationship between unemployment and inflation, meaning that when unemployment is low, inflation will be higher, and when unemployment is high, inflation will be lower.\n\n2. The Monetarist Theory: This theory suggests that the relationship between unemployment and inflation is weak, and that changes in the money supply are more important in determining inflation.\n\n3. The Resource Utilization Theory: This suggests that when unemployment is low, firms are able to raise wages and prices in order to take advantage of the increased demand for their products and services. This leads to higher inflation.'
```

```python
for chunk in llm.stream(
    "What are some theories about the relationship between unemployment and inflation?"
):
    print(chunk, end="", flush=True)
```

```output


1. The Phillips Curve Theory: This theory states that there is an inverse relationship between unemployment and inflation. As unemployment decreases, inflation increases and vice versa.

2. The Cost-Push Inflation Theory: This theory suggests that an increase in unemployment leads to a decrease in aggregate demand, which causes prices to go up due to a decrease in supply.

3. The Wage-Push Inflation Theory: This theory states that when unemployment is low, wages tend to increase due to competition for labor, which causes prices to rise.

4. The Monetarist Theory: This theory states that there is no direct relationship between unemployment and inflation, but rather, an increase in the money supply leads to inflation, which can be caused by an increase in unemployment.
```

```python
llm.batch(
    [
        "What are some theories about the relationship between unemployment and inflation?"
    ]
)
```

```output
['\n\n1. The Phillips Curve Theory: This theory suggests that there is an inverse relationship between unemployment and inflation, meaning that when unemployment decreases, inflation rises, and when unemployment increases, inflation decreases. This theory is based on the idea that when the economy is doing well, there is more demand for goods and services, causing prices to increase.\n\n2. The Cost-Push Theory: This theory suggests that when the cost of production increases, it leads to higher prices and lower output. This can lead to higher unemployment and eventually higher inflation.\n\n3. The Demand-Pull Theory: This theory suggests that when demand for goods and services increases, it leads to higher prices and eventually higher inflation. This can lead to higher unemployment as businesses cannot keep up with the higher demand.\n\n4. The Structural Unemployment Theory: This theory suggests that when there is a mismatch between the skills of the unemployed and the skills required in the job market, it leads to higher unemployment and eventually higher inflation.']
```

```python
await llm.ainvoke(
    "What are some theories about the relationship between unemployment and inflation?"
)
```

```output
'\n\n1. Phillips Curve Theory: This theory states that there is an inverse relationship between inflation and unemployment. As unemployment decreases, inflation increases, and vice versa.\n\n2. Cost-Push Theory: This theory suggests that inflation is caused by rising costs, which can be caused by an increase in unemployment. As unemployment rises, businesses are unable to keep up with demand and have to raise prices to compensate.\n\n3. Demand-Pull Theory: This theory suggests that inflation occurs when demand exceeds supply. As unemployment increases, demand for goods and services decreases, leading to a decrease in inflation.\n\n4. Monetary Theory: This theory suggests that the money supply and inflation are related to unemployment. When the money supply increases, prices increase, leading to an increase in inflation. If unemployment is high, then the money supply increases, leading to an increase in inflation.'
```

```python
async for chunk in llm.astream(
    "What are some theories about the relationship between unemployment and inflation?"
):
    print(chunk, end="", flush=True)
```

```output


1. Phillips Curve Theory: This theory suggests that there is an inverse relationship between unemployment and inflation, meaning that when unemployment is low, inflation rises and vice versa.

2. Cost-Push Theory: This theory suggests that inflation is caused by rising costs of production, such as wages, raw materials, and energy. It states that when costs increase, firms must pass these costs onto the consumer, thus raising the price of goods and services and leading to inflation.

3. Demand-Pull Theory: This theory suggests that inflation is caused by an increase in demand for goods and services, leading to a rise in prices. It suggests that when unemployment is low, people have more money to spend and this increased demand pushes up prices.

4. Monetarist Theory: This theory states that inflation is caused by an increase in the money supply. It suggests that when the money supply increases, people have more money to spend, leading to higher prices.
```

```python
await llm.abatch(
    [
        "What are some theories about the relationship between unemployment and inflation?"
    ]
)
```

```output
['\n\n1. The Phillips Curve Theory: This theory states that there is an inverse relationship between unemployment and inflation. When unemployment is low, wages increase, leading to higher prices and overall inflation.\n\n2. The Cost-Push Theory: This theory states that inflation is caused by increases in the costs of production, such as wages, goods, and services. When the cost of production increases, the prices of goods and services must also increase, leading to inflation.\n\n3. The Demand Pull Theory: This theory states that inflation is caused by an increase in aggregate demand for goods and services. When the demand is high, prices must increase in order to meet the demand. This leads to inflation.\n\n4. The Structural Unemployment Theory: This theory states that when unemployment is high, there is an excess supply of labor. This excess supply of labor can result in lower wages, which can cause inflation as people are willing to accept lower wages for the same amount of work.']
```

```python
async for chunk in llm.astream_log(
    "What are some theories about the relationship between unemployment and inflation?"
):
    print(chunk)
```

```output
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': 'baf410ad-618e-44db-93c8-809da4e3ed44',
            'logs': {},
            'streamed_output': []}})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '1'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' The'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Phillips'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Curve'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ':'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' This'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' suggests'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' that'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' there'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' an'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inverse'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' relationship'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' between'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment and'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' When'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' low'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' tends'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' be'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' high'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' and'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' when'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' high'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' tends'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' be'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' low'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' '})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '2'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' The'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' NA'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'IR'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'U'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ':'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' This'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' suggests'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' that there is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' a'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' natural'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' rate'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' of'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' also'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' known'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' as'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' the'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Non'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '-'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'Ac'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'celer'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'ating'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' In'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'flation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Rate'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' of'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' ('})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'NA'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'IR'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'U'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ').'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' According'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' this'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' when'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' below'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' the'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' NA'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'IR'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'U'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' then'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' will'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' increase'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' and'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' when'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' is'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' above'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' the'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' NA'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'IR'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'U'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' then'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' will'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' decrease'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '\n'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '3'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' The'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Cost'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '-'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'Push'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' In'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'flation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ':'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' This'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' theory'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' suggests'})
RunLogPatch({'op': 'add',
  'path': '/streamed_output/-',
  'value': ' that high unemployment'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' leads'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' higher'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' wages'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ','})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' which'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' in'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' turn'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' leads'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' to'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' higher'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' prices'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' and higher inflation'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'})
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ''})
RunLogPatch({'op': 'replace',
  'path': '/final_output',
  'value': {'generations': [[{'generation_info': {'finish_reason': 'stop',
                                                  'logprobs': None},
                              'text': '\n'
                                      '\n'
                                      '1. The Phillips Curve: This theory '
                                      'suggests that there is an inverse '
                                      'relationship between unemployment and '
                                      'inflation. When unemployment is low, '
                                      'inflation tends to be high, and when '
                                      'unemployment is high, inflation tends '
                                      'to be low. \n'
                                      '\n'
                                      '2. The NAIRU Theory: This theory '
                                      'suggests that there is a natural rate '
                                      'of unemployment, also known as the '
                                      'Non-Accelerating Inflation Rate of '
                                      'Unemployment (NAIRU). According to this '
                                      'theory, when unemployment is below the '
                                      'NAIRU, then inflation will increase, '
                                      'and when unemployment is above the '
                                      'NAIRU, then inflation will decrease.\n'
                                      '\n'
                                      '3. The Cost-Push Inflation Theory: This '
                                      'theory suggests that high unemployment '
                                      'leads to higher wages, which in turn '
                                      'leads to higher prices and higher '
                                      'inflation.'}]],
            'llm_output': None,
            'run': None}})
```

## [LangSmith](/docs/langsmith)

모든 `LLM`에는 내장된 LangSmith 추적 기능이 있습니다. 다음과 같은 환경 변수를 설정하기만 하면 됩니다:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=<your-api-key>
```

그러면 체인에 중첩되어 있는지 여부에 관계없이 모든 `LLM` 호출이 자동으로 추적됩니다. 추적에는 입력, 출력, 대기 시간, 토큰 사용량, 호출 매개변수, 환경 매개변수 등이 포함됩니다. 예제는 여기에서 확인할 수 있습니다: https://smith.langchain.com/public/7924621a-ff58-4b1c-a2a2-035a354ef434/r.

LangSmith에서는 모든 추적에 대한 피드백을 제공하고, 평가를 위한 주석이 달린 데이터 세트를 컴파일하며, 성능을 디버깅할 수 있습니다.
