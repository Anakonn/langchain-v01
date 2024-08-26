---
sidebar_label: Alibaba Cloud PAI EAS
translated: true
---

# Alibaba Cloud PAI EAS

>[Alibaba Cloud PAI (Platform for AI)](https://www.alibabacloud.com/help/en/pai/?spm=a2c63.p38356.0.0.c26a426ckrxUwZ) es una plataforma de aprendizaje automático ligera y rentable que utiliza tecnologías nativas de la nube. Proporciona un servicio de modelado de extremo a extremo. Acelera el entrenamiento de modelos basado en decenas de miles de millones de características y cientos de miles de millones de muestras en más de 100 escenarios.

>[Machine Learning Platform for AI de Alibaba Cloud](https://www.alibabacloud.com/help/en/machine-learning-platform-for-ai/latest/what-is-machine-learning-pai) es una plataforma de ingeniería de aprendizaje automático o aprendizaje profundo destinada a empresas y desarrolladores. Proporciona complementos fáciles de usar, rentables, de alto rendimiento y fáciles de escalar que se pueden aplicar a diversos escenarios industriales. Con más de 140 algoritmos de optimización integrados, `Machine Learning Platform for AI` proporciona capacidades de ingeniería de IA de todo el proceso, incluido el etiquetado de datos (`PAI-iTAG`), la construcción de modelos (`PAI-Designer` y `PAI-DSW`), el entrenamiento de modelos (`PAI-DLC`), la optimización de la compilación y el despliegue de inferencia (`PAI-EAS`).

>`PAI-EAS` admite diferentes tipos de recursos de hardware, incluidos CPU y GPU, y se caracteriza por un alto rendimiento y baja latencia. Le permite implementar modelos complejos a gran escala con unos pocos clics y realizar ampliaciones y reducciones elásticas en tiempo real. También proporciona un sistema integral de O&M y monitoreo.

## Configurar el servicio EAS

Establezca las variables de entorno para inicializar la URL del servicio EAS y el token.
Utilice [este documento](https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/) para obtener más información.

```bash
export EAS_SERVICE_URL=XXX
export EAS_SERVICE_TOKEN=XXX
```

Otra opción es usar este código:

```python
import os

from langchain_community.chat_models import PaiEasChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
chat = PaiEasChatEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

## Ejecutar el modelo de chat

Puede usar la configuración predeterminada para llamar al servicio EAS de la siguiente manera:

```python
output = chat.invoke([HumanMessage(content="write a funny joke")])
print("output:", output)
```

O bien, llamar al servicio EAS con nuevos parámetros de inferencia:

```python
kwargs = {"temperature": 0.8, "top_p": 0.8, "top_k": 5}
output = chat.invoke([HumanMessage(content="write a funny joke")], **kwargs)
print("output:", output)
```

O bien, ejecutar una llamada de flujo para obtener una respuesta de flujo:

```python
outputs = chat.stream([HumanMessage(content="hi")], streaming=True)
for output in outputs:
    print("stream output:", output)
```
