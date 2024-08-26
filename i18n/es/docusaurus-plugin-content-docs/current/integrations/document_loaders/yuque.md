---
translated: true
---

# Yuque

>[Yuque](https://www.yuque.com/) es una base de conocimiento profesional basada en la nube para la colaboración en equipo en documentación.

Este cuaderno cubre cómo cargar documentos desde `Yuque`.

Puede obtener el token de acceso personal haciendo clic en su avatar personal en la página [Configuración personal](https://www.yuque.com/settings/tokens).

```python
from langchain_community.document_loaders import YuqueLoader
```

```python
loader = YuqueLoader(access_token="<your_personal_access_token>")
```

```python
docs = loader.load()
```
