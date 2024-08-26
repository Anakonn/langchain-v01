---
translated: true
---

# acreom

[acreom](https://acreom.com)은 로컬 마크다운 파일로 실행되는 개발자 우선 지식 기반입니다.

아래는 acreom vault를 Langchain에 로드하는 예제입니다. acreom의 로컬 vault는 단순 텍스트 .md 파일로 구성된 폴더이므로, 로더는 디렉터리 경로를 필요로 합니다.

Vault 파일은 YAML 헤더로 저장된 메타데이터를 포함할 수 있습니다. `collect_metadata`가 true로 설정된 경우 이러한 값들은 문서의 메타데이터에 추가됩니다.

```python
from langchain_community.document_loaders import AcreomLoader
```

```python
loader = AcreomLoader("<path-to-acreom-vault>", collect_metadata=False)
```

```python
docs = loader.load()
```

