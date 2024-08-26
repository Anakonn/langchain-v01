---
translated: true
---

# Azure AI Document Intelligence

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (旧称 `Azure Form Recognizer`) は、デジタルまたはスキャンされたPDF、画像、Office、HTMLファイルから、テキスト(手書きを含む)、表、文書構造(タイトル、セクション見出しなど)、キーバリューペアを抽出するマシンラーニングベースのサービスです。

>Document Intelligenceは、`PDF`、`JPEG/JPG`、`PNG`、`BMP`、`TIFF`、`HEIF`、`DOCX`、`XLSX`、`PPTX`、`HTML`をサポートしています。

このDocument Intelligenceを使ったローダーの現在の実装では、ページごとにコンテンツを取り込み、LangChainドキュメントに変換できます。デフォルトの出力形式はMarkdownで、`MarkdownHeaderTextSplitter`を使ってセマンティックドキュメントチャンキングを簡単に行えます。`mode="single"`または`mode="page"`を使って、単一ページまたはページ単位で純テキストを返すこともできます。

## 前提条件

**East US**、**West US2**、**West Europe**の3つのプレビュー リージョンのいずれかにある Azure AI Document Intelligence リソースが必要です。[このドキュメント](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)に従って、まだ持っていない場合は作成してください。`<endpoint>`と`<key>`をパラメーターとして渡します。

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

## 例1

最初の例では、ローカルファイルをAzure AI Document Intelligenceに送信します。

ドキュメント分析クライアントを初期化したら、DocumentIntelligenceLoaderのインスタンスを作成できます:

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

デフォルトの出力には、Markdownフォーマットのコンテンツを持つ1つのLangChainドキュメントが含まれています:

```python
documents
```

## 例2

入力ファイルは公開URLパスでも構いません。例: https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/rest-api/layout.png

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

## 例3

`mode="page"`を指定して、ページごとにドキュメントを読み込むこともできます。

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

出力は、リストの中に個別のドキュメントとして格納されたページになります:

```python
for document in documents:
    print(f"Page Content: {document.page_content}")
    print(f"Metadata: {document.metadata}")
```

## 例4

`analysis_feature=["ocrHighResolution"]`を指定して、追加機能を有効にすることもできます。詳細については、https://aka.ms/azsdk/python/documentintelligence/analysisfeature をご覧ください。

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

出力には、高解像度の追加機能で認識されたLangChainドキュメントが含まれています:

```python
documents
```
