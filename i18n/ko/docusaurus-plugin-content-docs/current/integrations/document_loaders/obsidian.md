---
translated: true
---

# 옵시디언

>[옵시디언](https://obsidian.md/)은 일반 텍스트 파일로 구성된 로컬 폴더 위에서 작동하는 강력하고 확장 가능한 지식 베이스입니다.

이 노트북은 `옵시디언` 데이터베이스에서 문서를 로드하는 방법을 다룹니다.

`옵시디언`은 디스크에 마크다운 파일 폴더로 저장되므로, 로더는 이 디렉토리의 경로만 가져옵니다.

`옵시디언` 파일에는 때때로 파일 상단의 YAML 블록인 [메타데이터](https://help.obsidian.md/Editing+and+formatting/Metadata)가 포함되어 있습니다. 이 값은 문서의 메타데이터에 추가됩니다. (`ObsidianLoader`에 `collect_metadata=False` 인수를 전달하여 이 동작을 비활성화할 수 있습니다.)

```python
from langchain_community.document_loaders import ObsidianLoader
```

```python
loader = ObsidianLoader("<path-to-obsidian>")
```

```python
docs = loader.load()
```
