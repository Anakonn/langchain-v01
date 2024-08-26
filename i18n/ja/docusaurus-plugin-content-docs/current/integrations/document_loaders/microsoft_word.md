---
translated: true
---

# Microsoft Word

>[Microsoft Word](https://www.microsoft.com/en-us/microsoft-365/word) は、Microsoft が開発した文書作成ソフトウェアです。

これは、Word ドキュメントをドキュメント形式に読み込む方法について説明しています。

## Docx2txtを使う

Docx2txtを使って、.docxファイルをドキュメントに読み込みます。

```python
%pip install --upgrade --quiet  docx2txt
```

```python
from langchain_community.document_loaders import Docx2txtLoader
```

```python
loader = Docx2txtLoader("example_data/fake.docx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.docx'})]
```

## Unstructuredを使う

```python
from langchain_community.document_loaders import UnstructuredWordDocumentLoader
```

```python
loader = UnstructuredWordDocumentLoader("example_data/fake.docx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 'fake.docx'}, lookup_index=0)]
```

### 要素を保持する

Unstructuredは、テキストの異なる部分に対して「要素」を作成します。デフォルトではそれらを結合しますが、`mode="elements"`を指定することで、その分離を維持できます。

```python
loader = UnstructuredWordDocumentLoader("example_data/fake.docx", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 'fake.docx', 'filename': 'fake.docx', 'category': 'Title'}, lookup_index=0)
```

## Azure AI Document Intelligenceを使う

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (旧称 `Azure Form Recognizer`) は、機械学習ベースのサービスで、デジタルまたはスキャンされたPDF、画像、Officeファイル、HTMLファイルから、テキスト(手書きを含む)、表、ドキュメント構造(タイトル、セクション見出しなど)、キーバリューペアを抽出できます。

Document Intelligenceは、`PDF`、`JPEG/JPG`、`PNG`、`BMP`、`TIFF`、`HEIF`、`DOCX`、`XLSX`、`PPTX`、`HTML`をサポートしています。

このDocument Intelligenceローダーの現在の実装では、ページごとにコンテンツを取り込み、LangChainドキュメントに変換できます。デフォルトの出力形式はMarkdownで、`MarkdownHeaderTextSplitter`を使ってセマンティックドキュメントチャンクに簡単に変換できます。`mode="single"`または`mode="page"`を使えば、ページごとの純テキストを返すこともできます。

## 前提条件

East US、West US2、West Europeの3つのプレビュー リージョンのいずれかにある Azure AI Document Intelligence リソースが必要です。[このドキュメント](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)に従って、まだ持っていない場合は作成してください。`<endpoint>`と`<key>`をパラメーターとして渡します。

%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence

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
