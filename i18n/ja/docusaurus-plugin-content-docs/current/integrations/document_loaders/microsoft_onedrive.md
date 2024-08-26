---
translated: true
---

# Microsoft OneDrive

>[Microsoft OneDrive](https://en.wikipedia.org/wiki/OneDrive) (旧 `SkyDrive`) は、Microsoft が運営するファイルホスティングサービスです。

このノートブックでは、`OneDrive`からドキュメントをロードする方法を説明します。現在、docx、doc、pdfファイルのみがサポートされています。

## 前提条件

1. [Microsoft identity platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)の手順に従って、アプリケーションを登録してください。
2. 登録が完了すると、Azure ポータルにアプリケーション登録の概要ページが表示されます。ここで、アプリケーション(クライアント) ID が確認できます。これは、`クライアントID`とも呼ばれ、Microsoft identity platform 内であなたのアプリケーションを一意に識別するための値です。
3. **項目1**の手順に従う際、リダイレクト URI を `http://localhost:8000/callback` に設定できます。
4. **項目1**の手順に従う際、アプリケーションの秘密キー(「`client_secret`」)を生成してください。
5. この[ドキュメント](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope)の手順に従って、アプリケーションに `SCOPES` (`offline_access` と `Files.Read.All`) を追加してください。
6. [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer)にアクセスして、`OneDrive ID`を取得してください。最初のステップは、OneDrive アカウントに関連付けられたアカウントでログインすることです。次に、`https://graph.microsoft.com/v1.0/me/drive`へリクエストを行う必要があり、レスポンスには`id`フィールドが含まれており、これがOneDriveアカウントのIDになります。
7. `o365`パッケージをインストールするには、`pip install o365`コマンドを使用してください。
8. 以下の値を取得する必要があります:
- `CLIENT_ID`
- `CLIENT_SECRET`
- `DRIVE_ID`

## 🧑 OneDriveからドキュメントをインジェストするための手順

### 🔑 認証

デフォルトでは、`OneDriveLoader`は`O365_CLIENT_ID`と`O365_CLIENT_SECRET`という名前の環境変数にそれぞれ`CLIENT_ID`と`CLIENT_SECRET`の値が格納されていることを想定しています。これらの環境変数は、アプリケーションのルートにある`.env`ファイルを使用するか、以下のようなコマンドを使用してスクリプトに渡すことができます。

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

このローダーは、[*ユーザーに代わって*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0)と呼ばれる認証方式を使用しています。これは2段階の認証で、ユーザーの同意が必要です。ローダーをインスタンス化すると、ユーザーが同意を与える必要があるURLが表示されます。ユーザーはこのURLにアクセスし、アプリケーションに必要な権限を許可する必要があります。その後、ユーザーは結果のページのURLをコピーし、コンソールに貼り付ける必要があります。メソッドは、ログイン試行が成功した場合にTrueを返します。

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID")
```

認証が完了すると、ローダーは`~/.credentials/`フォルダーに`o365_token.txt`というトークンを保存します。このトークンを使用して、コピー/貼り付けの手順なしで後で認証することができます。このトークンを使用して認証するには、ローダーのインスタンス化時に`auth_with_token`パラメーターをTrueに変更する必要があります。

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", auth_with_token=True)
```

### 🗂️ ドキュメントローダー

#### 📑 OneDriveのディレクトリからドキュメントをロードする

`OneDriveLoader`は、OneDrive内の特定のフォルダーからドキュメントをロードできます。例えば、`Documents/clients`フォルダー内のすべてのドキュメントをロードしたい場合は、以下のように行います。

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", folder_path="Documents/clients", auth_with_token=True)
documents = loader.load()
```

#### 📑 ドキュメントIDのリストからドキュメントをロードする

もう一つの方法は、ロードしたいドキュメントの`object_id`のリストを提供することです。そのためには、[Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)を使用してドキュメントIDを見つける必要があります。この[リンク](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources)には、ドキュメントIDを取得するのに役立つエンドポイントの一覧が掲載されています。

例えば、ドキュメントフォルダーのルートに格納されているすべてのオブジェクトに関する情報を取得するには、`https://graph.microsoft.com/v1.0/drives/{YOUR DRIVE ID}/root/children`にリクエストを送る必要があります。ご興味のあるIDのリストが得られたら、以下のパラメーターでローダーをインスタンス化することができます。

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
