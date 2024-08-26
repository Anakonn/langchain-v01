---
translated: true
---

# YouTube

>[YouTube 검색](https://github.com/joetats/youtube_search) 패키지는 YouTube의 엄격한 속도 제한 API를 사용하지 않고 YouTube 동영상을 검색합니다.
>
>YouTube 홈페이지의 양식을 사용하고 결과 페이지를 스크래핑합니다.

이 노트북은 YouTube 검색 도구 사용 방법을 보여줍니다.

[https://github.com/venuv/langchain_yt_tools](https://github.com/venuv/langchain_yt_tools)에서 가져옴

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

반환되는 결과 수를 지정할 수도 있습니다.

```python
tool.run("lex friedman,5")
```

```output
"['/watch?v=VcVfceTsD0A&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=YVJ8gTnDC4Y&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=Udh22kuLebg&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=gPfriiHBBek&pp=ygUMbGV4IGZyaWVkbWFu', '/watch?v=L_Guz73e6fw&pp=ygUMbGV4IGZyaWVkbWFu']"
```
