---
translated: true
---

# डेटाहेरल्ड

यह नोटबुक डेटाहेरल्ड घटक का उपयोग करने के बारे में चर्चा करता है।

पहले, आपको अपना डेटाहेरल्ड खाता सेट करना और अपना API कुंजी प्राप्त करना होगा:

1. dataherald पर जाएं और [यहां](https://www.dataherald.com/) साइन अप करें
2. एक बार आप अपने एडमिन कंसोल में लॉग इन हो जाते हैं, तो एक API कुंजी बनाएं
3. dataherald को स्थापित करें

फिर हमें कुछ पर्यावरण चर सेट करने की आवश्यकता होगी:
1. अपना API कुंजी DATAHERALD_API_KEY पर्यावरण चर में सहेजें

```python
pip install dataherald
```

```python
import os

os.environ["DATAHERALD_API_KEY"] = ""
```

```python
from langchain_community.utilities.dataherald import DataheraldAPIWrapper
```

```python
dataherald = DataheraldAPIWrapper(db_connection_id="65fb766367dd22c99ce1a12d")
```

```python
dataherald.run("How many employees are in the company?")
```

```output
'select COUNT(*) from employees'
```
