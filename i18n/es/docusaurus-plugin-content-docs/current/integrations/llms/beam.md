---
translated: true
---

# Haz una llamada

Llama al wrapper de la API de Beam para implementar y hacer llamadas posteriores a una instancia del LLM gpt2 en una implementación en la nube. Requiere la instalación de la biblioteca Beam y el registro del ID de cliente y el secreto de cliente de Beam. Al llamar al wrapper, se crea y se ejecuta una instancia del modelo, con el texto devuelto relacionado con el mensaje. Luego se pueden hacer llamadas adicionales llamando directamente a la API de Beam.

[Crea una cuenta](https://www.beam.cloud/), si aún no tienes una. Obtén tus claves API del [panel de control](https://www.beam.cloud/dashboard/settings/api-keys).

Instala la CLI de Beam

```python
!curl https://raw.githubusercontent.com/slai-labs/get-beam/main/get-beam.sh -sSfL | sh
```

Registra las claves API y establece tus variables de entorno de ID de cliente y secreto de cliente de Beam:

```python
import os

beam_client_id = "<Your beam client id>"
beam_client_secret = "<Your beam client secret>"

# Set the environment variables
os.environ["BEAM_CLIENT_ID"] = beam_client_id
os.environ["BEAM_CLIENT_SECRET"] = beam_client_secret

# Run the beam configure command
!beam configure --clientId={beam_client_id} --clientSecret={beam_client_secret}
```

Instala el SDK de Beam:

```python
%pip install --upgrade --quiet  beam-sdk
```

**¡Implementa y llama a Beam directamente desde langchain!**

¡Ten en cuenta que un inicio en frío puede tardar un par de minutos en devolver la respuesta, pero las llamadas posteriores serán más rápidas!

```python
from langchain_community.llms.beam import Beam

llm = Beam(
    model_name="gpt2",
    name="langchain-gpt2-test",
    cpu=8,
    memory="32Gi",
    gpu="A10G",
    python_version="python3.8",
    python_packages=[
        "diffusers[torch]>=0.10",
        "transformers",
        "torch",
        "pillow",
        "accelerate",
        "safetensors",
        "xformers",
    ],
    max_length="50",
    verbose=False,
)

llm._deploy()

response = llm._call("Running machine learning on a remote GPU")

print(response)
```
