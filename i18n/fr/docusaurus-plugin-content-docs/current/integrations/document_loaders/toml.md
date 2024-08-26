---
translated: true
---

# TOML

>[TOML](https://en.wikipedia.org/wiki/TOML) est un format de fichier pour les fichiers de configuration. Il est destiné à être facile à lire et à écrire, et est conçu pour se mapper de manière non ambiguë à un dictionnaire. Sa spécification est open-source. `TOML` est implémenté dans de nombreux langages de programmation. Le nom `TOML` est un acronyme de "Tom's Obvious, Minimal Language" en référence à son créateur, Tom Preston-Werner.

Si vous devez charger des fichiers `Toml`, utilisez le `TomlLoader`.

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
