---
translated: true
---

# YouTube

>[YouTube Search](https://github.com/joetats/youtube_search) पैकेज उनके भारी दर-सीमित एपीआई का उपयोग करने से बचते हुए `YouTube` वीडियो खोजता है।
>
>यह `YouTube` होमपेज पर फॉर्म का उपयोग करता है और परिणामी पृष्ठ को स्क्रैप करता है।

यह नोटबुक YouTube खोजने के लिए एक उपकरण का उपयोग करने का तरीका दिखाता है।

[https://github.com/venuv/langchain_yt_tools](https://github.com/venuv/langchain_yt_tools) से अनुकूलित

```python
%pip install --upgrade --quiet  youtube_search
```

```python
from langchain_community.tools import YouTubeSearchTool
```

```python
tool = YouTubeSearchTool()
```

```python
tool.run("lex friedman")
```

```output
"['/watch?v=VcVfceTsD0A&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=gPfriiHBBek&pp=ygUMbGV4IGZyaWVkbWFu']"
```

आप वापस किए जाने वाले परिणामों की संख्या भी निर्दिष्ट कर सकते हैं।

```python
tool.run("lex friedman,5")
```

```output
"['/watch?v=VcVfceTsD0A&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=YVJ8gTnDC4Y&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=Udh22kuLebg&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=gPfriiHBBek&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=L_Guz73e6fw&pp=ygUMbGV4IGZyaWVkbWFu']"
```
