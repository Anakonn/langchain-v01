---
translated: true
---

# Nuclia の理解

>[Nuclia](https://nuclia.com)は、内部および外部のあらゆる情報源から非構造化データを自動的にインデックス化し、最適化された検索結果と生成された回答を提供します。ビデオおよびオーディオの文字起こし、画像コンテンツの抽出、ドキュメントの解析などに対応しています。

`Nuclia Understanding API`は、テキスト、Webページ、ドキュメント、オーディオ/ビデオコンテンツなどの非構造化データの処理をサポートしています。必要に応じて音声認識やOCRを使用して、あらゆる場所のテキストを抽出し、エンティティを識別し、メタデータ、埋め込みファイル(PDFの画像など)、Webリンクも抽出します。また、コンテンツの要約も提供します。

`Nuclia Understanding API`を使用するには、`Nuclia`アカウントが必要です。[https://nuclia.cloud](https://nuclia.cloud)で無料で作成でき、[NUAキーを作成](https://docs.nuclia.dev/docs/docs/using/understanding/intro)することができます。

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

`push`アクションを使用して、Nuclia Understanding APIにファイルをプッシュできます。処理は非同期で行われるため、ファイルがプッシュされた順序と結果が返される順序が異なる可能性があります。そのため、結果を対応するファイルにマッチさせるために`id`を提供する必要があります。

```python
nua.run({"action": "push", "id": "1", "path": "./report.docx"})
nua.run({"action": "push", "id": "2", "path": "./interview.mp4"})
```

`pull`アクションをループで呼び出して、JSON形式の結果を取得できます。

```python
import time

pending = True
data = None
while pending:
    time.sleep(15)
    data = nua.run({"action": "pull", "id": "1", "path": None})
    if data:
        print(data)
        pending = False
    else:
        print("waiting...")
```

`async`モードで一度に行うこともできます。プッシュするだけで、結果が取得されるまで待機します。

```python
import asyncio


async def process():
    data = await nua.arun(
        {"action": "push", "id": "1", "path": "./talk.mp4", "text": None}
    )
    print(data)


asyncio.run(process())
```

## 取得される情報

Nucliaは以下の情報を返します:

- ファイルのメタデータ
- 抽出されたテキスト
- (画像の中のテキストなど)ネストされたテキスト
- 要約(ただし`enable_ml`が`True`の場合のみ)
- 段落および文の分割(最初と最後の文字位置、ビデオやオーディオファイルの場合はstart timeとend time)
- 固有表現:人物、日付、場所、組織など(ただし`enable_ml`が`True`の場合のみ)
- リンク
- サムネイル
- 埋め込みファイル
- テキストのベクトル表現(ただし`enable_ml`が`True`の場合のみ)

注意:

  生成されたファイル(サムネイル、抽出された埋め込みファイルなど)はトークンで提供されます。[`/processing/download`エンドポイント](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get)でダウンロードできます。

  また、どのレベルでも属性のサイズが一定以上の場合、ダウンロード可能なファイルに格納され、ドキュメント内では`{"file": {"uri": "JWT_TOKEN"}}`というファイルポインタに置き換えられます。メッセージサイズが1000000文字を超える場合、まずベクトルの圧縮を行い、それでも足りない場合はメタデータの大きなフィールド、最後にテキストの抽出部分を圧縮します。
