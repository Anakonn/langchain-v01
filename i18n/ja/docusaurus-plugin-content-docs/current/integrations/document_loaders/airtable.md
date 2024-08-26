---
translated: true
---

# Airtable

```python
%pip install --upgrade --quiet  pyairtable
```

```python
from langchain_community.document_loaders import AirtableLoader
```

* API キーを[ここ](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens)で取得してください。
* ベースのIDを[ここ](https://airtable.com/developers/web/api/introduction)で取得してください。
* テーブルのURLから表示されているIDを[ここ](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl)から取得してください。

```python
api_key = "xxx"
base_id = "xxx"
table_id = "xxx"
```

```python
loader = AirtableLoader(api_key, table_id, base_id)
docs = loader.load()
```

各テーブルの行を `dict` として返します。

```python
len(docs)
```

```output
3
```

```python
eval(docs[0].page_content)
```

```output
{'id': 'recF3GbGZCuh9sXIQ',
 'createdTime': '2023-06-09T04:47:21.000Z',
 'fields': {'Priority': 'High',
  'Status': 'In progress',
  'Name': 'Document Splitters'}}
```
