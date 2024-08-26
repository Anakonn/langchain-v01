---
sidebar_label: Kinetica
translated: true
---

# Kinetica SqlAssist LLMデモ

このノートブックでは、Kinecticaを使用して自然言語をSQLに変換し、データ取得プロセスを簡素化する方法を示します。このデモの目的は、LLMの機能ではなく、チェーンの作成と使用のメカニズムを示すことです。

## 概要

KinecticaのLLMワークフローでは、テーブル、アノテーション、ルール、サンプルなどの推論に必要な情報を含むLLMコンテキストをデータベースに作成します。 ``ChatKinetica.load_messages_from_context()``を呼び出すと、このコンテキスト情報がデータベースから取得され、チャットプロンプトの作成に使用されます。

チャットプロンプトは、``SystemMessage``と、質問/SQLのペアであるサンプルを含む``HumanMessage``/``AIMessage``のペアで構成されます。このリストにサンプルのペアを追加することはできますが、通常の自然言語会話を行うことを目的としたものではありません。

チャットプロンプトからチェーンを作成して実行すると、KinecticaのLLMが入力からSQLを生成します。オプションで``KineticaSqlOutputParser``を使用して、SQLを実行し、結果をデータフレームとして返すこともできます。

現在、SQL生成に2つのLLMがサポートされています:

1. **Kinetica SQL-GPT**: このLLMはOpenAI ChatGPT APIに基づいています。
2. **Kinetica SqlAssist**: このLLMはKinecticaデータベースと統合するように特別に設計されており、セキュアなカスタマープレミスで実行できます。

