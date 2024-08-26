---
translated: true
---

# クイックスタート

NutritionAIがエージェントにスーパーフード・栄養パワーを与える方法を最もよく理解するために、Passio NutritionAIを使ってその情報を見つけられるエージェントを構築しましょう。

## ツールの定義

まず、[Passio NutritionAIツール](/docs/integrations/tools/passio_nutrition_ai)を作成する必要があります。

### [Passio Nutrition AI](/docs/integrations/tools/passio_nutrition_ai)

LangChainには、Passio NutritionAIを使って食品の栄養情報を見つけるための組み込みツールがあります。
APIキーが必要なことに注意してください - 無料のティアがあります。

APIキーを作成したら、次のように書き出す必要があります:

```bash
export NUTRITIONAI_SUBSCRIPTION_KEY="..."
```

... または、`dotenv`パッケージなどを使って、Python環境にキーを提供する別の方法を使うこともできます。コンストラクタ呼び出しを使って、明示的にキーを制御することもできます。

```python
from dotenv import load_dotenv
from langchain_core.utils import get_from_env

load_dotenv()

nutritionai_subscription_key = get_from_env(
    "nutritionai_subscription_key", "NUTRITIONAI_SUBSCRIPTION_KEY"
)
```

```python
from langchain_community.tools.passio_nutrition_ai import NutritionAI
from langchain_community.utilities.passio_nutrition_ai import NutritionAIAPI
```

```python
nutritionai_search = NutritionAI(api_wrapper=NutritionAIAPI())
```

```python
nutritionai_search.invoke("chicken tikka masala")
```

```python
nutritionai_search.invoke("Schnuck Markets sliced pepper jack cheese")
```

### ツール

ツールが用意できたので、これ以降で使用するツールのリストを作成できます。

```python
tools = [nutritionai_search]
```

## エージェントの作成

ツールが定義できたので、エージェントを作成できます。OpenAI Functions エージェントを使用します - このタイプのエージェントの詳細や、他のオプションについては、[このガイド](/docs/modules/agents/agent_types/)を参照してください。

まず、エージェントを指導するLLMを選択します。

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

次に、エージェントを指導するプロンプトを選択します。

```python
from langchain import hub

# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

次に、LLM、プロンプト、ツールを使ってエージェントを初期化します。エージェントは入力を受け取り、実行するアクションを決定する責任があります。重要なのは、エージェントはそれらのアクションを実行しないということです - それはAgentExecutor(次のステップ)が行います。これらのコンポーネントについての考え方の詳細は、[概念ガイド](/docs/modules/agents/concepts)を参照してください。

```python
from langchain.agents import create_openai_functions_agent

agent = create_openai_functions_agent(llm, tools, prompt)
```

最後に、エージェント(頭脳)とツールをAgentExecutor(エージェントを繰り返し呼び出し、ツールを実行する)に組み合わせます。これらのコンポーネントについての考え方の詳細は、[概念ガイド](/docs/modules/agents/concepts)を参照してください。

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## エージェントの実行

これで、いくつかのクエリでエージェントを実行できます! 今のところ、これらはすべて**ステートレス**なクエリ(前の対話を記憶しません)です。

```python
agent_executor.invoke({"input": "hi!"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello! How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'hi!', 'output': 'Hello! How can I assist you today?'}
```

```python
agent_executor.invoke({"input": "how many calories are in a slice pepperoni pizza?"})
```

これらのメッセージを自動的に追跡したい場合は、RunnableWithMessageHistoryでラップできます。この使い方の詳細は、[このガイド](/docs/expression_language/how_to/message_history)を参照してください。

```python
agent_executor.invoke(
    {"input": "I had bacon and eggs for breakfast.  How many calories is that?"}
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced pepper jack cheese for a snack.  How much protein did I have?"
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced colby cheese for a snack. Give me calories for this Schnuck Markets product."
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had chicken tikka masala for dinner.  how much calories, protein, and fat did I have with default quantity?"
    }
)
```

## 結論

以上です! このクイックスタートでは、食品栄養情報を回答に組み込めるシンプルなエージェントの作成方法を説明しました。エージェントは複雑なトピックで、学ぶことがたくさんあります!
