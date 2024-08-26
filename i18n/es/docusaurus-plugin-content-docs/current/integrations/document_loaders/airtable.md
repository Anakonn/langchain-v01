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

* Obtén tu clave API [aquí](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens).
* Obtén el ID de tu base [aquí](https://airtable.com/developers/web/api/introduction).
* Obtén el ID de tu tabla de la URL de la tabla como se muestra [aquí](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl).

```python
api_key = "xxx"
base_id = "xxx"
table_id = "xxx"
```

```python
loader = AirtableLoader(api_key, table_id, base_id)
docs = loader.load()
```

Devuelve cada fila de la tabla como `dict`.

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
