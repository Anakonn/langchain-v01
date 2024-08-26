---
translated: true
---

# Microsoft PowerPoint

>[Microsoft PowerPoint](https://en.wikipedia.org/wiki/Microsoft_PowerPoint)은 Microsoft에서 개발한 프레젠테이션 프로그램입니다.

이 문서는 `Microsoft PowerPoint` 문서를 우리가 사용할 수 있는 문서 형식으로 로드하는 방법을 다룹니다.

```python
from langchain_community.document_loaders import UnstructuredPowerPointLoader
```

```python
loader = UnstructuredPowerPointLoader("example_data/fake-power-point.pptx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Adding a Bullet Slide\n\nFind the bullet slide layout\n\nUse _TextFrame.text for first bullet\n\nUse _TextFrame.add_paragraph() for subsequent bullets\n\nHere is a lot of text!\n\nHere is some text in a text box!', metadata={'source': 'example_data/fake-power-point.pptx'})]
```

### 요소 유지

내부적으로 `Unstructured`는 텍스트의 다른 부분에 대해 다른 "요소"를 만듭니다. 기본적으로 우리는 그것들을 결합하지만, `mode="elements"`를 지정하여 그 구분을 쉽게 유지할 수 있습니다.

```python
loader = UnstructuredPowerPointLoader(
    "example_data/fake-power-point.pptx", mode="elements"
)
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='Adding a Bullet Slide', lookup_str='', metadata={'source': 'example_data/fake-power-point.pptx'}, lookup_index=0)
```

## Azure AI Document Intelligence 사용하기

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (이전에는 `Azure Form Recognizer`라고 알려짐)는 디지털 또는 스캔된 PDF, 이미지, Office 및 HTML 파일에서 텍스트(필기 포함), 표, 문서 구조(예: 제목, 섹션 제목 등) 및 키-값 쌍을 추출하는 기계 학습 기반 서비스입니다.
>
>Document Intelligence는 `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` 및 `HTML`을 지원합니다.

이 `Document Intelligence`를 사용하는 로더의 현재 구현은 페이지별로 콘텐츠를 통합하고 이를 LangChain 문서로 변환할 수 있습니다. 기본 출력 형식은 markdown이며, `MarkdownHeaderTextSplitter`와 쉽게 연결할 수 있어 의미론적 문서 청크화가 가능합니다. `mode="single"` 또는 `mode="page"`를 사용하여 단일 페이지 또는 페이지별로 분할된 순수 텍스트를 반환할 수도 있습니다.

## 필수 조건

**East US**, **West US2**, **West Europe** 중 하나의 미리 보기 지역에 있는 Azure AI Document Intelligence 리소스 - 아직 없다면 [이 문서](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)를 따라 만드세요. 로더에 `<endpoint>` 및 `<key>`를 매개변수로 전달할 것입니다.

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

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
