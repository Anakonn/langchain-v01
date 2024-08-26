---
translated: true
---

# SageMaker Tracking

>[Amazon SageMaker](https://aws.amazon.com/sagemaker/)は、機械学習(ML)モデルを迅速かつ簡単に構築、トレーニング、デプロイするための完全に管理されたサービスです。

>[Amazon SageMaker Experiments](https://docs.aws.amazon.com/sagemaker/latest/dg/experiments.html)は、`Amazon SageMaker`の機能の1つで、MLの実験やモデルのバージョンを整理、追跡、比較、評価することができます。

このノートブックでは、LangChainコールバックを使ってプロンプトやその他のLLMハイパーパラメータをSageMaker Experimentsにログ記録およびトラッキングする方法を示します。ここでは、次のようなシナリオを使って機能を紹介します:

* **シナリオ1**: *単一のLLM* - 単一のLLMモデルを使ってプロンプトに基づいて出力を生成する場合。
* **シナリオ2**: *順次チェーン* - 2つのLLMモデルを順次使う場合。
* **シナリオ3**: *ツールを使ったエージェント(思考連鎖)* - LLMに加えて検索とmath のツールを使う場合。

このノートブックでは、各シナリオのプロンプトをログ記録するための単一の実験を作成します。

## インストールとセットアップ

```python
%pip install --upgrade --quiet  sagemaker
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```

まず、必要なAPIキーを設定します

* OpenAI: https://platform.openai.com/account/api-keys (OpenAI LLMモデル用)
* Google SERP API: https://serpapi.com/manage-api-key (Google検索ツール用)

```python
import os

## Add your API keys below
os.environ["OPENAI_API_KEY"] = "<ADD-KEY-HERE>"
os.environ["SERPAPI_API_KEY"] = "<ADD-KEY-HERE>"
```

```python
from langchain_community.callbacks.sagemaker_callback import SageMakerCallbackHandler
```

```python
from langchain.agents import initialize_agent, load_tools
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from sagemaker.analytics import ExperimentAnalytics
from sagemaker.experiments.run import Run
from sagemaker.session import Session
```

## LLMプロンプトのトラッキング

```python
# LLM Hyperparameters
HPARAMS = {
    "temperature": 0.1,
    "model_name": "gpt-3.5-turbo-instruct",
}

# Bucket used to save prompt logs (Use `None` is used to save the default bucket or otherwise change it)
BUCKET_NAME = None

# Experiment name
EXPERIMENT_NAME = "langchain-sagemaker-tracker"

# Create SageMaker Session with the given bucket
session = Session(default_bucket=BUCKET_NAME)
```

### シナリオ1 - LLM

```python
RUN_NAME = "run-scenario-1"
PROMPT_TEMPLATE = "tell me a joke about {topic}"
INPUT_VARIABLES = {"topic": "fish"}
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Create prompt template
    prompt = PromptTemplate.from_template(template=PROMPT_TEMPLATE)

    # Create LLM Chain
    chain = LLMChain(llm=llm, prompt=prompt, callbacks=[sagemaker_callback])

    # Run chain
    chain.run(**INPUT_VARIABLES)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

### シナリオ2 - 順次チェーン

```python
RUN_NAME = "run-scenario-2"

PROMPT_TEMPLATE_1 = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
PROMPT_TEMPLATE_2 = """You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.
Play Synopsis: {synopsis}
Review from a New York Times play critic of the above play:"""

INPUT_VARIABLES = {
    "input": "documentary about good video games that push the boundary of game design"
}
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Create prompt templates for the chain
    prompt_template1 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_1)
    prompt_template2 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_2)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Create chain1
    chain1 = LLMChain(llm=llm, prompt=prompt_template1, callbacks=[sagemaker_callback])

    # Create chain2
    chain2 = LLMChain(llm=llm, prompt=prompt_template2, callbacks=[sagemaker_callback])

    # Create Sequential chain
    overall_chain = SimpleSequentialChain(
        chains=[chain1, chain2], callbacks=[sagemaker_callback]
    )

    # Run overall sequential chain
    overall_chain.run(**INPUT_VARIABLES)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

### シナリオ3 - ツールを使ったエージェント

```python
RUN_NAME = "run-scenario-3"
PROMPT_TEMPLATE = "Who is the oldest person alive? And what is their current age raised to the power of 1.51?"
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Define tools
    tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=[sagemaker_callback])

    # Initialize agent with all the tools
    agent = initialize_agent(
        tools, llm, agent="zero-shot-react-description", callbacks=[sagemaker_callback]
    )

    # Run agent
    agent.run(input=PROMPT_TEMPLATE)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

## ログデータの読み込み

プロンプトがログ記録されたら、以下のようにPandasデータフレームに簡単に読み込むことができます。

```python
# Load
logs = ExperimentAnalytics(experiment_name=EXPERIMENT_NAME)

# Convert as pandas dataframe
df = logs.dataframe(force_refresh=True)

print(df.shape)
df.head()
```

上記のように、実験には3つのラン(行)があり、それぞれのシナリオに対応しています。各ランでは、プロンプトとLLMの設定/ハイパーパラメータがjsonとして保存されています。各jsonパスからログデータを読み込んで探索することができます。
