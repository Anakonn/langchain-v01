---
translated: true
---

# Huawei OBS ファイル

次のコードは、Huawei OBS (Object Storage Service) からオブジェクトをロードする方法を示しています。

```python
# Install the required package
# pip install esdk-obs-python
```

```python
from langchain_community.document_loaders.obs_file import OBSFileLoader
```

```python
endpoint = "your-endpoint"
```

```python
from obs import ObsClient

obs_client = ObsClient(
    access_key_id="your-access-key",
    secret_access_key="your-secret-key",
    server=endpoint,
)
loader = OBSFileLoader("your-bucket-name", "your-object-key", client=obs_client)
```

```python
loader.load()
```

## 個別の認証情報を持つローダー

OBS接続を異なるローダー間で再利用する必要がない場合は、`config`を直接設定できます。ローダーはこの設定情報を使用して独自のOBSクライアントを初期化します。

```python
# Configure your access credentials\n
config = {"ak": "your-access-key", "sk": "your-secret-key"}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```

```python
loader.load()
```

## ECSから認証情報を取得する

langchainがHuawei Cloud ECSにデプロイされ、[Agency が設定されている](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7)場合、ローダーはアクセスキーとシークレットキーを設定せずに、ECSからセキュリティトークンを直接取得できます。

```python
config = {"get_token_from_ecs": True}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```

```python
loader.load()
```

## 公開アクセス可能なオブジェクトにアクセスする

アクセスしたいオブジェクトが匿名ユーザーアクセスを許可している (匿名ユーザーに`GetObject`権限がある) 場合は、`config`パラメーターを設定せずにオブジェクトを直接ロードできます。

```python
loader = OBSFileLoader("your-bucket-name", "your-object-key", endpoint=endpoint)
```

```python
loader.load()
```
