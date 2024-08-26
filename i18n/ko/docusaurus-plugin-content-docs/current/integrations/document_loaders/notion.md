---
translated: true
---

# Notion DB 1/2

>[Notion](https://www.notion.so/)은 kanban 보드, 작업, 위키 및 데이터베이스를 통합하는 수정된 Markdown 지원 협업 플랫폼입니다. 이것은 메모 작성, 지식 및 데이터 관리, 프로젝트 및 작업 관리를 위한 올인원 작업 공간입니다.

이 노트북에서는 Notion 데이터베이스 덤프에서 문서를 로드하는 방법을 다룹니다.

이 notion 덤프를 얻기 위해서는 다음 지침을 따르세요:

## 🧑 자신의 데이터세트를 수집하는 지침

Notion에서 데이터세트를 내보냅니다. 오른쪽 상단의 세 개의 점을 클릭한 다음 `내보내기`를 클릭하면 됩니다.

내보낼 때 `Markdown & CSV` 형식 옵션을 선택해야 합니다.

이렇게 하면 다운로드 폴더에 `.zip` 파일이 생성됩니다. 이 `.zip` 파일을 이 리포지토리로 이동시킵니다.

다음 명령을 실행하여 zip 파일의 압축을 풉니다(필요에 따라 `Export...`를 자신의 파일 이름으로 바꿉니다).

```shell
unzip Export-d3adfe0f-3131-4bf3-8987-a52017fc1bae.zip -d Notion_DB
```

다음 명령을 실행하여 데이터를 수집합니다.

```python
from langchain_community.document_loaders import NotionDirectoryLoader
```

```python
loader = NotionDirectoryLoader("Notion_DB")
```

```python
docs = loader.load()
```
