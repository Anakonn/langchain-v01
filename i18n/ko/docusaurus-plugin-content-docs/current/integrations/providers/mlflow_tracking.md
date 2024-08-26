---
translated: true
---

# MLflow

>[MLflow](https://www.mlflow.org/docs/latest/what-is-mlflow)는 기계 학습 수명 주기 전반에 걸쳐 워크플로우와 아티팩트를 관리하는 다재다능하고 확장 가능한 오픈 소스 플랫폼입니다. 많은 인기 있는 ML 라이브러리와 통합되어 있지만 어떤 라이브러리, 알고리즘 또는 배포 도구와도 함께 사용할 수 있습니다. 확장 가능하도록 설계되어 있어 새로운 워크플로우, 라이브러리 및 도구를 지원하는 플러그인을 작성할 수 있습니다.

이 노트북에서는 LangChain 실험을 MLflow Server에 추적하는 방법을 살펴봅니다.

## 외부 예제

`MLflow`는 `LangChain` 통합을 위한 [여러 가지 예제](https://github.com/mlflow/mlflow/tree/master/examples/langchain)를 제공합니다:
- [simple_chain](https://github.com/mlflow/mlflow/blob/master/examples/langchain/simple_chain.py)
- [simple_agent](https://github.com/mlflow/mlflow/blob/master/examples/langchain/simple_agent.py)
- [retriever_chain](https://github.com/mlflow/mlflow/blob/master/examples/langchain/retriever_chain.py)
- [retrieval_qa_chain](https://github.com/mlflow/mlflow/blob/master/examples/langchain/retrieval_qa_chain.py)

## 예제

```python
%pip install --upgrade --quiet  azureml-mlflow
%pip install --upgrade --quiet  pandas
%pip install --upgrade --quiet  textstat
%pip install --upgrade --quiet  spacy
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
!python -m spacy download en_core_web_sm
```

```python
import os

os.environ["MLFLOW_TRACKING_URI"] = ""
os.environ["OPENAI_API_KEY"] = ""
os.environ["SERPAPI_API_KEY"] = ""
```

```python
from langchain.callbacks import MlflowCallbackHandler
from langchain_openai import OpenAI
```

```python
"""Main function.

This function is used to try the callback handler.
Scenarios:
1. OpenAI LLM
2. Chain with multiple SubChains on multiple generations
3. Agent with Tools
"""
mlflow_callback = MlflowCallbackHandler()
llm = OpenAI(
    model_name="gpt-3.5-turbo", temperature=0, callbacks=[mlflow_callback], verbose=True
)
```

```python
# SCENARIO 1 - LLM
llm_result = llm.generate(["Tell me a joke"])

mlflow_callback.flush_tracker(llm)
```

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
# SCENARIO 2 - Chain
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=[mlflow_callback])

test_prompts = [
    {
        "title": "documentary about good video games that push the boundary of game design"
    },
]
synopsis_chain.apply(test_prompts)
mlflow_callback.flush_tracker(synopsis_chain)
```

```python
from langchain.agents import AgentType, initialize_agent, load_tools
```

```python
# SCENARIO 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=[mlflow_callback])
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=[mlflow_callback],
    verbose=True,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
mlflow_callback.flush_tracker(agent, finish=True)
```
