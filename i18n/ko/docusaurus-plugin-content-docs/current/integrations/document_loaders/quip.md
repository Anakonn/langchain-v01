---
translated: true
---

# 퀴프

>[퀴프](https://quip.com)는 모바일 및 웹용 협업 생산성 소프트웨어 스위트입니다. 이를 통해 그룹의 사람들이 일반적으로 비즈니스 목적으로 문서와 스프레드시트를 함께 만들고 편집할 수 있습니다.

`퀴프` 문서를 로드하는 로더입니다.

퀴프의 API에 액세스하는 방법은 [여기](https://quip.com/dev/automation/documentation/current#section/Authentication/Get-Access-to-Quip's-APIs)를 참조하십시오.

`folder_ids` 및/또는 `thread_ids` 목록을 지정하여 해당 문서를 Document 객체로 로드할 수 있습니다. 두 가지가 모두 지정된 경우 로더는 `folder_ids`에 속하는 모든 `thread_ids`를 가져오고, 전달된 `thread_ids`와 결합하여 두 집합의 합집합을 반환합니다.

* folder_id를 어떻게 알 수 있나요?
  퀴프 폴더로 이동하여 마우스 오른쪽 버튼을 클릭하고 링크를 복사한 다음, 링크 끝부분의 접미사를 folder_id로 추출하십시오. 힌트: `https://example.quip.com/<folder_id>`
* thread_id를 어떻게 알 수 있나요?
  thread_id는 문서 ID입니다. 퀴프 문서로 이동하여 마우스 오른쪽 버튼을 클릭하고 링크를 복사한 다음, 링크 끝부분의 접미사를 thread_id로 추출하십시오. 힌트: `https://exmaple.quip.com/<thread_id>`

`include_all_folders`를 `True`로 설정하면 group_folder_ids를 가져올 수 있습니다.
`include_attachments`를 `True`로 설정하면 첨부 파일을 포함할 수 있습니다. 이 옵션은 기본적으로 `False`로 설정되어 있습니다. `True`로 설정하면 모든 첨부 파일이 다운로드되고 QuipLoader가 첨부 파일에서 텍스트를 추출하여 Document 객체에 추가합니다. 현재 지원되는 첨부 파일 유형은 `PDF`, `PNG`, `JPEG/JPG`, `SVG`, `Word` 및 `Excel`입니다. `include_comments`를 `True`로 설정하면 문서의 모든 댓글을 가져올 수 있습니다. 이 옵션은 기본적으로 `False`로 설정되어 있습니다.

QuipLoader를 사용하기 전에 quip-api 패키지의 최신 버전이 설치되어 있는지 확인하십시오.

```python
%pip install --upgrade --quiet  quip-api
```

## 예시

### 개인 액세스 토큰

```python
from langchain_community.document_loaders.quip import QuipLoader

loader = QuipLoader(
    api_url="https://platform.quip.com", access_token="change_me", request_timeout=60
)
documents = loader.load(
    folder_ids={"123", "456"},
    thread_ids={"abc", "efg"},
    include_attachments=False,
    include_comments=False,
)
```
