---
translated: true
---

# Google Finance

このノートブックでは、Google Financeツールを使ってGoogle Financeページから情報を取得する方法について説明します。

SerpApiキーを取得するには、https://serpapi.com/users/sign_upにサインアップしてください。

次に、以下のコマンドでgoogle-search-resultsをインストールします:

pip install google-search-results

次に、環境変数SERPAPI_API_KEYにSerpApiキーを設定します。

または、wrapperに引数として秘密鍵を渡すこともできます: serp_api_key="your secret key"

ツールを使用する

```python
%pip install --upgrade --quiet  google-search-results
```

```python
import os

from langchain_community.tools.google_finance import GoogleFinanceQueryRun
from langchain_community.utilities.google_finance import GoogleFinanceAPIWrapper

os.environ["SERPAPI_API_KEY"] = ""
tool = GoogleFinanceQueryRun(api_wrapper=GoogleFinanceAPIWrapper())
```

```python
tool.run("Google")
```

Langchainを使って使用する

```python
import os

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

os.environ["OPENAI_API_KEY"] = ""
os.environ["SERP_API_KEY"] = ""
llm = OpenAI()
tools = load_tools(["google-scholar", "google-finance"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
agent.run("what is google's stock")
```
