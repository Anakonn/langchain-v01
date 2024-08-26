---
translated: true
---

# 가중치 및 편향

이 노트북은 LangChain 실험을 중앙 집중식 Weights and Biases 대시보드에 추적하는 방법을 설명합니다. 프롬프트 엔지니어링과 콜백에 대해 자세히 알아보려면 이 보고서를 참조하십시오. 여기에는 프롬프트 엔지니어링과 함께 예상되는 대시보드도 설명되어 있습니다.

<a href="https://colab.research.google.com/drive/1DXH4beT4HFaRKy_Vm4PoxhXVDRf7Ym8L?usp=sharing" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

[보고서 보기](https://wandb.ai/a-sh0ts/langchain_callback_demo/reports/Prompt-Engineering-LLMs-with-LangChain-and-W-B--VmlldzozNjk1NTUw#👋-how-to-build-a-callback-in-langchain-for-better-prompt-engineering)

**참고**: _`WandbCallbackHandler`는 `WandbTracer`로 대체되고 있습니다._ 향후에는 더 유연하고 세부적인 로깅이 가능한 `WandbTracer`를 사용하십시오. `WandbTracer`에 대해 자세히 알아보려면 [agent_with_wandb_tracing](/docs/integrations/providers/wandb_tracing) 노트북을 참조하거나 다음 [colab 노트북](http://wandb.me/prompts-quickstart)을 사용하십시오. Weights & Biases Prompts에 대해 자세히 알아보려면 다음 [prompts 문서](https://docs.wandb.ai/guides/prompts)를 참조하십시오.

```python
%pip install --upgrade --quiet  wandb
%pip install --upgrade --quiet  pandas
%pip install --upgrade --quiet  textstat
%pip install --upgrade --quiet  spacy
!python -m spacy download en_core_web_sm
```

```python
import os

os.environ["WANDB_API_KEY"] = ""
# os.environ["OPENAI_API_KEY"] = ""
# os.environ["SERPAPI_API_KEY"] = ""
```

```python
from datetime import datetime

from langchain.callbacks import StdOutCallbackHandler, WandbCallbackHandler
from langchain_openai import OpenAI
```

```output
Callback Handler that logs to Weights and Biases.

Parameters:
    job_type (str): The type of job.
    project (str): The project to log to.
    entity (str): The entity to log to.
    tags (list): The tags to log.
    group (str): The group to log to.
    name (str): The name of the run.
    notes (str): The notes to log.
    visualize (bool): Whether to visualize the run.
    complexity_metrics (bool): Whether to log complexity metrics.
    stream_logs (bool): Whether to stream callback actions to W&B
```

```output
Default values for WandbCallbackHandler(...)

visualize: bool = False,
complexity_metrics: bool = False,
stream_logs: bool = False,
```

참고: 베타 워크플로우의 경우 기본 분석은 textstat을 기반으로 하고 시각화는 spacy를 기반으로 합니다.

```python
"""Main function.

This function is used to try the callback handler.
Scenarios:
1. OpenAI LLM
2. Chain with multiple SubChains on multiple generations
3. Agent with Tools
"""
session_group = datetime.now().strftime("%m.%d.%Y_%H.%M.%S")
wandb_callback = WandbCallbackHandler(
    job_type="inference",
    project="langchain_callback_demo",
    group=f"minimal_{session_group}",
    name="llm",
    tags=["test"],
)
callbacks = [StdOutCallbackHandler(), wandb_callback]
llm = OpenAI(temperature=0, callbacks=callbacks)
```

```output
[34m[1mwandb[0m: Currently logged in as: [33mharrison-chase[0m. Use [1m`wandb login --relogin`[0m to force relogin
```

```html
Tracking run with wandb version 0.14.0
```

```html
Run data is saved locally in <code>/Users/harrisonchase/workplace/langchain/docs/ecosystem/wandb/run-20230318_150408-e47j1914</code>
```

```html
Syncing run <strong><a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914' target="_blank">llm</a></strong> to <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">Weights & Biases</a> (<a href='https://wandb.me/run' target="_blank">docs</a>)<br/>
```

```html
View project at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo</a>
```

```html
View run at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914</a>
```

```output
[34m[1mwandb[0m: [33mWARNING[0m The wandb callback is currently in beta and is subject to change based on updates to `langchain`. Please report any issues to https://github.com/wandb/wandb/issues with the tag `langchain`.
```

```python
# Defaults for WandbCallbackHandler.flush_tracker(...)

reset: bool = True,
finish: bool = False,
```

`flush_tracker` 함수는 LangChain 세션을 Weights & Biases에 기록하는 데 사용됩니다. LangChain 모듈 또는 에이전트를 입력으로 받아 최소한 프롬프트와 생성물, 그리고 LangChain 모듈의 직렬화된 형태를 지정된 Weights & Biases 프로젝트에 기록합니다. 기본적으로 세션을 종료하는 대신 재설정합니다.

```python
# SCENARIO 1 - LLM
llm_result = llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
wandb_callback.flush_tracker(llm, name="simple_sequential")
```

```html
Waiting for W&B process to finish... <strong style="color:green">(success).</strong>
```

```html
View run <strong style="color:#cdcd00">llm</strong> at: <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914</a><br/>Synced 5 W&B file(s), 2 media file(s), 5 artifact file(s) and 0 other file(s)
```

```html
Find logs at: <code>./wandb/run-20230318_150408-e47j1914/logs</code>
```

```output
VBox(children=(Label(value='Waiting for wandb.init()...\r'), FloatProgress(value=0.016745895149999985, max=1.0…
```

```html
Tracking run with wandb version 0.14.0
```

```html
Run data is saved locally in <code>/Users/harrisonchase/workplace/langchain/docs/ecosystem/wandb/run-20230318_150534-jyxma7hu</code>
```

```html
Syncing run <strong><a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu' target="_blank">simple_sequential</a></strong> to <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">Weights & Biases</a> (<a href='https://wandb.me/run' target="_blank">docs</a>)<br/>
```

```html
View project at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo</a>
```

```html
View run at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu</a>
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
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [
    {
        "title": "documentary about good video games that push the boundary of game design"
    },
    {"title": "cocaine bear vs heroin wolf"},
    {"title": "the best in class mlops tooling"},
]
synopsis_chain.apply(test_prompts)
wandb_callback.flush_tracker(synopsis_chain, name="agent")
```

```html
Waiting for W&B process to finish... <strong style="color:green">(success).</strong>
```

```html
View run <strong style="color:#cdcd00">simple_sequential</strong> at: <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu</a><br/>Synced 4 W&B file(s), 2 media file(s), 6 artifact file(s) and 0 other file(s)
```

```html
Find logs at: <code>./wandb/run-20230318_150534-jyxma7hu/logs</code>
```

```output
VBox(children=(Label(value='Waiting for wandb.init()...\r'), FloatProgress(value=0.016736786816666675, max=1.0…
```

```html
Tracking run with wandb version 0.14.0
```

```html
Run data is saved locally in <code>/Users/harrisonchase/workplace/langchain/docs/ecosystem/wandb/run-20230318_150550-wzy59zjq</code>
```

```html
Syncing run <strong><a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq' target="_blank">agent</a></strong> to <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">Weights & Biases</a> (<a href='https://wandb.me/run' target="_blank">docs</a>)<br/>
```

```html
View project at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo</a>
```

```html
View run at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq</a>
```

```python
from langchain.agents import AgentType, initialize_agent, load_tools
```

```python
# SCENARIO 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
    callbacks=callbacks,
)
wandb_callback.flush_tracker(agent, reset=False, finish=True)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out who Leo DiCaprio's girlfriend is and then calculate her age raised to the 0.43 power.
Action: Search
Action Input: "Leo DiCaprio girlfriend"[0m
Observation: [36;1m[1;3mDiCaprio had a steady girlfriend in Camila Morrone. He had been with the model turned actress for nearly five years, as they were first said to be dating at the end of 2017. And the now 26-year-old Morrone is no stranger to Hollywood.[0m
Thought:[32;1m[1;3m I need to calculate her age raised to the 0.43 power.
Action: Calculator
Action Input: 26^0.43[0m
Observation: [33;1m[1;3mAnswer: 4.059182145592686
[0m
Thought:[32;1m[1;3m I now know the final answer.
Final Answer: Leo DiCaprio's girlfriend is Camila Morrone and her current age raised to the 0.43 power is 4.059182145592686.[0m

[1m> Finished chain.[0m
```

```html
Waiting for W&B process to finish... <strong style="color:green">(success).</strong>
```

```html
View run <strong style="color:#cdcd00">agent</strong> at: <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq</a><br/>Synced 5 W&B file(s), 2 media file(s), 7 artifact file(s) and 0 other file(s)
```

```html
Find logs at: <code>./wandb/run-20230318_150550-wzy59zjq/logs</code>
```
