---
translated: true
---

# Yuque

>[Yuque](https://www.yuque.com/) एक टीम सहयोग में प्रलेखन के लिए पेशेवर क्लाउड-आधारित ज्ञान आधार है।

यह नोटबुक `Yuque` से दस्तावेज़ लोड करने के बारे में कवर करता है।

आप [व्यक्तिगत सेटिंग](https://www.yuque.com/settings/tokens) पृष्ठ पर अपने व्यक्तिगत अवतार पर क्लिक करके व्यक्तिगत एक्सेस टोकन प्राप्त कर सकते हैं।

```python
from langchain_community.document_loaders import YuqueLoader
```

```python
loader = YuqueLoader(access_token="<your_personal_access_token>")
```

```python
docs = loader.load()
```
