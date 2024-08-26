---
translated: true
---

# वुल्फ्राम अल्फा

यह नोटबुक वुल्फ्राम अल्फा घटक का उपयोग करने के बारे में चर्चा करता है।

सबसे पहले, आपको अपना वुल्फ्राम अल्फा डेवलपर खाता सेट करना और अपना APP ID प्राप्त करना होगा:

1. वुल्फ्राम अल्फा पर जाएं और यहां [डेवलपर खाता](https://developer.wolframalpha.com/) बनाएं
2. एक ऐप बनाएं और अपना APP ID प्राप्त करें
3. pip install wolframalpha

फिर हमें कुछ पर्यावरण चर सेट करने की आवश्यकता होगी:
1. अपना APP ID को WOLFRAM_ALPHA_APPID env चर में सहेजें

```python
pip install wolframalpha
```

```python
import os

os.environ["WOLFRAM_ALPHA_APPID"] = ""
```

```python
from langchain_community.utilities.wolfram_alpha import WolframAlphaAPIWrapper
```

```python
wolfram = WolframAlphaAPIWrapper()
```

```python
wolfram.run("What is 2x+5 = -3x + 7?")
```

```output
'x = 2/5'
```
