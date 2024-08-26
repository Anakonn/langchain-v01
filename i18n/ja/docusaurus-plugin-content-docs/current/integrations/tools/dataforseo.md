---
translated: true
---

# DataForSEO

>[DataForSeo](https://dataforseo.com/)は、APIを通じて包括的なSEOおよびデジタルマーケティングデータソリューションを提供しています。
>
>`DataForSeo API`は、`Google`、`Bing`、`Yahoo`などの人気検索エンジンから`SERP`を取得します。また、`Maps`、`News`、`Events`などの様々な検索エンジンタイプからSERPを取得することもできます。

このノートブックでは、[DataForSeo API](https://dataforseo.com/apis)を使ってサーチエンジン結果を取得する方法を示します。

```python
from langchain_community.utilities.dataforseo_api_search import DataForSeoAPIWrapper
```

## APIの資格情報の設定

`DataForSeo`のウェブサイトに登録することで、APIの資格情報を取得できます。

```python
import os

os.environ["DATAFORSEO_LOGIN"] = "your_api_access_username"
os.environ["DATAFORSEO_PASSWORD"] = "your_api_access_password"

wrapper = DataForSeoAPIWrapper()
```

`run`メソッドは、answer_box、knowledge_graph、featured_snippet、shopping、organicの中から、最優先順位の高い要素から最初の結果スニペットを返します。

```python
wrapper.run("Weather in Los Angeles")
```

## `run`と`results`の違い

`run`メソッドと`results`メソッドは、`DataForSeoAPIWrapper`クラスによって提供されています。

`run`メソッドは検索を実行し、answer box、knowledge graph、featured snippet、shopping、organic結果の中から最初の結果スニペットを返します。これらの要素は優先順位が高い順にソートされています。

`results`メソッドは、ラッパーに設定されたパラメータに従ってJSONレスポンスを返します。これにより、APIから返されるデータをより柔軟に指定できます。

## JSONとしての結果の取得

返されるデータのタイプやフィールドをカスタマイズできます。また、返される上位結果の最大件数も設定できます。

```python
json_wrapper = DataForSeoAPIWrapper(
    json_result_types=["organic", "knowledge_graph", "answer_box"],
    json_result_fields=["type", "title", "description", "text"],
    top_count=3,
)
```

```python
json_wrapper.results("Bill Gates")
```

## 位置情報と言語のカスタマイズ

追加のパラメータを渡すことで、検索結果の位置情報と言語を指定できます。

```python
customized_wrapper = DataForSeoAPIWrapper(
    top_count=10,
    json_result_types=["organic", "local_pack"],
    json_result_fields=["title", "description", "type"],
    params={"location_name": "Germany", "language_code": "en"},
)
customized_wrapper.results("coffee near me")
```

## 検索エンジンのカスタマイズ

使用する検索エンジンも指定できます。

```python
customized_wrapper = DataForSeoAPIWrapper(
    top_count=10,
    json_result_types=["organic", "local_pack"],
    json_result_fields=["title", "description", "type"],
    params={"location_name": "Germany", "language_code": "en", "se_name": "bing"},
)
customized_wrapper.results("coffee near me")
```

## 検索タイプのカスタマイズ

APIラッパーでは、検索タイプも指定できます。例えば、地図検索を行うことができます。

```python
maps_search = DataForSeoAPIWrapper(
    top_count=10,
    json_result_fields=["title", "value", "address", "rating", "type"],
    params={
        "location_coordinate": "52.512,13.36,12z",
        "language_code": "en",
        "se_type": "maps",
    },
)
maps_search.results("coffee near me")
```

## Langchain Agentsとの統合

`langchain.agents`モジュールの`Tool`クラスを使うことで、`DataForSeoAPIWrapper`をLangchainエージェントと統合できます。`Tool`クラスはエージェントが呼び出せる関数をカプセル化しています。

```python
from langchain.agents import Tool

search = DataForSeoAPIWrapper(
    top_count=3,
    json_result_types=["organic"],
    json_result_fields=["title", "description", "type"],
)
tool = Tool(
    name="google-search-answer",
    description="My new answer tool",
    func=search.run,
)
json_tool = Tool(
    name="google-search-json",
    description="My new json tool",
    func=search.results,
)
```
