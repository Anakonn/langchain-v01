---
translated: true
---

# Huawei OBS 파일

다음 코드는 Huawei OBS(Object Storage Service)에서 문서로 객체를 로드하는 방법을 보여줍니다.

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

## 각 로더에 별도의 인증 정보

OBS 연결을 다른 로더 간에 재사용할 필요가 없는 경우 `config`를 직접 구성할 수 있습니다. 로더는 구성 정보를 사용하여 자체 OBS 클라이언트를 초기화합니다.

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

## ECS에서 인증 정보 가져오기

Langchain이 Huawei Cloud ECS에 배포되고 [Agency가 설정](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7)된 경우 로더가 액세스 키와 비밀 키 없이 ECS에서 보안 토큰을 직접 가져올 수 있습니다.

```python
config = {"get_token_from_ecs": True}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```

```python
loader.load()
```

## 공개적으로 액세스 가능한 객체 액세스

액세스하려는 객체에 익명 사용자 액세스가 허용되는 경우(익명 사용자에게 `GetObject` 권한이 있음), `config` 매개변수를 구성하지 않고 객체를 직접 로드할 수 있습니다.

```python
loader = OBSFileLoader("your-bucket-name", "your-object-key", endpoint=endpoint)
```

```python
loader.load()
```
