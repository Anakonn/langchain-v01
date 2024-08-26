---
translated: true
---

# Azure AI 문서 지능

>[Azure AI 문서 지능](https://aka.ms/doc-intelligence) (이전에는 `Azure Form Recognizer`로 알려짐)은 디지털 또는 스캔된 PDF, 이미지, Office 및 HTML 파일에서 텍스트(필기 포함), 테이블, 문서 구조(예: 제목, 섹션 제목 등) 및 키-값 쌍을 추출하는 기계 학습 기반 서비스입니다.

문서 지능은 `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` 및 `HTML`을 지원합니다.

현재 `문서 지능`을 사용하는 로더 구현은 콘텐츠를 페이지 단위로 통합하고 이를 LangChain 문서로 변환할 수 있습니다. 기본 출력 형식은 마크다운이며, `MarkdownHeaderTextSplitter`를 사용하여 의미론적 문서 청크화를 쉽게 수행할 수 있습니다. `mode="single"` 또는 `mode="page"`를 사용하여 단일 페이지 또는 페이지별로 분할된 순수 텍스트를 반환할 수도 있습니다.

## 사전 요구 사항

**East US**, **West US2**, **West Europe** 중 하나의 미리 보기 지역에 Azure AI 문서 인텔리전스 리소스가 필요합니다. 아직 없는 경우 [이 문서](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)를 따라 만드세요. `<endpoint>` 및 `<key>`를 로더의 매개변수로 전달할 것입니다.

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

## 예제 1

첫 번째 예제는 Azure AI Document Intelligence로 전송될 로컬 파일을 사용합니다.
초기화된 문서 분석 클라이언트를 사용하여 DocumentIntelligenceLoader의 인스턴스를 생성할 수 있습니다:

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, file_path=file_path, api_model="prebuilt-layout"
)

documents = loader.load()
```

기본 출력에는 마크다운 형식 콘텐츠가 포함된 하나의 LangChain 문서가 포함됩니다:

```python
documents
```

## 예제 2

입력 파일은 공개 URL 경로일 수도 있습니다. 예: https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/rest-api/layout.png.

```python
url_path = "<url>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, url_path=url_path, api_model="prebuilt-layout"
)

documents = loader.load()
```

```python
documents
```

## 예제 3

`mode="page"`를 지정하여 페이지별로 문서를 로드할 수도 있습니다.

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    mode="page",
)

documents = loader.load()
```

출력은 목록에 별도의 문서로 저장된 각 페이지가 될 것입니다:

```python
for document in documents:
    print(f"Page Content: {document.page_content}")
    print(f"Metadata: {document.metadata}")
```

## 예제 4

`analysis_feature=["ocrHighResolution"]`를 지정하여 추가 기능을 활성화할 수 있습니다. 자세한 내용은 다음을 참조하세요: https://aka.ms/azsdk/python/documentintelligence/analysisfeature.

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
analysis_features = ["ocrHighResolution"]
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    analysis_features=analysis_features,
)

documents = loader.load()
```

출력에는 고해상도 추가 기능으로 인식된 LangChain 문서가 포함됩니다:

```python
documents
```

