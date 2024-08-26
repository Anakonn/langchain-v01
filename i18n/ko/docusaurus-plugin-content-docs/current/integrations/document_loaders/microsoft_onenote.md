---
translated: true
---

# Microsoft OneNote

이 노트북은 `OneNote`에서 문서를 로드하는 방법을 다룹니다.

## 전제 조건

1. [Microsoft 아이덴티티 플랫폼](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) 지침에 따라 애플리케이션을 등록하세요.
2. 등록이 완료되면 Azure 포털에 앱 등록의 개요 창이 표시됩니다. Application (client) ID를 볼 수 있습니다. 이 값은 Microsoft 아이덴티티 플랫폼에서 애플리케이션을 고유하게 식별합니다.
3. **항목 1**에서 따르게 될 단계 중에 리디렉션 URI를 `http://localhost:8000/callback`로 설정할 수 있습니다.
4. **항목 1**에서 따르게 될 단계 중에 Application Secrets 섹션에서 새 암호(`client_secret`)를 생성하세요.
5. 이 [문서](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope)의 지침에 따라 애플리케이션에 다음 `SCOPES`(`Notes.Read`)를 추가하세요.
6. `pip install msal`과 `pip install beautifulsoup4` 명령을 사용하여 msal과 bs4 패키지를 설치해야 합니다.
7. 단계가 끝나면 다음 값이 있어야 합니다:
- `CLIENT_ID`
- `CLIENT_SECRET`

## 🧑 OneNote에서 문서를 수집하는 지침

### 🔑 인증

기본적으로 `OneNoteLoader`는 `CLIENT_ID`와 `CLIENT_SECRET`의 값이 각각 `MS_GRAPH_CLIENT_ID`와 `MS_GRAPH_CLIENT_SECRET`이라는 환경 변수에 저장되어 있다고 예상합니다. 이러한 환경 변수는 애플리케이션의 루트에 있는 `.env` 파일을 통해 전달하거나 다음 명령을 사용하여 스크립트에 전달할 수 있습니다.

```python
os.environ['MS_GRAPH_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['MS_GRAPH_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

이 로더는 [*사용자를 대신하여*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0)라는 인증을 사용합니다. 이것은 사용자 동의가 필요한 2단계 인증입니다. 로더를 인스턴스화하면 사용자가 방문해야 하는 URL이 출력됩니다. 사용자는 이 URL을 방문하고 필요한 권한에 대한 동의를 제공해야 합니다. 그런 다음 사용자는 결과 페이지 URL을 복사하여 콘솔에 붙여넣어야 합니다. 그러면 메서드가 로그인 시도가 성공했는지 True를 반환합니다.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE")
```

인증이 완료되면 로더가 `~/.credentials/` 폴더에 토큰(`onenote_graph_token.txt`)을 저장합니다. 이 토큰을 사용하여 나중에 복사/붙여넣기 단계 없이 인증할 수 있습니다. 로더 인스턴스화 시 `auth_with_token` 매개변수를 True로 변경하여 이 토큰을 사용할 수 있습니다.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", auth_with_token=True)
```

또한 토큰을 직접 로더에 전달할 수도 있습니다. 이는 다른 애플리케이션에서 생성한 토큰으로 인증하려는 경우에 유용합니다. 예를 들어 [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)를 사용하여 토큰을 생성하고 이를 로더에 전달할 수 있습니다.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", access_token="TOKEN")
```

### 🗂️ 문서 로더

#### 📑 OneNote 노트북에서 페이지 로드하기

`OneNoteLoader`는 OneDrive에 저장된 OneNote 노트북의 페이지를 로드할 수 있습니다. `notebook_name`, `section_name`, `page_title`을 지정하여 특정 노트북, 특정 섹션 또는 특정 제목의 페이지를 필터링할 수 있습니다. 예를 들어 OneDrive의 모든 노트북에서 `Recipes`라는 섹션에 저장된 모든 페이지를 로드하려는 경우입니다.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(section_name="Recipes", auth_with_token=True)
documents = loader.load()
```

#### 📑 페이지 ID 목록에서 페이지 로드하기

또 다른 방법은 로드하려는 각 페이지의 `object_ids`를 제공하는 것입니다. 이를 위해서는 [Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)를 쿼리하여 관심 있는 모든 문서 ID를 찾아야 합니다. 이 [링크](https://learn.microsoft.com/en-us/graph/onenote-get-content#page-collection)에는 문서 ID를 검색하는 데 도움이 되는 엔드포인트 목록이 제공됩니다.

예를 들어 노트북에 저장된 모든 페이지에 대한 정보를 검색하려면 `https://graph.microsoft.com/v1.0/me/onenote/pages`에 요청을 보내야 합니다. 관심 있는 ID 목록을 얻으면 다음 매개변수로 로더를 인스턴스화할 수 있습니다.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
