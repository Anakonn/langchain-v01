---
translated: true
---

# Tencent COS 파일

>[Tencent Cloud Object Storage (COS)](https://www.tencentcloud.com/products/cos)는 HTTP/HTTPS 프로토콜을 통해 어디서든 데이터를 저장할 수 있는 분산 저장 서비스입니다.
> `COS`에는 데이터 구조 또는 형식에 대한 제한이 없습니다. 또한 버킷 크기 제한 및 파티션 관리가 없어 데이터 전송, 데이터 처리, 데이터 레이크 등 다양한 사용 사례에 적합합니다. `COS`는 웹 기반 콘솔, 다국어 SDK와 API, 명령줄 도구, 그래픽 도구를 제공합니다. Amazon S3 API와 호환되어 커뮤니티 도구와 플러그인을 빠르게 사용할 수 있습니다.

이 문서에서는 `Tencent COS 파일`에서 문서 객체를 로드하는 방법을 다룹니다.

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
