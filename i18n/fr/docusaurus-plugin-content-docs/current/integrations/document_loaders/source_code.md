---
translated: true
---

# Code source

Ce cahier couvre comment charger des fichiers de code source en utilisant une approche spéciale avec l'analyse du langage : chaque fonction et classe de niveau supérieur dans le code est chargée dans des documents séparés. Tout code de niveau supérieur restant en dehors des fonctions et classes déjà chargées sera chargé dans un document séparé.

Cette approche peut potentiellement améliorer la précision des modèles de QA sur le code source.

Les langages pris en charge pour l'analyse du code sont :

- C (*)
- C++ (*)
- C# (*)
- COBOL
- Go (*)
- Java (*)
- JavaScript (nécessite le package `esprima`)
- Kotlin (*)
- Lua (*)
- Perl (*)
- Python
- Ruby (*)
- Rust (*)
- Scala (*)
- TypeScript (*)

Les éléments marqués d'un (*) nécessitent les packages `tree_sitter` et `tree_sitter_languages`.
Il est simple d'ajouter le support pour des langages supplémentaires en utilisant `tree_sitter`,
bien que cela nécessite actuellement de modifier LangChain.

Le langage utilisé pour l'analyse peut être configuré, ainsi que le nombre minimum de
lignes requises pour activer la division en fonction de la syntaxe.

Si un langage n'est pas explicitement spécifié, `LanguageParser` en déduira un à partir
des extensions de nom de fichier, si présentes.

```python
%pip install -qU esprima esprima tree_sitter tree_sitter_languages
```

```python
import warnings

warnings.filterwarnings("ignore")
from pprint import pprint

from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import Language
```

```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".py", ".js"],
    parser=LanguageParser(),
)
docs = loader.load()
```

```python
len(docs)
```

```output
6
```

```python
for document in docs:
    pprint(document.metadata)
```

```output
{'content_type': 'functions_classes',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'functions_classes',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'simplified_code',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'functions_classes',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
{'content_type': 'functions_classes',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
{'content_type': 'simplified_code',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
```

```python
print("\n\n--8<--\n\n".join([document.page_content for document in docs]))
```

```output
class MyClass:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"Hello, {self.name}!")

--8<--

def main():
    name = input("Enter your name: ")
    obj = MyClass(name)
    obj.greet()

--8<--

# Code for: class MyClass:


# Code for: def main():


if __name__ == "__main__":
    main()

--8<--

class MyClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hello, ${this.name}!`);
  }
}

--8<--

function main() {
  const name = prompt("Enter your name:");
  const obj = new MyClass(name);
  obj.greet();
}

--8<--

// Code for: class MyClass {

// Code for: function main() {

main();
```

L'analyseur peut être désactivé pour les petits fichiers.

Le paramètre `parser_threshold` indique le nombre minimum de lignes que le fichier de code source doit avoir pour être segmenté à l'aide de l'analyseur.

```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".py"],
    parser=LanguageParser(language=Language.PYTHON, parser_threshold=1000),
)
docs = loader.load()
```

```python
len(docs)
```

```output
1
```

```python
print(docs[0].page_content)
```

```output
class MyClass:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"Hello, {self.name}!")


def main():
    name = input("Enter your name: ")
    obj = MyClass(name)
    obj.greet()


if __name__ == "__main__":
    main()
```

## Division

Une division supplémentaire pourrait être nécessaire pour ces fonctions, classes ou scripts qui sont trop volumineux.

```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".js"],
    parser=LanguageParser(language=Language.JS),
)
docs = loader.load()
```

```python
from langchain_text_splitters import (
    Language,
    RecursiveCharacterTextSplitter,
)
```

```python
js_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.JS, chunk_size=60, chunk_overlap=0
)
```

```python
result = js_splitter.split_documents(docs)
```

```python
len(result)
```

```output
7
```

```python
print("\n\n--8<--\n\n".join([document.page_content for document in result]))
```

```output
class MyClass {
  constructor(name) {
    this.name = name;

--8<--

}

--8<--

greet() {
    console.log(`Hello, ${this.name}!`);
  }
}

--8<--

function main() {
  const name = prompt("Enter your name:");

--8<--

const obj = new MyClass(name);
  obj.greet();
}

--8<--

// Code for: class MyClass {

// Code for: function main() {

--8<--

main();
```

## Ajout de langages à l'aide du modèle Tree-sitter

L'expansion de la prise en charge des langages à l'aide du modèle Tree-Sitter implique quelques étapes essentielles :

1. **Création d'un nouveau fichier de langue**:
    - Commencez par créer un nouveau fichier dans le répertoire désigné (langchain/libs/community/langchain_community/document_loaders/parsers/language).
    - Modélisez ce fichier sur la structure et la logique d'analyse des fichiers de langue existants comme **`cpp.py`**.
    - Vous devrez également créer un fichier dans le répertoire langchain (langchain/libs/langchain/langchain/document_loaders/parsers/language).
2. **Analyse des spécificités du langage**:
    - Imitez la structure utilisée dans le fichier **`cpp.py`**, en l'adaptant pour convenir au langage que vous intégrez.
    - La principale modification consiste à ajuster le tableau de requêtes de découpage pour correspondre à la syntaxe et à la structure du langage que vous analysez.
3. **Test de l'analyseur de langue**:
    - Pour une validation approfondie, générez un fichier de test spécifique au nouveau langage. Créez **`test_language.py`** dans le répertoire désigné (langchain/libs/community/tests/unit_tests/document_loaders/parsers/language).
    - Suivez l'exemple donné par **`test_cpp.py`** pour établir des tests fondamentaux pour les éléments analysés dans le nouveau langage.
4. **Intégration dans l'analyseur et le diviseur de texte**:
    - Intégrez votre nouveau langage dans le fichier **`language_parser.py``. Assurez-vous de mettre à jour LANGUAGE_EXTENSIONS et LANGUAGE_SEGMENTERS ainsi que la docstring pour LanguageParser afin de reconnaître et de gérer le langage ajouté.
    - Vérifiez également que votre langue est incluse dans **`text_splitter.py`** dans la classe Language pour une analyse correcte.

En suivant ces étapes et en assurant des tests et une intégration complets, vous étendrez avec succès la prise en charge des langages à l'aide du modèle Tree-Sitter.

Bonne chance !
