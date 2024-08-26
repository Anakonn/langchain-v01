---
translated: true
---

이 노트북은 RSpace 문서 로더를 사용하여 RSpace 전자 실험 노트북에서 연구 노트와 문서를 Langchain 파이프라인으로 가져오는 방법을 보여줍니다.

시작하려면 RSpace 계정과 API 키가 필요합니다.

[https://community.researchspace.com](https://community.researchspace.com)에서 무료 계정을 설정하거나 기관 RSpace를 사용할 수 있습니다.

RSpace API 토큰은 계정의 프로필 페이지에서 얻을 수 있습니다.

```python
%pip install --upgrade --quiet  rspace_client
```

RSpace API 키는 환경 변수로 저장하는 것이 가장 좋습니다.

    RSPACE_API_KEY=<YOUR_KEY>

RSpace 설치의 URL도 설정해야 합니다. 예:

    RSPACE_URL=https://community.researchspace.com

이러한 정확한 환경 변수 이름을 사용하면 자동으로 감지됩니다.

```python
from langchain_community.document_loaders.rspace import RSpaceLoader
```

RSpace에서 다양한 항목을 가져올 수 있습니다:

* 단일 RSpace 구조화된 또는 기본 문서. 이는 1-1로 Langchain 문서에 매핑됩니다.
* 폴더 또는 노트북. 노트북 또는 폴더 내의 모든 문서가 Langchain 문서로 가져옵니다.
* RSpace 갤러리에 PDF 파일이 있는 경우 개별적으로 가져올 수 있습니다. 내부적으로 Langchain의 PDF 로더가 사용되며 이는 PDF 페이지당 하나의 Langchain 문서를 생성합니다.

```python
## replace these ids with some from your own research notes.
## Make sure to use  global ids (with the 2 character prefix). This helps the loader know which API calls to make
## to RSpace API.

rspace_ids = ["NB1932027", "FL1921314", "SD1932029", "GL1932384"]
for rs_id in rspace_ids:
    loader = RSpaceLoader(global_id=rs_id)
    docs = loader.load()
    for doc in docs:
        ## the name and ID are added to the 'source' metadata property.
        print(doc.metadata)
        print(doc.page_content[:500])
```

환경 변수를 위와 같이 사용하지 않으려면 RSpaceLoader에 이를 전달할 수 있습니다.

```python
loader = RSpaceLoader(
    global_id=rs_id, api_key="MY_API_KEY", url="https://my.researchspace.com"
)
```
