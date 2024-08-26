---
translated: true
---

# Confluence

>[Confluence](https://www.atlassian.com/software/confluence)は、プロジェクト関連のすべての資料を保存および整理するウィキ型のコラボレーションプラットフォームです。`Confluence`は、主にコンテンツ管理活動を行う知識ベースです。

`Confluence`ページのローダー。

現在、`username/api_key`、`Oauth2 login`をサポートしています。さらに、オンプレミスのインストールでは、`token`認証もサポートしています。

`page_id`-sおよび/または`space_key`のリストを指定して、対応するページをDocument objectsにロードします。両方が指定されている場合は、両方のセットの和集合が返されます。

`include_attachments`というブール値を指定して、添付ファイルを含めることもできます。これはデフォルトでFalseに設定されていますが、Trueに設定すると、すべての添付ファイルがダウンロードされ、ConfluenceReaderがそれらのテキストを抽出してDocument objectに追加します。現在サポートされている添付ファイルの種類は、`PDF`、`PNG`、`JPEG/JPG`、`SVG`、`Word`、`Excel`です。

ヒント: `space_key`と`page_id`は、ConfluenceのページのURLから見つけることができます - https://yoursite.atlassian.com/wiki/spaces/<space_key>/pages/<page_id>

ConfluenceLoaderを使用する前に、atlassian-python-apiパッケージの最新バージョンがインストールされていることを確認してください。

```python
%pip install --upgrade --quiet  atlassian-python-api
```

## 例

### ユーザー名とパスワード、またはユーザー名とAPIトークン(Atlassian Cloudのみ)

この例では、ユーザー名とパスワード、またはAtlassian Cloudホスト版のConfluenceに接続する場合はユーザー名とAPIトークンを使用して認証します。
APIトークンは https://id.atlassian.com/manage-profile/security/api-tokens で生成できます。

`limit`パラメーターは、一度に取得するドキュメントの数を指定するものであり、合計で取得するドキュメントの数ではありません。
デフォルトでは、コードは1回の呼び出しで最大1000件のドキュメントを50件ずつ返します。合計のドキュメント数を制御するには、`max_pages`パラメーターを使用します。
atlassian-python-apiパッケージの`limit`パラメーターの最大値は現在100です。

```python
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(
    url="https://yoursite.atlassian.com/wiki", username="me", api_key="12345"
)
documents = loader.load(space_key="SPACE", include_attachments=True, limit=50)
```

### パーソナルアクセストークン(サーバー/オンプレミスのみ)

このメソッドは、データセンター/サーバーオンプレミスエディションでのみ有効です。
パーソナルアクセストークン(PAT)の生成方法については、Confluenceの公式ドキュメントを参照してください: https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html。
PATを使用する場合は、トークン値のみを提供し、ユーザー名は提供できません。
ConfluenceLoaderは、PATを生成したユーザーの権限で実行され、そのユーザーがアクセス権を持つドキュメントのみをロードできることに注意してください。

```python
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(url="https://yoursite.atlassian.com/wiki", token="12345")
documents = loader.load(
    space_key="SPACE", include_attachments=True, limit=50, max_pages=50
)
```
