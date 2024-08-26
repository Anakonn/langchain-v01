---
translated: true
---

# Dataherald

Ce cahier passe en revue comment utiliser le composant dataherald.

Tout d'abord, vous devez configurer votre compte Dataherald et obtenir votre CLÉ API :

1. Allez sur dataherald et inscrivez-vous [ici](https://www.dataherald.com/)
2. Une fois connecté à votre console d'administration, créez une CLÉ API
3. pip install dataherald

Ensuite, nous devrons définir quelques variables d'environnement :
1. Enregistrez votre CLÉ API dans la variable d'environnement DATAHERALD_API_KEY

```python
pip install dataherald
```

```python
import os

os.environ["DATAHERALD_API_KEY"] = ""
```

```python
from langchain_community.utilities.dataherald import DataheraldAPIWrapper
```

```python
dataherald = DataheraldAPIWrapper(db_connection_id="65fb766367dd22c99ce1a12d")
```

```python
dataherald.run("How many employees are in the company?")
```

```output
'select COUNT(*) from employees'
```
