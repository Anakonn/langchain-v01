---
translated: true
---

# Huawei OBS ディレクトリ

次のコードは、Huawei OBS (Object Storage Service) からオブジェクトをドキュメントとしてロードする方法を示しています。

```python
# Install the required package
# pip install esdk-obs-python
```

```python
from langchain_community.document_loaders import OBSDirectoryLoader
```

```python
endpoint = "your-endpoint"
```

```python
# Configure your access credentials\n
config = {"ak": "your-access-key", "sk": "your-secret-key"}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```

```python
loader.load()
```

## 読み込むためのプレフィックスを指定する

バケットから特定のプレフィックスを持つオブジェクトをロードしたい場合は、次のコードを使用できます:

```python
loader = OBSDirectoryLoader(
    "your-bucket-name", endpoint=endpoint, config=config, prefix="test_prefix"
)
```

```python
loader.load()
```

## ECS から認証情報を取得する

langchain がHuawei Cloud ECS にデプロイされており、[Agency が設定されている](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7)場合、ローダーはアクセスキーとシークレットキーを必要とせずに、ECS からセキュリティトークンを直接取得できます。

```python
config = {"get_token_from_ecs": True}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```

```python
loader.load()
```

## パブリックバケットを使用する

バケットのバケットポリシーが匿名アクセスを許可している場合 (匿名ユーザーに `listBucket` と `GetObject` のアクセス許可がある)、`config` パラメーターを設定せずにオブジェクトを直接ロードできます。

```python
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint)
```

```python
loader.load()
```
