---
translated: true
---

# Joplin

>[Joplin](https://joplinapp.org/)은 오픈 소스 노트 앱입니다. 생각을 포착하고 모든 기기에서 안전하게 액세스할 수 있습니다.

이 노트북은 `Joplin` 데이터베이스에서 문서를 로드하는 방법을 다룹니다.

`Joplin`에는 로컬 데이터베이스에 액세스하기 위한 [REST API](https://joplinapp.org/api/references/rest_api/)가 있습니다. 이 로더는 API를 사용하여 데이터베이스의 모든 노트와 메타데이터를 검색합니다. 이를 위해서는 앱에서 다음 단계를 따라 얻을 수 있는 액세스 토큰이 필요합니다:

1. `Joplin` 앱을 엽니다. 문서가 로드되는 동안 앱이 열려 있어야 합니다.
2. 설정/옵션으로 이동하고 "웹 클리퍼"를 선택합니다.
3. 웹 클리퍼 서비스가 활성화되어 있는지 확인합니다.
4. "고급 옵션" 아래에서 인증 토큰을 복사합니다.

액세스 토큰을 직접 로더로 초기화하거나 JOPLIN_ACCESS_TOKEN 환경 변수에 저장할 수 있습니다.

이 접근 방식의 대안은 `Joplin`의 노트 데이터베이스를 Markdown 파일로 내보내고(선택적으로 Front Matter 메타데이터 포함) ObsidianLoader와 같은 Markdown 로더를 사용하여 로드하는 것입니다.

```python
from langchain_community.document_loaders import JoplinLoader
```

```python
loader = JoplinLoader(access_token="<access-token>")
```

```python
docs = loader.load()
```
