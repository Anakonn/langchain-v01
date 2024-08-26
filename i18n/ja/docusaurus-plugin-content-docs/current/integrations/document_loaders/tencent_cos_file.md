---
translated: true
---

# Tencent COS ファイル

>[Tencent Cloud Object Storage (COS)](https://www.tencentcloud.com/products/cos)は、HTTP/HTTPSプロトコルを使用して、どこからでもデータを保存できる分散型ストレージサービスです。
>`COS`にはデータ構造やフォーマットの制限はありません。バケットサイズの制限やパーティション管理もないため、データ配信、データ処理、データレイクなど、あらゆるユースケースに適しています。`COS`には、Webベースのコンソール、マルチ言語のSDKとAPI、コマンドラインツール、グラフィカルツールが用意されています。Amazon S3 APIとも連携するため、コミュニティツールやプラグインを素早くアクセスできます。

これは、`Tencent COS ファイル`からドキュメントオブジェクトをロードする方法について説明しています。

```python
%pip install --upgrade --quiet  cos-python-sdk-v5
```

```python
from langchain_community.document_loaders import TencentCOSFileLoader
from qcloud_cos import CosConfig
```

```python
conf = CosConfig(
    Region="your cos region",
    SecretId="your cos secret_id",
    SecretKey="your cos secret_key",
)
loader = TencentCOSFileLoader(conf=conf, bucket="you_cos_bucket", key="fake.docx")
```

```python
loader.load()
```
