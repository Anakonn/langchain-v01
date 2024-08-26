---
translated: true
---

# Código fuente

Este cuaderno cubre cómo cargar archivos de código fuente utilizando un enfoque especial con análisis de lenguaje: cada función y clase de nivel superior en el código se carga en documentos separados. Cualquier código de nivel superior restante fuera de las funciones y clases ya cargadas se cargará en un documento separado.

Este enfoque puede mejorar potencialmente la precisión de los modelos de QA sobre el código fuente.

Los idiomas compatibles para el análisis de código son:

- C (*)
- C++ (*)
- C# (*)
- COBOL
- Go (*)
- Java (*)
- JavaScript (requiere el paquete `esprima`)
- Kotlin (*)
- Lua (*)
- Perl (*)
- Python
- Ruby (*)
- Rust (*)
- Scala (*)
- TypeScript (*)

Los elementos marcados con (*) requieren los paquetes `tree_sitter` y `tree_sitter_languages`.
Es sencillo agregar soporte para idiomas adicionales usando `tree_sitter`,
aunque esto actualmente requiere modificar LangChain.

El idioma utilizado para el análisis se puede configurar, junto con el número mínimo de
líneas requeridas para activar la división en función de la sintaxis.

Si no se especifica explícitamente un idioma, `LanguageParser` inferirá uno a partir
de las extensiones de nombre de archivo, si están presentes.

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

El analizador se puede deshabilitar para archivos pequeños.

El parámetro `parser_threshold` indica el número mínimo de líneas que debe tener el archivo de código fuente para ser segmentado utilizando el analizador.

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

## División

Puede ser necesaria una división adicional para aquellas funciones, clases o scripts que sean demasiado grandes.

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

## Agregar idiomas usando la plantilla Tree-sitter

Expandir el soporte de idiomas utilizando la plantilla Tree-Sitter implica algunos pasos esenciales:

1. **Crear un nuevo archivo de idioma**:
    - Comienza creando un nuevo archivo en el directorio designado (langchain/libs/community/langchain_community/document_loaders/parsers/language).
    - Modela este archivo en función de la estructura y la lógica de análisis de los archivos de idioma existentes como **`cpp.py`**.
    - También deberás crear un archivo en el directorio langchain (langchain/libs/langchain/langchain/document_loaders/parsers/language).
2. **Análisis de las especificidades del idioma**:
    - Imita la estructura utilizada en el archivo **`cpp.py`**, adaptándola para adaptarse al idioma que estás incorporando.
    - La principal alteración implica ajustar la matriz de consulta de fragmentos para adaptarse a la sintaxis y estructura del idioma que estás analizando.
3. **Probar el analizador de idiomas**:
    - Para una validación exhaustiva, genera un archivo de prueba específico para el nuevo idioma. Crea **`test_language.py`** en el directorio designado (langchain/libs/community/tests/unit_tests/document_loaders/parsers/language).
    - Sigue el ejemplo establecido por **`test_cpp.py`** para establecer pruebas fundamentales para los elementos analizados en el nuevo idioma.
4. **Integración en el analizador y el divisor de texto**:
    - Incorpora tu nuevo idioma dentro del archivo **`language_parser.py``. Asegúrate de actualizar LANGUAGE_EXTENSIONS y LANGUAGE_SEGMENTERS junto con el docstring para LanguageParser para reconocer y manejar el idioma agregado.
    - También, confirma que tu idioma está incluido en **`text_splitter.py`** en la clase Language para un análisis adecuado.

Siguiendo estos pasos y asegurando pruebas y una integración exhaustivas, podrás extender con éxito el soporte de idiomas utilizando la plantilla Tree-Sitter.

¡Mucha suerte!
