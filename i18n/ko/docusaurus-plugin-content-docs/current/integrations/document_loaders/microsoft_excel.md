---
translated: true
---

# Microsoft Excel

`UnstructuredExcelLoader`는 `Microsoft Excel` 파일을 로드하는 데 사용됩니다. 이 로더는 `.xlsx` 및 `.xls` 파일에서 작동합니다. 페이지 내용은 Excel 파일의 원시 텍스트가 됩니다. `"elements"` 모드로 로더를 사용하는 경우 문서 메타데이터의 `text_as_html` 키에 Excel 파일의 HTML 표현이 제공됩니다.

```python
from langchain_community.document_loaders import UnstructuredExcelLoader
```

```python
loader = UnstructuredExcelLoader("example_data/stanley-cups.xlsx", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='\n  \n    \n      Team\n      Location\n      Stanley Cups\n    \n    \n      Blues\n      STL\n      1\n    \n    \n      Flyers\n      PHI\n      2\n    \n    \n      Maple Leafs\n      TOR\n      13\n    \n  \n', metadata={'source': 'example_data/stanley-cups.xlsx', 'filename': 'stanley-cups.xlsx', 'file_directory': 'example_data', 'filetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'page_number': 1, 'page_name': 'Stanley Cups', 'text_as_html': '<table border="1" class="dataframe">\n  <tbody>\n    <tr>\n      <td>Team</td>\n      <td>Location</td>\n      <td>Stanley Cups</td>\n    </tr>\n    <tr>\n      <td>Blues</td>\n      <td>STL</td>\n      <td>1</td>\n    </tr>\n    <tr>\n      <td>Flyers</td>\n      <td>PHI</td>\n      <td>2</td>\n    </tr>\n    <tr>\n      <td>Maple Leafs</td>\n      <td>TOR</td>\n      <td>13</td>\n    </tr>\n  </tbody>\n</table>', 'category': 'Table'})
```

## Azure AI Document Intelligence 사용

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence)(이전에는 `Azure Form Recognizer`라고 함)는 디지털 또는 스캔된 PDF, 이미지, Office 및 HTML 파일에서 텍스트(필기 포함), 테이블, 문서 구조(예: 제목, 섹션 제목 등) 및 키-값 쌍을 추출하는 기계 학습 기반 서비스입니다.
>
>Document Intelligence는 `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` 및 `HTML`을 지원합니다.

`Document Intelligence`를 사용하는 현재 구현의 로더는 페이지별로 콘텐츠를 통합하고 LangChain 문서로 변환할 수 있습니다. 기본 출력 형식은 마크다운이며, `MarkdownHeaderTextSplitter`를 사용하여 의미론적 문서 청크를 쉽게 만들 수 있습니다. `mode="single"` 또는 `mode="page"`를 사용하여 단일 페이지 또는 페이지별로 분할된 순수 텍스트를 반환할 수도 있습니다.

### 필수 조건

**East US**, **West US2**, **West Europe** 중 하나의 3개 미리 보기 지역에 있는 Azure AI Document Intelligence 리소스 - 아직 없는 경우 [이 문서](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)를 따라 만드세요. 로더에 `<endpoint>` 및 `<key>`를 매개변수로 전달하게 됩니다.

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
