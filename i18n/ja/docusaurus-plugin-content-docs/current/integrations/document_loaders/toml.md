---
translated: true
---

# TOML

>[TOML](https://en.wikipedia.org/wiki/TOML)は設定ファイルのためのファイル形式です。読み書きが簡単で、辞書に明確にマッピングされるように設計されています。その仕様はオープンソースです。`TOML`は多くのプログラミング言語で実装されています。`TOML`という名称は、その作成者であるTom Preston-Wernerを指す"Tom's Obvious, Minimal Language"の頭文字を取ったものです。

`Toml`ファイルを読み込む必要がある場合は、`TomlLoader`を使用してください。

```python
from langchain_community.document_loaders import TomlLoader
```

```python
loader = TomlLoader("example_data/fake_rule.toml")
```

```python
rule = loader.load()
```

```python
rule
```

```output
[Document(page_content='{"internal": {"creation_date": "2023-05-01", "updated_date": "2022-05-01", "release": ["release_type"], "min_endpoint_version": "some_semantic_version", "os_list": ["operating_system_list"]}, "rule": {"uuid": "some_uuid", "name": "Fake Rule Name", "description": "Fake description of rule", "query": "process where process.name : \\"somequery\\"\\n", "threat": [{"framework": "MITRE ATT&CK", "tactic": {"name": "Execution", "id": "TA0002", "reference": "https://attack.mitre.org/tactics/TA0002/"}}]}}', metadata={'source': 'example_data/fake_rule.toml'})]
```
