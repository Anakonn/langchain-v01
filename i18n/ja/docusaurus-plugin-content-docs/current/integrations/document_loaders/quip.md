---
translated: true
---

# Quip

>[Quip](https://quip.com)は、モバイルおよびWebのための共同生産性ソフトウェアスイートです。グループの人々が、通常ビジネス目的で、文書とスプレッドシートを共同で作成および編集できるようにします。

`Quip`ドキュメントのローダー。

個人アクセストークンの取得方法については、[こちら](https://quip.com/dev/automation/documentation/current#section/Authentication/Get-Access-to-Quip's-APIs)を参照してください。

`folder_ids`および/または`thread_ids`のリストを指定して、対応するドキュメントをDocument オブジェクトにロードします。両方が指定されている場合、ローダーは`folder_ids`に基づいて、すべての`thread_ids`を取得し、渡された`thread_ids`と組み合わせます。両方のセットの和集合が返されます。

* `folder_id`の取得方法:
  Quipフォルダーに移動し、右クリックしてリンクをコピーし、リンクの末尾の部分を`folder_id`として抽出します。ヒント: `https://example.quip.com/<folder_id>`
* `thread_id`の取得方法:
  `thread_id`はドキュメントIDです。Quipドキュメントに移動し、右クリックしてリンクをコピーし、リンクの末尾の部分を`thread_id`として抽出します。ヒント: `https://exmaple.quip.com/<thread_id>`

`include_all_folders`を`True`に設定すると、`group_folder_ids`も取得されます。
`include_attachments`を`True`に設定すると、添付ファイルがすべてダウンロードされ、QuipLoaderがそれらのテキストをDocument オブジェクトに追加します。現在サポートされている添付ファイルの種類は: `PDF`、`PNG`、`JPEG/JPG`、`SVG`、`Word`、`Excel`です。
`include_comments`を`True`に設定すると、ドキュメントのコメントがすべて取得され、QuipLoaderがそれらをDocument オブジェクトに追加します。

QuipLoaderを使用する前に、最新バージョンのquip-apiパッケージがインストールされていることを確認してください。

```python
%pip install --upgrade --quiet  quip-api
```

## 例

### 個人アクセストークン

```python
from langchain_community.document_loaders.quip import QuipLoader

loader = QuipLoader(
    api_url="https://platform.quip.com", access_token="change_me", request_timeout=60
)
documents = loader.load(
    folder_ids={"123", "456"},
    thread_ids={"abc", "efg"},
    include_attachments=False,
    include_comments=False,
)
```
