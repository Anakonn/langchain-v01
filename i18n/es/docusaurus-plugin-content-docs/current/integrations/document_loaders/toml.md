---
translated: true
---

# TOML

>[TOML](https://en.wikipedia.org/wiki/TOML) es un formato de archivo para archivos de configuración. Tiene la intención de ser fácil de leer y escribir, y está diseñado para asignar de manera inequívoca a un diccionario. Su especificación es de código abierto. `TOML` se implementa en muchos lenguajes de programación. El nombre `TOML` es un acrónimo de "Lenguaje Mínimo y Obvio de Tom" que se refiere a su creador, Tom Preston-Werner.

Si necesita cargar archivos `Toml`, use `TomlLoader`.

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
