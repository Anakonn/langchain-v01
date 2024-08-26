---
translated: true
---

# Microsoft Excel

`UnstructuredExcelLoader`は、`Microsoft Excel`ファイルを読み込むために使用されます。このローダーは、`.xlsx`および`.xls`ファイルに対応しています。ページコンテンツは、Excelファイルのテキストがそのまま表示されます。ローダーを`"elements"`モードで使用する場合、ExcelファイルのHTML表現がドキュメントメタデータの`text_as_html`キーの下に利用可能になります。

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

## Azure AI Document Intelligenceの使用

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence)（旧称`Azure Form Recognizer`）は、機械学習ベースのサービスで、デジタルまたはスキャンされたPDF、画像、Officeファイル、HTMLファイルから、テキスト（手書きを含む）、表、ドキュメント構造（タイトル、セクションヘッダーなど）、キーバリューペアを抽出することができます。

>Document Intelligenceは、`PDF`、`JPEG/JPG`、`PNG`、`BMP`、`TIFF`、`HEIF`、`DOCX`、`XLSX`、`PPTX`、`HTML`をサポートしています。

このDocument Intelligenceを使用したローダーの現在の実装では、コンテンツをページごとに取り込み、LangChainドキュメントに変換することができます。デフォルトの出力形式はMarkdownで、`MarkdownHeaderTextSplitter`を使ってセマンティックドキュメントチャンキングを行うことができます。`mode="single"`または`mode="page"`を使用して、単一ページまたはページ単位で純粋なテキストを返すこともできます。

### 前提条件

Azure AI Document Intelligenceリソースを、**East US**、**West US2**、**West Europe**の3つのプレビュー リージョンのいずれかに作成する必要があります。[このドキュメント](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)に従って作成していない場合は、作成してください。`<endpoint>`と`<key>`をパラメーターとしてローダーに渡します。

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
