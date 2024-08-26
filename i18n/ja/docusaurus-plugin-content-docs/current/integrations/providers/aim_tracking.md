---
translated: true
---

# 目的

Aimは、LangChain実行の可視化とデバッグを非常に簡単にします。Aimは、LLMとツールの入出力、およびエージェントのアクションを追跡します。

Aimを使うと、個々の実行を簡単にデバッグして調べることができます:

![](https://user-images.githubusercontent.com/13848158/227784778-06b806c7-74a1-4d15-ab85-9ece09b458aa.png)

さらに、複数の実行を並べて比較することもできます:

![](https://user-images.githubusercontent.com/13848158/227784994-699b24b7-e69b-48f9-9ffa-e6a6142fd719.png)

Aimはオープンソースで、GitHubで[詳細を確認](https://github.com/aimhubio/aim)できます。

次に、Aimコールバックの有効化と設定について見ていきましょう。

<h3>LangChainの実行をAimで追跡する</h3>

このノートブックでは3つの使用シナリオを探ります。まず、必要なパッケージをインストールし、特定のモジュールをインポートします。次に、Pythonスクリプト内またはターミナルを通じて設定できる2つの環境変数を設定します。

```python
%pip install --upgrade --quiet  aim
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```

```python
import os
from datetime import datetime

from langchain.callbacks import AimCallbackHandler, StdOutCallbackHandler
from langchain_openai import OpenAI
```

我々の例ではGPTモデルをLLMとして使用しており、OpenAIがこの目的のためのAPIを提供しています。APIキーは次のリンクから取得できます: https://platform.openai.com/account/api-keys 。

SerpAPIを使ってGoogleの検索結果を取得します。SerpAPIキーは https://serpapi.com/manage-api-key から取得してください。

```python
os.environ["OPENAI_API_KEY"] = "..."
os.environ["SERPAPI_API_KEY"] = "..."
```

`AimCallbackHandler`のイベントメソッドは、LangChainモジュールまたはエージェントを入力として受け取り、少なくともプロンプトと生成された結果、およびLangChainモジュールのシリアル化されたバージョンをデザインされたAimランに記録します。

```python
session_group = datetime.now().strftime("%m.%d.%Y_%H.%M.%S")
aim_callback = AimCallbackHandler(
    repo=".",
    experiment_name="scenario 1: OpenAI LLM",
)

callbacks = [StdOutCallbackHandler(), aim_callback]
llm = OpenAI(temperature=0, callbacks=callbacks)
```

`flush_tracker`関数は、LangChainアセットをAimに記録するために使用されます。デフォルトでは、セッションはそのまま終了するのではなく、リセットされます。

<h3>シナリオ1</h3> 最初のシナリオでは、OpenAI LLMを使用します。

```python
# scenario 1 - LLM
llm_result = llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
aim_callback.flush_tracker(
    langchain_asset=llm,
    experiment_name="scenario 2: Chain with multiple SubChains on multiple generations",
)
```

<h3>シナリオ2</h3> 2つ目のシナリオでは、複数世代にわたる複数のSubChainのチェーンを扱います。

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
# scenario 2 - Chain
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [
    {
        "title": "documentary about good video games that push the boundary of game design"
    },
    {"title": "the phenomenon behind the remarkable speed of cheetahs"},
    {"title": "the best in class mlops tooling"},
]
synopsis_chain.apply(test_prompts)
aim_callback.flush_tracker(
    langchain_asset=synopsis_chain, experiment_name="scenario 3: Agent with Tools"
)
```

<h3>シナリオ3</h3> 3つ目のシナリオでは、ツールを持つエージェントを扱います。

```python
from langchain.agents import AgentType, initialize_agent, load_tools
```

```python
# scenario 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=callbacks,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
aim_callback.flush_tracker(langchain_asset=agent, reset=False, finish=True)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out who Leo DiCaprio's girlfriend is and then calculate her age raised to the 0.43 power.
Action: Search
Action Input: "Leo DiCaprio girlfriend"[0m
Observation: [36;1m[1;3mLeonardo DiCaprio seemed to prove a long-held theory about his love life right after splitting from girlfriend Camila Morrone just months ...[0m
Thought:[32;1m[1;3m I need to find out Camila Morrone's age
Action: Search
Action Input: "Camila Morrone age"[0m
Observation: [36;1m[1;3m25 years[0m
Thought:[32;1m[1;3m I need to calculate 25 raised to the 0.43 power
Action: Calculator
Action Input: 25^0.43[0m
Observation: [33;1m[1;3mAnswer: 3.991298452658078
[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: Camila Morrone is Leo DiCaprio's girlfriend and her current age raised to the 0.43 power is 3.991298452658078.[0m

[1m> Finished chain.[0m
```
