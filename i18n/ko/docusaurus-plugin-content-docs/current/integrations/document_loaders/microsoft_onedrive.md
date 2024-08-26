---
translated: true
---

# Microsoft OneDrive

>[Microsoft OneDrive](https://en.wikipedia.org/wiki/OneDrive) (이전에는 `SkyDrive`라고 불렸음) Microsoft가 운영하는 파일 호스팅 서비스입니다.

이 노트북은 `OneDrive`에서 문서를 로드하는 방법을 다룹니다. 현재 docx, doc, pdf 파일만 지원됩니다.

## 전제 조건

1. [Microsoft 아이덴티티 플랫폼](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) 지침에 따라 애플리케이션을 등록하세요.
2. 등록이 완료되면 Azure 포털에 앱 등록의 개요 창이 표시됩니다. Application (client) ID를 볼 수 있습니다. 이 값은 Microsoft 아이덴티티 플랫폼에서 귀하의 애플리케이션을 고유하게 식별합니다.
3. **항목 1**에서 따라야 할 단계 중에 리디렉션 URI를 `http://localhost:8000/callback`로 설정할 수 있습니다.
4. **항목 1**에서 따라야 할 단계 중에 Application Secrets 섹션에서 새 암호(`client_secret`)를 생성하세요.
5. 이 [문서](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope)의 지침에 따라 애플리케이션에 `SCOPES`(`offline_access` 및 `Files.Read.All`)를 추가하세요.
6. [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer)를 방문하여 `OneDrive ID`를 얻으세요. 첫 번째 단계는 OneDrive 계정과 연결된 계정으로 로그인하는 것입니다. 그런 다음 `https://graph.microsoft.com/v1.0/me/drive`에 요청을 보내야 하며, 응답에는 `id` 필드가 포함된 페이로드가 반환됩니다. 이 필드에는 OneDrive 계정의 ID가 포함되어 있습니다.
7. `pip install o365` 명령을 사용하여 o365 패키지를 설치해야 합니다.
8. 단계를 완료하면 다음 값이 있어야 합니다:
- `CLIENT_ID`
- `CLIENT_SECRET`
- `DRIVE_ID`

## 🧑 OneDrive에서 문서를 수집하는 방법

### 🔑 인증

기본적으로 `OneDriveLoader`는 `O365_CLIENT_ID` 및 `O365_CLIENT_SECRET`이라는 환경 변수에 `CLIENT_ID` 및 `CLIENT_SECRET` 값이 저장되어 있다고 예상합니다. 이러한 환경 변수는 애플리케이션의 루트에 있는 `.env` 파일을 통해 또는 다음 명령을 사용하여 스크립트에 전달할 수 있습니다.

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

이 로더는 [*사용자를 대신하여*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0)라는 인증을 사용합니다. 이것은 사용자 동의가 필요한 2단계 인증입니다. 로더를 인스턴스화하면 사용자가 방문해야 하는 URL이 출력됩니다. 사용자는 이 URL을 방문하고 애플리케이션에 필요한 권한을 허용해야 합니다. 그런 다음 사용자는 결과 페이지 URL을 복사하여 콘솔에 붙여넣어야 합니다. 그러면 메서드가 로그인 시도가 성공했는지 여부를 True로 반환합니다.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID")
```

인증이 완료되면 로더가 `~/.credentials/` 폴더에 토큰(`o365_token.txt`)을 저장합니다. 이 토큰을 사용하여 나중에 복사/붙여넣기 단계 없이 인증할 수 있습니다. 이 토큰을 사용하여 인증하려면 로더 인스턴스화 시 `auth_with_token` 매개변수를 True로 변경해야 합니다.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", auth_with_token=True)
```

### 🗂️ 문서 로더

#### 📑 OneDrive 디렉토리에서 문서 로드하기

`OneDriveLoader`는 OneDrive의 특정 폴더에서 문서를 로드할 수 있습니다. 예를 들어 OneDrive의 `Documents/clients` 폴더에 저장된 모든 문서를 로드하려는 경우입니다.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", folder_path="Documents/clients", auth_with_token=True)
documents = loader.load()
```

#### 📑 문서 ID 목록에서 문서 로드하기

또 다른 방법은 로드하려는 각 문서의 `object_id`를 제공하는 것입니다. 이를 위해서는 [Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)를 쿼리하여 관심 있는 모든 문서 ID를 찾아야 합니다. 이 [링크](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources)에는 문서 ID를 검색하는 데 도움이 되는 엔드포인트 목록이 제공됩니다.

예를 들어 문서 폴더의 루트에 저장된 모든 개체에 대한 정보를 검색하려면 `https://graph.microsoft.com/v1.0/drives/{YOUR DRIVE ID}/root/children`에 요청을 보내야 합니다. 관심 있는 ID 목록을 얻으면 다음 매개변수로 로더를 인스턴스화할 수 있습니다.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
