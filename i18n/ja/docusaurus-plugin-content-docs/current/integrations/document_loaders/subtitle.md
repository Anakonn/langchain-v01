---
translated: true
---

# サブタイトル

>[The SubRip file format](https://en.wikipedia.org/wiki/SubRip#SubRip_file_format) は`Matroska`マルチメディアコンテナフォーマットのウェブサイトで「おそらくすべての字幕フォーマットの中で最も基本的なもの」と説明されています。`SubRip (SubRip Text)`ファイルは拡張子`.srt`で命名され、空行で区切られたグループでフォーマットされたプレーンテキストの行が含まれています。字幕は1から始まり、順番に番号が付けられます。使用されるタイムコードフォーマットは、時間:分:秒,ミリ秒であり、時間単位はゼロパディングされた2桁、分数はゼロパディングされた3桁に固定されています（00:00:00,000）。プログラムがフランスで書かれたため、小数点の区切りにはコンマが使用されています。

字幕 (`.srt`) ファイルからデータをロードする方法

[ここからサンプルの .srt ファイルをダウンロードしてください](https://www.opensubtitles.org/en/subtitles/5575150/star-wars-the-clone-wars-crisis-at-the-heart-en)。

```python
%pip install --upgrade --quiet  pysrt
```

```python
from langchain_community.document_loaders import SRTLoader
```

```python
loader = SRTLoader(
    "example_data/Star_Wars_The_Clone_Wars_S06E07_Crisis_at_the_Heart.srt"
)
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:100]
```

```output
'<i>Corruption discovered\nat the core of the Banking Clan!</i> <i>Reunited, Rush Clovis\nand Senator A'
```
