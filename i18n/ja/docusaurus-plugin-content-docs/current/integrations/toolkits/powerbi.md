---
translated: true
---

# Power BI データセット

このノートブックでは、`Power BI データセット`と対話するエージェントを紹介します。エージェントはデータセットに関する一般的な質問に答えたり、エラーから回復したりします。

このエージェントは現在開発中であるため、すべての回答が正しいとは限りません。[executequery endpoint](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries)に対して実行されるため、削除は許可されていません。

### 注意事項:

- `azure.identity`パッケージを使用した認証に依存しています。これは`pip install azure-identity`でインストールできます。または、トークンを文字列として渡してデータセットを作成することもできます。
- ユーザー名を指定して、RLSが有効なデータセットで使用することもできます。
- このツールキットは、質問からクエリを作成するためにLLMを使用し、エージェントはLLMを使用して全体的な実行を行います。
- テストは主に`gpt-3.5-turbo-instruct`モデルで行われ、codexモデルの性能は良くありませんでした。

## 初期化

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

## 例: テーブルの説明

```python
agent_executor.run("Describe table1")
```

## 例: テーブルに対する単純なクエリ

この例では、エージェントが正しいクエリを見つけ出し、テーブルの行数を取得しています。

```python
agent_executor.run("How many records are in table1?")
```

## 例: クエリの実行

```python
agent_executor.run("How many records are there by dimension1 in table2?")
```

```python
agent_executor.run("What unique values are there for dimensions2 in table2")
```

## 例: 独自のフューショットプロンプトの追加

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
