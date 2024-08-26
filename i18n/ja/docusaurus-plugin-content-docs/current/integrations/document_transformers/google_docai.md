---
translated: true
---

# Google Cloud Document AI

Document AI は、Google Cloud からのドキュメント理解プラットフォームで、ドキュメントの非構造化データを構造化データに変換し、理解、分析、消費を容易にします。

詳細:

- [Document AI の概要](https://cloud.google.com/document-ai/docs/overview)
- [Document AI のビデオとラボ](https://cloud.google.com/document-ai/docs/videos)
- [試してみる!](https://cloud.google.com/document-ai/docs/drag-and-drop)

このモジュールには、Google Cloud の DocAI に基づいた `PDF` パーサーが含まれています。

このパーサーを使用するには、2つのライブラリをインストールする必要があります:

```python
%pip install --upgrade --quiet  langchain-google-community[docai]
```

まず、Google Cloud Storage (GCS) バケットを設定し、ここに説明されているように独自の光学文字認識 (OCR) プロセッサーを作成する必要があります: https://cloud.google.com/document-ai/docs/create-processor

`GCS_OUTPUT_PATH` は GCS のフォルダへのパス (`gs://` から始まる) で、`PROCESSOR_NAME` は `projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID` または `projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID/processorVersions/PROCESSOR_VERSION_ID` のようになります。これは、プログラムで取得するか、Google Cloud Console の `Processor details` タブの `Prediction endpoint` セクションからコピーできます。

```python
GCS_OUTPUT_PATH = "gs://BUCKET_NAME/FOLDER_PATH"
PROCESSOR_NAME = "projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID"
```

```python
from langchain_core.document_loaders.blob_loaders import Blob
from langchain_google_community import DocAIParser
```

次に、`DocAIParser` を作成します。

```python
parser = DocAIParser(
    location="us", processor_name=PROCESSOR_NAME, gcs_output_path=GCS_OUTPUT_PATH
)
```

この例では、公開 GCS バケットにアップロードされた Alphabet の決算報告書を使用できます。

[2022Q1_alphabet_earnings_release.pdf](https://storage.googleapis.com/cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/2022Q1_alphabet_earnings_release.pdf)

ドキュメントを `lazy_parse()` メソッドに渡します。

```python
blob = Blob(
    path="gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/2022Q1_alphabet_earnings_release.pdf"
)
```

ページごとに 1 つのドキュメントが得られ、合計 11 個です:

```python
docs = list(parser.lazy_parse(blob))
print(len(docs))
```

```output
11
```

ブロブを 1 つずつ端から端まで解析することができます。ドキュメントが多数ある場合は、まとめてバッチ処理し、解析処理を処理結果の処理から切り離すのがよいアプローチかもしれません。

```python
operations = parser.docai_parse([blob])
print([op.operation.name for op in operations])
```

```output
['projects/543079149601/locations/us/operations/16447136779727347991']
```

操作が完了したかどうかを確認できます:

```python
parser.is_running(operations)
```

```output
True
```

そして、操作が完了したら、結果を解析できます:

```python
parser.is_running(operations)
```

```output
False
```

```python
results = parser.get_results(operations)
print(results[0])
```

```output
DocAIParsingResults(source_path='gs://vertex-pgt/examples/goog-exhibit-99-1-q1-2023-19.pdf', parsed_path='gs://vertex-pgt/test/run1/16447136779727347991/0')
```

最後に、解析結果からドキュメントを生成できます:

```python
docs = list(parser.parse_from_results(results))
```

```python
print(len(docs))
```

```output
11
```
