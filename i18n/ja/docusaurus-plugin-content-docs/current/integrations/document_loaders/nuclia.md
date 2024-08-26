---
translated: true
---

# Nuclia

>[Nuclia](https://nuclia.com) は、内部および外部のあらゆる情報源から非構造化データを自動的にインデックス化し、最適化された検索結果と生成された回答を提供します。ビデオやオーディオの文字起こし、画像コンテンツの抽出、ドキュメントの解析などに対応しています。

>`Nuclia Understanding API` は、テキスト、Webページ、ドキュメント、オーディオ/ビデオコンテンツなどの非構造化データの処理をサポートしています。必要に応じて音声認識やOCRを使って、あらゆる場所のテキストを抽出します。また、メタデータ、埋め込みファイル(PDFの画像など)、Webリンクも抽出します。機械学習が有効な場合は、エンティティの識別、コンテンツの要約、すべての文章のエンベディングの生成も行います。

## セットアップ

`Nuclia Understanding API` を使用するには、Nucliaアカウントが必要です。[https://nuclia.cloud](https://nuclia.cloud) で無料で作成でき、[NUAキーを作成](https://docs.nuclia.dev/docs/docs/using/understanding/intro)することができます。

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

## 例

Nucliaドキュメントローダーを使用するには、`NucliaUnderstandingAPI` ツールをインスタンス化する必要があります:

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

```python
from langchain_community.document_loaders.nuclia import NucliaLoader

loader = NucliaLoader("./interview.mp4", nua)
```

ドキュメントが取得されるまで、`load` メソッドを繰り返し呼び出すことができます。

```python
import time

pending = True
while pending:
    time.sleep(15)
    docs = loader.load()
    if len(docs) > 0:
        print(docs[0].page_content)
        print(docs[0].metadata)
        pending = False
    else:
        print("waiting...")
```

## 取得される情報

Nucliaは以下の情報を返します:

- ファイルのメタデータ
- 抽出されたテキスト
- 埋め込まれたテキスト(画像内のテキストなど)
- 段落や文の分割(最初と最後の文字位置、ビデオやオーディオファイルの開始時間と終了時間)
- リンク
- サムネイル
- 埋め込みファイル

注意:

  生成されたファイル(サムネイル、抽出された埋め込みファイルなど)はトークンで提供されます。[`/processing/download` エンドポイント](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get)を使ってダウンロードできます。

  また、どのレベルでも属性のサイズが一定以上の場合、ダウンロード可能なファイルに格納され、ドキュメントの中では`{"file": {"uri": "JWT_TOKEN"}}`というファイルポインタに置き換えられます。メッセージのサイズが1,000,000文字を超える場合、最初にベクトルの圧縮が行われ、それでも足りない場合はメタデータ、最後に抽出されたテキストの圧縮が行われます。
