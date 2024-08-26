---
translated: true
---

# TOML

>[TOML](https://en.wikipedia.org/wiki/TOML) एक कॉन्फ़िगरेशन फ़ाइल के लिए एक फ़ाइल प्रारूप है। इसका उद्देश्य पढ़ने और लिखने में आसान होना है, और एक डिक्शनरी में अस्पष्टता के बिना मैप करने के लिए डिज़ाइन किया गया है। इसका विनिर्देश ओपन-सोर्स है। `TOML` कई प्रोग्रामिंग भाषाओं में लागू किया गया है। `TOML` का नाम "Tom's Obvious, Minimal Language" का संक्षिप्त रूप है, जो इसके निर्माता टॉम प्रेस्टन-वर्नर का संदर्भ है।

यदि आपको `Toml` फ़ाइलों को लोड करने की आवश्यकता है, तो `TomlLoader` का उपयोग करें।

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
