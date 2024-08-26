---
translated: true
---

# EverNote

>[EverNote](https://evernote.com/)은 사진, 오디오 및 저장된 웹 콘텐츠를 포함할 수 있는 메모를 보관하고 작성하기 위한 것입니다. 메모는 가상 "노트북"에 저장되며 태그, 주석, 편집, 검색 및 내보내기가 가능합니다.

이 노트북은 디스크에서 `Evernote` [내보내기](https://help.evernote.com/hc/en-us/articles/209005557-Export-notes-and-notebooks-as-ENEX-or-HTML) 파일(.enex)을 로드하는 방법을 보여줍니다.

내보내기의 각 메모에 대해 문서가 생성됩니다.

```python
# lxml and html2text are required to parse EverNote notes
%pip install --upgrade --quiet  lxml
%pip install --upgrade --quiet  html2text
```

```python
from langchain_community.document_loaders import EverNoteLoader

# By default all notes are combined into a single Document
loader = EverNoteLoader("example_data/testing.enex")
loader.load()
```

```output
[Document(page_content='testing this\n\nwhat happens?\n\nto the world?**Jan - March 2022**', metadata={'source': 'example_data/testing.enex'})]
```

```python
# It's likely more useful to return a Document for each note
loader = EverNoteLoader("example_data/testing.enex", load_single_document=False)
loader.load()
```

```output
[Document(page_content='testing this\n\nwhat happens?\n\nto the world?', metadata={'title': 'testing', 'created': time.struct_time(tm_year=2023, tm_mon=2, tm_mday=9, tm_hour=3, tm_min=47, tm_sec=46, tm_wday=3, tm_yday=40, tm_isdst=-1), 'updated': time.struct_time(tm_year=2023, tm_mon=2, tm_mday=9, tm_hour=3, tm_min=53, tm_sec=28, tm_wday=3, tm_yday=40, tm_isdst=-1), 'note-attributes.author': 'Harrison Chase', 'source': 'example_data/testing.enex'}),
 Document(page_content='**Jan - March 2022**', metadata={'title': 'Summer Training Program', 'created': time.struct_time(tm_year=2022, tm_mon=12, tm_mday=27, tm_hour=1, tm_min=59, tm_sec=48, tm_wday=1, tm_yday=361, tm_isdst=-1), 'note-attributes.author': 'Mike McGarry', 'note-attributes.source': 'mobile.iphone', 'source': 'example_data/testing.enex'})]
```
