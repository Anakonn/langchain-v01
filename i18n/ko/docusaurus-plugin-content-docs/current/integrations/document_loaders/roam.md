---
translated: true
---

# 로암

>[ROAM](https://roamresearch.com/)은 개인 지식 베이스를 만들기 위해 설계된 네트워크 사고를 위한 노트 작성 도구입니다.

이 노트북은 Roam 데이터베이스에서 문서를 로드하는 방법을 다룹니다. 이는 [여기](https://github.com/JimmyLv/roam-qa)의 예제 리포지토리에서 많은 영감을 받았습니다.

## 🧑 자신의 데이터세트를 수집하는 방법

Roam Research에서 데이터세트를 내보냅니다. 이를 위해 오른쪽 상단의 세 개의 점을 클릭한 다음 `내보내기`를 클릭하면 됩니다.

내보낼 때 `Markdown & CSV` 형식 옵션을 선택해야 합니다.

이렇게 하면 Downloads 폴더에 `.zip` 파일이 생성됩니다. `.zip` 파일을 이 리포지토리로 이동시킵니다.

다음 명령을 실행하여 zip 파일의 압축을 풉니다(필요에 따라 `Export...`를 자신의 파일 이름으로 바꿉니다).

```shell
unzip Roam-Export-1675782732639.zip -d Roam_DB
```

```python
from langchain_community.document_loaders import RoamLoader
```

```python
loader = RoamLoader("Roam_DB")
```

```python
docs = loader.load()
```
