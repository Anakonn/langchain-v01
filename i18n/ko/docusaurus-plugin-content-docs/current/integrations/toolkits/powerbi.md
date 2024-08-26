---
translated: true
---

# Power BI 데이터셋

이 노트북은 `Power BI 데이터셋`과 상호 작용하는 에이전트를 보여줍니다. 에이전트는 데이터셋에 대한 더 일반적인 질문에 답변하고 오류를 복구합니다.

참고로 이 에이전트는 현재 개발 중이므로 모든 답변이 정확하지 않을 수 있습니다. [executequery 엔드포인트](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries)를 사용하므로 삭제가 허용되지 않습니다.

### 참고 사항:

- azure.identity 패키지를 사용하여 인증하며, `pip install azure-identity`로 설치할 수 있습니다. 또는 토큰을 문자열로 제공하여 Power BI 데이터셋을 생성할 수 있습니다.
- RLS(행 수준 보안)이 활성화된 데이터셋에 사용할 사용자 이름을 제공할 수도 있습니다.
- 툴킷은 LLM을 사용하여 질문에서 쿼리를 생성하며, 에이전트는 전체 실행을 위해 LLM을 사용합니다.
- 테스트는 주로 `gpt-3.5-turbo-instruct` 모델로 수행되었으며, codex 모델은 성능이 좋지 않았습니다.

## 초기화

```python
from azure.identity import DefaultAzureCredential
from langchain_community.agent_toolkits import PowerBIToolkit, create_pbi_agent
from langchain_community.utilities.powerbi import PowerBIDataset
from langchain_openai import ChatOpenAI
```

```python
fast_llm = ChatOpenAI(
    temperature=0.5, max_tokens=1000, model_name="gpt-3.5-turbo", verbose=True
)
smart_llm = ChatOpenAI(temperature=0, max_tokens=100, model_name="gpt-4", verbose=True)

toolkit = PowerBIToolkit(
    powerbi=PowerBIDataset(
        dataset_id="<dataset_id>",
        table_names=["table1", "table2"],
        credential=DefaultAzureCredential(),
    ),
    llm=smart_llm,
)

agent_executor = create_pbi_agent(
    llm=fast_llm,
    toolkit=toolkit,
    verbose=True,
)
```

## 예시: 테이블 설명하기

```python
agent_executor.run("Describe table1")
```

## 예시: 테이블에 대한 간단한 쿼리

이 예에서 에이전트는 실제로 테이블의 행 수를 가져오는 올바른 쿼리를 찾아냅니다.

```python
agent_executor.run("How many records are in table1?")
```

## 예시: 쿼리 실행하기

```python
agent_executor.run("How many records are there by dimension1 in table2?")
```

```python
agent_executor.run("What unique values are there for dimensions2 in table2")
```

## 예시: 자체 few-shot 프롬프트 추가하기

```python
# fictional example
few_shots = """
Question: How many rows are in the table revenue?
DAX: EVALUATE ROW("Number of rows", COUNTROWS(revenue_details))
----
Question: How many rows are in the table revenue where year is not empty?
DAX: EVALUATE ROW("Number of rows", COUNTROWS(FILTER(revenue_details, revenue_details[year] <> "")))
----
Question: What was the average of value in revenue in dollars?
DAX: EVALUATE ROW("Average", AVERAGE(revenue_details[dollar_value]))
----
"""
toolkit = PowerBIToolkit(
    powerbi=PowerBIDataset(
        dataset_id="<dataset_id>",
        table_names=["table1", "table2"],
        credential=DefaultAzureCredential(),
    ),
    llm=smart_llm,
    examples=few_shots,
)
agent_executor = create_pbi_agent(
    llm=fast_llm,
    toolkit=toolkit,
    verbose=True,
)
```

```python
agent_executor.run("What was the maximum of value in revenue in dollars in 2022?")
```
