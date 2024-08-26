---
translated: true
---

# YouTube

>[YouTube 検索](https://github.com/joetats/youtube_search) パッケージは、厳しい制限のある YouTube API を使用せずに YouTube ビデオを検索します。
>
>ホームページのフォームを使用し、結果のページをスクレイピングします。

このノートブックでは、YouTube を検索するツールの使用方法を示します。

[https://github.com/venuv/langchain_yt_tools](https://github.com/venuv/langchain_yt_tools) から改編

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

返される結果の数を指定することもできます

```python
tool.run("lex friedman,5")
```

```output
"['/watch?v=VcVfceTsD0A&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=YVJ8gTnDC4Y&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=Udh22kuLebg&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=gPfriiHBBek&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=L_Guz73e6fw&pp=ygUMbGV4IGZyaWVkbWFu']"
```
