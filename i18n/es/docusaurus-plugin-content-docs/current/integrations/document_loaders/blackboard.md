---
translated: true
---

# Blackboard

>[Blackboard Learn](https://en.wikipedia.org/wiki/Blackboard_Learn) (anteriormente el Sistema de Gestión del Aprendizaje Blackboard) es un entorno de aprendizaje virtual basado en la web y un sistema de gestión del aprendizaje desarrollado por Blackboard Inc. El software cuenta con gestión de cursos, arquitectura abierta personalizable y diseño escalable que permite la integración con sistemas de información estudiantil y protocolos de autenticación. Puede instalarse en servidores locales, ser alojado por `Soluciones ASP de Blackboard` o proporcionarse como Software como Servicio alojado en Amazon Web Services. Sus principales propósitos se declaran que incluyen la adición de elementos en línea a los cursos tradicionalmente impartidos cara a cara y el desarrollo de cursos completamente en línea con pocas o ninguna reunión presencial.

Esto cubre cómo cargar datos desde una instancia de [Blackboard Learn](https://www.anthology.com/products/teaching-and-learning/learning-effectiveness/blackboard-learn).

Este cargador no es compatible con todos los cursos de `Blackboard`. Solo es
    compatible con los cursos que utilizan la nueva interfaz de `Blackboard`.
    Para usar este cargador, debe tener la cookie BbRouter. Puede obtener esta
    cookie iniciando sesión en el curso y luego copiando el valor de la
    cookie BbRouter de las herramientas para desarrolladores del navegador.

```python
from langchain_community.document_loaders import BlackboardLoader

loader = BlackboardLoader(
    blackboard_course_url="https://blackboard.example.com/webapps/blackboard/execute/announcement?method=search&context=course_entry&course_id=_123456_1",
    bbrouter="expires:12345...",
    load_all_recursively=True,
)
documents = loader.load()
```
