---
translated: true
---

# Google Vertex AI PaLM

>[API Vertex AI PaLM](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview) est un service sur Google Cloud exposant les modèles d'intégration.

Remarque : Cette intégration est distincte de l'intégration Google PaLM.

Par défaut, Google Cloud [n'utilise pas](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development) les données des clients pour former ses modèles de base dans le cadre de l'engagement de confidentialité IA/ML de Google Cloud. Plus de détails sur la façon dont Google traite les données peuvent également être trouvés dans [l'Addendum de traitement des données clients (CDPA) de Google](https://cloud.google.com/terms/data-processing-addendum).

Pour utiliser Vertex AI PaLM, vous devez avoir le package Python `langchain-google-vertexai` installé et soit :
- Avoir les identifiants configurés pour votre environnement (gcloud, identité de charge de travail, etc...)
- Stocker le chemin d'accès à un fichier JSON de compte de service en tant que variable d'environnement GOOGLE_APPLICATION_CREDENTIALS

Cette base de code utilise la bibliothèque `google.auth` qui recherche d'abord la variable d'identification des applications mentionnée ci-dessus, puis recherche l'authentification au niveau du système.

Pour plus d'informations, consultez :
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet langchain langchain-google-vertexai
```

```python
from langchain_google_vertexai import VertexAIEmbeddings
```

```python
embeddings = VertexAIEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```
