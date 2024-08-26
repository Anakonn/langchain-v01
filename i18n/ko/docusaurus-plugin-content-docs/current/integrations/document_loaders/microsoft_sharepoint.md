---
translated: true
---

# Microsoft SharePoint

> [Microsoft SharePoint](https://en.wikipedia.org/wiki/SharePoint)는 Microsoft가 개발한 웹 기반 협업 시스템으로, 워크플로 애플리케이션, "list" 데이터베이스 및 기타 웹 파트와 보안 기능을 사용하여 비즈니스 팀이 함께 작업할 수 있도록 지원합니다.

이 노트북에서는 [SharePoint 문서 라이브러리](https://support.microsoft.com/en-us/office/what-is-a-document-library-3b5976dd-65cf-4c9e-bf5a-713c10ca2872)에서 문서를 로드하는 방법을 다룹니다. 현재 docx, doc 및 pdf 파일만 지원됩니다.

## 필수 조건

1. [Microsoft 아이덴티티 플랫폼](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) 지침에 따라 애플리케이션을 등록합니다.
2. 등록이 완료되면 Azure 포털에 앱 등록의 개요 창이 표시됩니다. 애플리케이션(클라이언트) ID를 볼 수 있습니다. 이 값은 Microsoft 아이덴티티 플랫폼에서 애플리케이션을 고유하게 식별합니다.
3. **항목 1**에서 따르게 될 단계 중에 리디렉션 URI를 `https://login.microsoftonline.com/common/oauth2/nativeclient`로 설정할 수 있습니다.
4. **항목 1**에서 따르게 될 단계 중에 애플리케이션 비밀 섹션에서 새 암호(`client_secret`)를 생성합니다.
5. 이 [문서](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope)의 지침을 따라 애플리케이션에 `SCOPES`(`offline_access` 및 `Sites.Read.All`)를 추가합니다.
6. **문서 라이브러리**에서 파일을 검색하려면 해당 ID가 필요합니다. 이를 얻기 위해서는 `Tenant Name`, `Collection ID` 및 `Subsite ID`의 값이 필요합니다.
7. `Tenant Name`을 찾는 방법은 이 [문서](https://learn.microsoft.com/en-us/azure/active-directory-b2c/tenant-management-read-tenant-name)의 지침을 따르세요. 이 값을 얻으면 `.onmicrosoft.com`을 제거하고 나머지 부분을 `Tenant Name`으로 사용하세요.
8. `Collection ID` 및 `Subsite ID`를 얻으려면 **SharePoint** `site-name`이 필요합니다. **SharePoint** 사이트 URL은 다음 형식입니다 `https://<tenant-name>.sharepoint.com/sites/<site-name>`. URL의 마지막 부분이 `site-name`입니다.
9. 사이트 `Collection ID`를 얻으려면 브라우저에서 이 URL을 실행하세요: `https://<tenant>.sharepoint.com/sites/<site-name>/_api/site/id`. `Edm.Guid` 속성의 값을 복사하세요.
10. `Subsite ID`(또는 웹 ID)를 얻으려면 `https://<tenant>.sharepoint.com/sites/<site-name>/_api/web/id`를 사용하고 `Edm.Guid` 속성의 값을 복사하세요.
11. `SharePoint site ID`의 형식은 `<tenant-name>.sharepoint.com,<Collection ID>,<subsite ID>`입니다. 다음 단계에서 사용할 수 있도록 이 값을 보관하세요.
12. [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer)를 방문하여 `Document Library ID`를 얻으세요. 첫 번째 단계는 **SharePoint** 사이트와 연결된 계정으로 로그인되어 있는지 확인하는 것입니다. 그런 다음 `https://graph.microsoft.com/v1.0/sites/<SharePoint site ID>/drive`에 요청을 보내야 하며, 응답에는 `id` 필드가 포함되어 있어 이것이 `Document Library ID`입니다.

## 🧑 SharePoint 문서 라이브러리에서 문서 수집 지침

### 🔑 인증

기본적으로 `SharePointLoader`는 `CLIENT_ID` 및 `CLIENT_SECRET`의 값이 각각 `O365_CLIENT_ID` 및 `O365_CLIENT_SECRET`이라는 환경 변수에 저장되어 있다고 예상합니다. 이러한 환경 변수는 애플리케이션의 루트에 있는 `.env` 파일을 통해 또는 다음 명령을 사용하여 스크립트에 전달할 수 있습니다.

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

이 로더는 [*사용자를 대신하여*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0)라는 인증 방식을 사용합니다. 이것은 사용자 동의가 필요한 2단계 인증입니다. 로더를 인스턴스화하면 사용자가 방문해야 하는 URL이 출력됩니다. 사용자는 이 URL을 방문하여 애플리케이션에 필요한 권한을 허용해야 합니다. 그런 다음 사용자는 결과 페이지 URL을 복사하여 콘솔에 붙여넣어야 합니다. 그러면 메서드가 로그인 시도가 성공했는지 True를 반환합니다.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID")
```

인증이 완료되면 로더가 `~/.credentials/` 폴더에 토큰(`o365_token.txt`)을 저장합니다. 이 토큰을 사용하여 나중에 복사/붙여넣기 단계 없이 인증할 수 있습니다. 이 토큰을 사용하여 인증하려면 로더 인스턴스화 시 `auth_with_token` 매개변수를 True로 변경해야 합니다.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
```

### 🗂️ 문서 로더

#### 📑 문서 라이브러리 디렉토리에서 문서 로드

`SharePointLoader`는 문서 라이브러리의 특정 폴더에서 문서를 로드할 수 있습니다. 예를 들어 문서 라이브러리의 `Documents/marketing` 폴더에 저장된 모든 문서를 로드하려는 경우입니다.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", folder_path="Documents/marketing", auth_with_token=True)
documents = loader.load()
```

리소스를 찾을 수 없다는 오류 `Resource not found for the segment`가 발생하는 경우, [Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)에서 폴더 경로 대신 `folder_id`를 사용해 보세요.

```python
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True
                          folder_id="<folder-id>")
documents = loader.load()
```

루트 디렉토리에서 문서를 로드하려면 `folder_id`, `folder_path` 및 `documents_ids`를 생략할 수 있으며, 로더가 루트 디렉토리를 로드합니다.

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
documents = loader.load()
```

`recursive=True`와 결합하면 전체 SharePoint에서 모든 문서를 간단히 로드할 수 있습니다.

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID",
                          recursive=True,
                          auth_with_token=True)
documents = loader.load()
```

#### 📑 문서 ID 목록에서 문서 로드하기

다른 방법은 로드하려는 각 문서의 `object_id`를 제공하는 것입니다. 이를 위해서는 [Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)를 쿼리하여 관심 있는 모든 문서 ID를 찾아야 합니다. 이 [링크](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources)에는 문서 ID를 검색하는 데 도움이 되는 엔드포인트 목록이 제공됩니다.

예를 들어 `data/finance/` 폴더에 저장된 모든 개체에 대한 정보를 검색하려면 `https://graph.microsoft.com/v1.0/drives/<document-library-id>/root:/data/finance:/children`에 요청을 보내야 합니다. 관심 있는 ID 목록을 얻은 후에는 다음 매개변수로 로더를 인스턴스화할 수 있습니다.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
