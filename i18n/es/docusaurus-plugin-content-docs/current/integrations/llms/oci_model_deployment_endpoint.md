---
translated: true
---

# Punto final de implementación del modelo de ciencia de datos de OCI

[OCI Data Science](https://docs.oracle.com/en-us/iaas/data-science/using/home.htm) es una plataforma totalmente administrada y sin servidor para que los equipos de ciencia de datos construyan, entrenen y administren modelos de aprendizaje automático en la infraestructura de Oracle Cloud.

Este cuaderno analiza cómo usar un LLM alojado en un [OCI Data Science Model Deployment](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-about.htm).

Para autenticarse, se ha utilizado [oracle-ads](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html) para cargar automáticamente las credenciales para invocar el punto final.

```python
!pip3 install oracle-ads
```

## Requisito previo

### Implementar modelo

Consulte [Oracle GitHub samples repository](https://github.com/oracle-samples/oci-data-science-ai-samples/tree/main/model-deployment/containers/llama2) sobre cómo implementar su llm en la implementación del modelo de ciencia de datos de OCI.

### Políticas

Asegúrese de tener las [políticas](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-policies-auth.htm#model_dep_policies_auth__predict-endpoint) requeridas para acceder al punto final de implementación del modelo de ciencia de datos de OCI.

## Configurar

### vLLM

Después de haber implementado el modelo, debe configurar los siguientes parámetros requeridos de la llamada `OCIModelDeploymentVLLM`:

- **`endpoint`**: El punto final HTTP del modelo de la implementación del modelo, p. ej. `https://<MD_OCID>/predict`.
- **`model`**: La ubicación del modelo.

### Inferencia de generación de texto (TGI)

Debe configurar los siguientes parámetros requeridos de la llamada `OCIModelDeploymentTGI`:

- **`endpoint`**: El punto final HTTP del modelo de la implementación del modelo, p. ej. `https://<MD_OCID>/predict`.

### Autenticación

Puede configurar la autenticación a través de ads o variables de entorno. Cuando trabaje en la sesión de cuaderno de ciencia de datos de OCI, puede aprovechar el principio de recursos para acceder a otros recursos de OCI. Consulte [aquí](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html) para ver más opciones.

## Ejemplo

```python
import ads
from langchain_community.llms import OCIModelDeploymentVLLM

# Set authentication through ads
# Use resource principal are operating within a
# OCI service that has resource principal based
# authentication configured
ads.set_auth("resource_principal")

# Create an instance of OCI Model Deployment Endpoint
# Replace the endpoint uri and model name with your own
llm = OCIModelDeploymentVLLM(endpoint="https://<MD_OCID>/predict", model="model_name")

# Run the LLM
llm.invoke("Who is the first president of United States?")
```

```python
import os

from langchain_community.llms import OCIModelDeploymentTGI

# Set authentication through environment variables
# Use API Key setup when you are working from a local
# workstation or on platform which does not support
# resource principals.
os.environ["OCI_IAM_TYPE"] = "api_key"
os.environ["OCI_CONFIG_PROFILE"] = "default"
os.environ["OCI_CONFIG_LOCATION"] = "~/.oci"

# Set endpoint through environment variables
# Replace the endpoint uri with your own
os.environ["OCI_LLM_ENDPOINT"] = "https://<MD_OCID>/predict"

# Create an instance of OCI Model Deployment Endpoint
llm = OCIModelDeploymentTGI()

# Run the LLM
llm.invoke("Who is the first president of United States?")
```