このデモでは**SqlAssist**を使用します。詳細は[Kinecticaドキュメントサイト](https://docs.kinetica.com/7.1/sql-gpt/concepts/)を参照してください。

## 前提条件

始めるには、Kinecticaデータベースインスタンスが必要です。持っていない場合は、[無料の開発インスタンス](https://cloud.kinetica.com/trynow)を取得できます。

以下のパッケージをインストールする必要があります。

```python
# Install Langchain community and core packages
%pip install --upgrade --quiet langchain-core langchain-community

# Install Kineitca DB connection package
%pip install --upgrade --quiet gpudb typeguard

# Install packages needed for this tutorial
%pip install --upgrade --quiet faker
```

```output
Note: you may need to restart the kernel to use updated packages.
Note: you may need to restart the kernel to use updated packages.
```

## データベース接続

以下の環境変数にデータベース接続を設定する必要があります。仮想環境を使用している場合は、プロジェクトの`.env`ファイルに設定できます:
* `KINETICA_URL`: データベース接続URL
* `KINETICA_USER`: データベースユーザー
* `KINETICA_PASSWD`: セキュアなパスワード

`KineticaChatLLM`のインスタンスを作成できれば、接続は成功しています。

```python
from langchain_community.chat_models.kinetica import ChatKinetica

kinetica_llm = ChatKinetica()

# Test table we will create
table_name = "demo.user_profiles"

# LLM Context we will create
kinetica_ctx = "demo.test_llm_ctx"
```

## テストデータの作成

SQLを生成するには、Kinecticaテーブルとインファレンスに使用できるLLMコンテキストを作成する必要があります。

### 架空のユーザープロファイルを作成する

`faker`パッケージを使用して、100件の架空のプロファイルを含むデータフレームを作成します。

```python
from typing import Generator

import pandas as pd
from faker import Faker

Faker.seed(5467)
faker = Faker(locale="en-US")


def profile_gen(count: int) -> Generator:
    for id in range(0, count):
        rec = dict(id=id, **faker.simple_profile())
        rec["birthdate"] = pd.Timestamp(rec["birthdate"])
        yield rec


load_df = pd.DataFrame.from_records(data=profile_gen(100), index="id")
load_df.head()
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>username</th>
      <th>name</th>
      <th>sex</th>
      <th>address</th>
      <th>mail</th>
      <th>birthdate</th>
    </tr>
    <tr>
      <th>id</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>eduardo69</td>
      <td>Haley Beck</td>
      <td>F</td>
      <td>59836 Carla Causeway Suite 939\nPort Eugene, I...</td>
      <td>meltondenise@yahoo.com</td>
      <td>1997-11-23</td>
    </tr>
    <tr>
      <th>1</th>
      <td>lbarrera</td>
      <td>Joshua Stephens</td>
      <td>M</td>
      <td>3108 Christina Forges\nPort Timothychester, KY...</td>
      <td>erica80@hotmail.com</td>
      <td>1924-07-19</td>
    </tr>
    <tr>
      <th>2</th>
      <td>bburton</td>
      <td>Paula Kaiser</td>
      <td>F</td>
      <td>Unit 7405 Box 3052\nDPO AE 09858</td>
      <td>timothypotts@gmail.com</td>
      <td>1933-11-20</td>
    </tr>
    <tr>
      <th>3</th>
      <td>melissa49</td>
      <td>Wendy Reese</td>
      <td>F</td>
      <td>6408 Christopher Hill Apt. 459\nNew Benjamin, ...</td>
      <td>dadams@gmail.com</td>
      <td>1988-10-11</td>
    </tr>
    <tr>
      <th>4</th>
      <td>melissacarter</td>
      <td>Manuel Rios</td>
      <td>M</td>
      <td>2241 Bell Gardens Suite 723\nScottside, CA 38463</td>
      <td>williamayala@gmail.com</td>
      <td>1931-03-04</td>
    </tr>
  </tbody>
</table>
</div>
```

### データフレームからKinecticaテーブルを作成する

```python
from gpudb import GPUdbTable

gpudb_table = GPUdbTable.from_df(
    load_df,
    db=kinetica_llm.kdbc,
    table_name=table_name,
    clear_table=True,
    load_data=True,
)

# See the Kinetica column types
gpudb_table.type_as_df()
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>type</th>
      <th>properties</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>username</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>1</th>
      <td>name</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>2</th>
      <td>sex</td>
      <td>string</td>
      <td>[char1]</td>
    </tr>
    <tr>
      <th>3</th>
      <td>address</td>
      <td>string</td>
      <td>[char64]</td>
    </tr>
    <tr>
      <th>4</th>
      <td>mail</td>
      <td>string</td>
      <td>[char32]</td>
    </tr>
    <tr>
      <th>5</th>
      <td>birthdate</td>
      <td>long</td>
      <td>[timestamp]</td>
    </tr>
  </tbody>
</table>
</div>
```

### LLMコンテキストを作成する

KinecticaワークベンチUIを使ってLLMコンテキストを作成するか、`CREATE OR REPLACE CONTEXT`構文を使って手動で作成できます。

ここでは、作成したテーブルを参照するSQLの構文からコンテキストを作成します。

```python
# create an LLM context for the table.

from gpudb import GPUdbException

sql = f"""
CREATE OR REPLACE CONTEXT {kinetica_ctx}
(
    TABLE = demo.test_profiles
    COMMENT = 'Contains user profiles.'
),
(
    SAMPLES = (
    'How many male users are there?' =
    'select count(1) as num_users
    from demo.test_profiles
    where sex = ''M'';')
)
"""


def _check_error(response: dict) -> None:
    status = response["status_info"]["status"]
    if status != "OK":
        message = response["status_info"]["message"]
        raise GPUdbException("[%s]: %s" % (status, message))


response = kinetica_llm.kdbc.execute_sql(sql)
_check_error(response)
response["status_info"]
```

```output
{'status': 'OK',
 'message': '',
 'data_type': 'execute_sql_response',
 'response_time': 0.0148}
```

## Langchainを使用したインファレンス

以下の例では、前に作成したテーブルとLLMコンテキストからチェーンを作成します。このチェーンはSQLを生成し、結果のデータをデータフレームとして返します。

### Kinecticaデータベースからチャットプロンプトを読み込む

`load_messages_from_context()`関数は、データベースからコンテキストを取得し、``ChatPromptTemplate``の作成に使用するチャットメッセージのリストに変換します。

```python
from langchain_core.prompts import ChatPromptTemplate

# load the context from the database
ctx_messages = kinetica_llm.load_messages_from_context(kinetica_ctx)

# Add the input prompt. This is where input question will be substituted.
ctx_messages.append(("human", "{input}"))

# Create the prompt template.
prompt_template = ChatPromptTemplate.from_messages(ctx_messages)
prompt_template.pretty_print()
```

```output
================================[1m System Message [0m================================

CREATE TABLE demo.test_profiles AS
(
   username VARCHAR (32) NOT NULL,
   name VARCHAR (32) NOT NULL,
   sex VARCHAR (1) NOT NULL,
   address VARCHAR (64) NOT NULL,
   mail VARCHAR (32) NOT NULL,
   birthdate TIMESTAMP NOT NULL
);
COMMENT ON TABLE demo.test_profiles IS 'Contains user profiles.';

================================[1m Human Message [0m=================================

How many male users are there?

==================================[1m Ai Message [0m==================================

select count(1) as num_users
    from demo.test_profiles
    where sex = 'M';

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```

### チェーンを作成する

このチェーンの最後の要素は、SQLを実行してデータフレームを返す`KineticaSqlOutputParser`です。これはオプションで、含めなければSQLのみが返されます。

```python
from langchain_community.chat_models.kinetica import (
    KineticaSqlOutputParser,
    KineticaSqlResponse,
)

chain = prompt_template | kinetica_llm | KineticaSqlOutputParser(kdbc=kinetica_llm.kdbc)
```

### SQLを生成する

作成したチェーンは、質問を入力として受け取り、生成されたSQLとデータを含む``KineticaSqlResponse``を返します。質問は、使用したLLMコンテキストに関連している必要があります。

```python
# Here you must ask a question relevant to the LLM context provided in the prompt template.
response: KineticaSqlResponse = chain.invoke(
    {"input": "What are the female users ordered by username?"}
)

print(f"SQL: {response.sql}")
response.dataframe.head()
```

```output
SQL: SELECT username, name
    FROM demo.test_profiles
    WHERE sex = 'F'
    ORDER BY username;
```

```html
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>username</th>
      <th>name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>alexander40</td>
      <td>Tina Ramirez</td>
    </tr>
    <tr>
      <th>1</th>
      <td>bburton</td>
      <td>Paula Kaiser</td>
    </tr>
    <tr>
      <th>2</th>
      <td>brian12</td>
      <td>Stefanie Williams</td>
    </tr>
    <tr>
      <th>3</th>
      <td>brownanna</td>
      <td>Jennifer Rowe</td>
    </tr>
    <tr>
      <th>4</th>
      <td>carl19</td>
      <td>Amanda Potts</td>
    </tr>
  </tbody>
</table>
</div>
```
