---
translated: true
---

# Marqo

Cette page couvre comment utiliser l'écosystème Marqo dans LangChain.

### **Qu'est-ce que Marqo ?**

Marqo est un moteur de recherche tensoriel qui utilise des embeddings stockés dans des index HNSW en mémoire pour atteindre des vitesses de recherche de pointe. Marqo peut passer à l'échelle d'index de documents de centaines de millions avec un partitionnement horizontal des index et permet un téléchargement et une recherche de données asynchrones et non bloquants. Marqo utilise les derniers modèles d'apprentissage automatique de PyTorch, Huggingface, OpenAI et plus encore. Vous pouvez commencer avec un modèle pré-configuré ou apporter le vôtre. La prise en charge intégrée d'ONNX et la conversion permettent une inférence plus rapide et un débit plus élevé sur le CPU et le GPU.

Comme Marqo inclut sa propre inférence, vos documents peuvent avoir un mélange de texte et d'images, vous pouvez apporter des index Marqo avec des données de vos autres systèmes dans l'écosystème langchain sans avoir à vous soucier de la compatibilité de vos embeddings.

Le déploiement de Marqo est flexible, vous pouvez commencer par vous-même avec notre image docker ou [nous contacter pour notre offre cloud gérée !](https://www.marqo.ai/pricing)

Pour exécuter Marqo localement avec notre image docker, [voir notre guide de démarrage.](https://docs.marqo.ai/latest/)

## Installation et configuration

- Installez le SDK Python avec `pip install marqo`

## Wrappers

### VectorStore

Il existe un wrapper autour des index Marqo, vous permettant de les utiliser dans le cadre du vectorstore. Marqo vous permet de choisir parmi une gamme de modèles pour générer des embeddings et expose quelques configurations de prétraitement.

Le vectorstore Marqo peut également fonctionner avec des index multimodèles existants où vos documents ont un mélange d'images et de texte, pour plus d'informations, reportez-vous [à notre documentation](https://docs.marqo.ai/latest/#multi-modal-and-cross-modal-search). Notez que l'instanciation du vectorstore Marqo avec un index multimodal existant désactivera la possibilité d'ajouter de nouveaux documents via la méthode `add_texts` du vectorstore langchain.

Pour importer ce vectorstore :

```python
<!--IMPORTS:[{"imported": "Marqo", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.marqo.Marqo.html", "title": "Marqo"}]-->
from langchain_community.vectorstores import Marqo
```

Pour un parcours plus détaillé du wrapper Marqo et de certaines de ses fonctionnalités uniques, voir [ce notebook](/docs/integrations/vectorstores/marqo)
