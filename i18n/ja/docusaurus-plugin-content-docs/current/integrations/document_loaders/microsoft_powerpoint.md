---
translated: true
---

# Microsoft PowerPoint

>[Microsoft PowerPoint](https://en.wikipedia.org/wiki/Microsoft_PowerPoint) は、Microsoft によるプレゼンテーションプログラムです。

これは、`Microsoft PowerPoint` ドキュメントをダウンストリームで使用できるドキュメント形式にロードする方法について説明しています。

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

### 要素の保持

内部的に、`Unstructured` は、テキストの異なる部分に対して異なる "要素" を作成します。デフォルトでは、それらを組み合わせますが、`mode="elements"` を指定することで、その分離を簡単に維持できます。

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

## Azure AI Document Intelligence の使用

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (以前は `Azure Form Recognizer` として知られていた) は、機械学習ベースのサービスで、デジタルまたはスキャンされた PDF、画像、Office、HTML ファイルからテキスト (手書きを含む)、表、ドキュメント構造 (タイトル、セクション見出しなど) およびキーバリューペアを抽出します。
>
>Document Intelligence は `PDF`、`JPEG/JPG`、`PNG`、`BMP`、`TIFF`、`HEIF`、`DOCX`、`XLSX`、`PPTX` および `HTML` をサポートしています。

この `Document Intelligence` を使ったローダーの現在の実装では、ページごとにコンテンツを取り込み、それを LangChain ドキュメントに変換できます。デフォルトの出力形式はマークダウンで、`MarkdownHeaderTextSplitter` を使ってセマンティックなドキュメントチャンキングを簡単に行えます。`mode="single"` または `mode="page"` を使って、ページごとの純テキストを返すこともできます。

## 前提条件

**East US**、**West US2**、**West Europe** の 3 つのプレビュー リージョンのいずれかに Azure AI Document Intelligence リソースが必要です。ない場合は、[このドキュメント](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) に従って作成してください。`<endpoint>` と `<key>` をパラメーターとしてローダーに渡します。

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
