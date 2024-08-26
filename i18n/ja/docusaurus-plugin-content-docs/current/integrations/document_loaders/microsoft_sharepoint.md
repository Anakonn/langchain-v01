---
translated: true
---

# Microsoft SharePoint

> [Microsoft SharePoint](https://en.wikipedia.org/wiki/SharePoint)は、ワークフローアプリケーション、「リスト」データベース、およびその他のWebパーツとセキュリティ機能を使用して、ビジネスチームが協力して作業できるようにするウェブサイトベースのコラボレーションシステムです。これはMicrosoftによって開発されました。

このノートブックでは、[SharePointドキュメントライブラリ](https://support.microsoft.com/en-us/office/what-is-a-document-library-3b5976dd-65cf-4c9e-bf5a-713c10ca2872)からドキュメントをロードする方法について説明します。現在、docx、doc、pdfファイルのみがサポートされています。

## 前提条件

1. [Microsoft ID プラットフォーム](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)の指示に従って、アプリケーションを登録します。
2. 登録が完了すると、Azure ポータルにアプリ登録の概要ペインが表示されます。アプリケーション (クライアント) ID が表示されます。これは `client ID` とも呼ばれ、Microsoft ID プラットフォームでアプリケーションを一意に識別する値です。
3. **項目 1** の手順に従う際、リダイレクト URI を `https://login.microsoftonline.com/common/oauth2/nativeclient` に設定できます。
4. **項目 1** の手順に従う際、アプリケーションの秘密の下で新しいパスワード (`client_secret`) を生成します。
5. この[ドキュメント](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope)の指示に従って、アプリケーションに `SCOPES` (`offline_access` と `Sites.Read.All`) を追加します。
6. **ドキュメントライブラリ**からファイルを取得するには、そのIDが必要です。これを取得するには、`テナント名`、`コレクション ID`、`サブサイト ID` の値が必要です。
7. `テナント名`を見つけるには、この[ドキュメント](https://learn.microsoft.com/en-us/azure/active-directory-b2c/tenant-management-read-tenant-name)の指示に従ってください。値を取得したら、`.onmicrosoft.com` を削除し、残りの部分を `テナント名` として保持します。
8. `コレクション ID` と `サブサイト ID` を取得するには、**SharePoint** の `site-name` が必要です。**SharePoint** サイトの URL は `https://<tenant-name>.sharepoint.com/sites/<site-name>` の形式になっています。URL の最後の部分が `site-name` です。
9. サイトの `コレクション ID` を取得するには、ブラウザーで `https://<tenant>.sharepoint.com/sites/<site-name>/_api/site/id` にアクセスし、`Edm.Guid` プロパティの値をコピーします。
10. `サブサイト ID` (またはWeb ID) を取得するには、`https://<tenant>.sharepoint.com/sites/<site-name>/_api/web/id` を使用し、`Edm.Guid` プロパティの値をコピーします。
11. `SharePoint サイト ID` の形式は `<tenant-name>.sharepoint.com,<コレクション ID>,<サブサイト ID>` です。この値を次のステップで使用できるように保持します。
12. [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) にアクセスして、`ドキュメントライブラリ ID` を取得します。最初のステップは、**SharePoint** サイトに関連付けられたアカウントでログインしていることを確認することです。次に、`https://graph.microsoft.com/v1.0/sites/<SharePoint サイト ID>/drive` に要求を行う必要があり、応答にはIDフィールドが含まれており、これが`ドキュメントライブラリ ID`です。

## 🧑 SharePointドキュメントライブラリからのドキュメントの取り込み手順

### 🔑 認証

デフォルトでは、`SharePointLoader` は `O365_CLIENT_ID` および `O365_CLIENT_SECRET` という名前の環境変数にある `CLIENT_ID` および `CLIENT_SECRET` の値を期待します。これらの環境変数は、アプリケーションのルートにある `.env` ファイルを介して渡すことができます。または、スクリプトで次のコマンドを使用できます。

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

このローダーは、[*ユーザーに代わって*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0)と呼ばれる認証を使用します。これは2段階の認証で、ユーザーの同意が必要です。ローダーをインスタンス化すると、ユーザーが必要な許可をアプリに与えるために訪問する必要のあるURLが出力されます。ユーザーはこのURLにアクセスし、アプリケーションに同意を与える必要があります。その後、ユーザーは結果のページURLをコピーし、コンソールに貼り付ける必要があります。メソッドは、ログイン試行が成功した場合にTrueを返します。

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID")
```

認証が完了すると、ローダーは `~/.credentials/` フォルダーに `o365_token.txt` というトークンを保存します。このトークンを使用して、コピー/貼り付けの手順なしで後で認証できます。この認証トークンを使用するには、ローダーのインスタンス化で `auth_with_token` パラメーターを Trueに変更する必要があります。

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
```

### 🗂️ ドキュメントローダー

#### 📑 ドキュメントライブラリディレクトリからのドキュメントのロード

`SharePointLoader` は、ドキュメントライブラリ内の特定のフォルダーからドキュメントをロードできます。たとえば、ドキュメントライブラリの `Documents/marketing` フォルダーに保存されているすべてのドキュメントをロードしたい場合があります。

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", folder_path="Documents/marketing", auth_with_token=True)
documents = loader.load()
```

`Resource not found for the segment` エラーが発生する場合は、[Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)から取得できる `folder_id` を使用してみてください。

```python
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True
                          folder_id="<folder-id>")
documents = loader.load()
```

ルートディレクトリからドキュメントをロードする場合は、`folder_id`、`folder_path`、`documents_ids` を省略できます。その場合、ローダーはルートディレクトリからドキュメントをロードします。

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
documents = loader.load()
```

`recursive=True` と組み合わせることで、SharePointの全体からすべてのドキュメントをロードできます。

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID",
                          recursive=True,
                          auth_with_token=True)
documents = loader.load()
```

#### 📑 ドキュメントのリストからドキュメントをロードする

別の可能性は、ロードしたいドキュメントの `object_id` のリストを提供することです。そのためには、[Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)を照会して、関心のあるすべてのドキュメントIDを見つける必要があります。この[リンク](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources)には、ドキュメントIDを取得するのに役立つエンドポイントのリストが記載されています。

例えば、`data/finance/`フォルダに保存されているすべてのオブジェクトに関する情報を取得するには、`https://graph.microsoft.com/v1.0/drives/<document-library-id>/root:/data/finance:/children`にリクエストを送る必要があります。関心のあるIDのリストが得られたら、次のパラメーターでローダーをインスタンス化できます。

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
