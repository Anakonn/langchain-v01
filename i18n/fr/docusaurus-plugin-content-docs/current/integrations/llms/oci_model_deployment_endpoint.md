---
translated: true
---

# Point de terminaison de déploiement du modèle OCI Data Science

[OCI Data Science](https://docs.oracle.com/en-us/iaas/data-science/using/home.htm) est une plateforme entièrement gérée et sans serveur pour les équipes de science des données afin de construire, former et gérer des modèles d'apprentissage automatique dans l'infrastructure cloud d'Oracle.

Ce cahier d'exercices explique comment utiliser un LLM hébergé sur un [déploiement de modèle OCI Data Science](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-about.htm).

Pour l'authentification, [oracle-ads](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html) a été utilisé pour charger automatiquement les informations d'identification pour invoquer le point de terminaison.

```python
!pip3 install oracle-ads
```

## Prérequis

### Déployer le modèle

Consultez le [référentiel d'exemples GitHub d'Oracle](https://github.com/oracle-samples/oci-data-science-ai-samples/tree/main/model-deployment/containers/llama2) pour savoir comment déployer votre llm sur le déploiement de modèle OCI Data Science.

### Politiques

Assurez-vous d'avoir les [politiques](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-policies-auth.htm#model_dep_policies_auth__predict-endpoint) requises pour accéder au point de terminaison du déploiement de modèle OCI Data Science.

## Configuration

### vLLM

Après avoir déployé le modèle, vous devez configurer les paramètres requis suivants de l'appel `OCIModelDeploymentVLLM` :

- **`endpoint`** : Le point de terminaison HTTP du modèle à partir du modèle déployé, par exemple `https://<MD_OCID>/predict`.
- **`model`** : L'emplacement du modèle.

### Inférence de génération de texte (TGI)

Vous devez configurer les paramètres requis suivants de l'appel `OCIModelDeploymentTGI` :

- **`endpoint`** : Le point de terminaison HTTP du modèle à partir du modèle déployé, par exemple `https://<MD_OCID>/predict`.

### Authentification

Vous pouvez définir l'authentification via ads ou des variables d'environnement. Lorsque vous travaillez dans une session de cahier OCI Data Science, vous pouvez utiliser le principal de ressource pour accéder à d'autres ressources OCI. Consultez [ici](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html) pour voir d'autres options.

## Exemple

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
