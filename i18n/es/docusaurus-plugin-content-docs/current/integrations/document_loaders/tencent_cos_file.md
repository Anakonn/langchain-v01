---
translated: true
---

# Archivo Tencent COS

>[Tencent Cloud Object Storage (COS)](https://www.tencentcloud.com/products/cos) es un servicio de almacenamiento distribuido que le permite almacenar cualquier cantidad de datos desde cualquier lugar a través de los protocolos HTTP/HTTPS.
> `COS` no tiene restricciones en la estructura o formato de los datos. Tampoco tiene límite de tamaño de bucket y
> administración de particiones, lo que lo hace adecuado para prácticamente cualquier caso de uso, como entrega de datos,
> procesamiento de datos y lagos de datos. `COS` proporciona una consola basada en web, SDK y API en varios idiomas,
> herramienta de línea de comandos y herramientas gráficas. Funciona bien con las API de Amazon S3, lo que le permite acceder rápidamente
> a las herramientas y complementos de la comunidad.

Esto cubre cómo cargar el objeto de documento desde un `Archivo Tencent COS`.

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
