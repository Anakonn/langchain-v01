---
translated: true
---

# Huawei OBS Directory

El siguiente código demuestra cómo cargar objetos del Huawei OBS (Object Storage Service) como documentos.

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

## Especificar un prefijo para cargar

Si desea cargar objetos con un prefijo específico desde el bucket, puede usar el siguiente código:

```python
loader = OBSDirectoryLoader(
    "your-bucket-name", endpoint=endpoint, config=config, prefix="test_prefix"
)
```

```python
loader.load()
```

## Obtener información de autenticación de ECS

Si su langchain se implementa en Huawei Cloud ECS y [se ha configurado Agency](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7), el cargador puede obtener directamente el token de seguridad de ECS sin necesidad de una clave de acceso y una clave secreta.

```python
config = {"get_token_from_ecs": True}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```

```python
loader.load()
```

## Usar un bucket público

Si la política de bucket de su bucket permite el acceso anónimo (los usuarios anónimos tienen permisos `listBucket` y `GetObject`), puede cargar directamente los objetos sin configurar el parámetro `config`.

```python
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint)
```

```python
loader.load()
```
