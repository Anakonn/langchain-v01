---
translated: true
---

# Huawei OBS 디렉토리

다음 코드는 Huawei OBS(Object Storage Service)에서 문서로 객체를 로드하는 방법을 보여줍니다.

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

## 로드할 접두사 지정

버킷에서 특정 접두사를 가진 객체를 로드하려면 다음 코드를 사용할 수 있습니다:

```python
loader = OBSDirectoryLoader(
    "your-bucket-name", endpoint=endpoint, config=config, prefix="test_prefix"
)
```

```python
loader.load()
```

## ECS에서 인증 정보 가져오기

langchain이 Huawei Cloud ECS에 배포되어 있고 [Agency가 설정](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7)된 경우, 로더가 액세스 키와 비밀 키를 구성할 필요 없이 ECS에서 보안 토큰을 직접 가져올 수 있습니다.

```python
config = {"get_token_from_ecs": True}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```

```python
loader.load()
```

## 공개 버킷 사용

버킷의 버킷 정책이 익명 액세스를 허용하는 경우(익명 사용자에게 `listBucket` 및 `GetObject` 권한이 있음), `config` 매개변수를 구성하지 않고도 객체를 직접 로드할 수 있습니다.

```python
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint)
```

```python
loader.load()
```
