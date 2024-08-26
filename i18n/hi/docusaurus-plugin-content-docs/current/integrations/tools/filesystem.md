---
translated: true
---

# फ़ाइल सिस्टम

LangChain आपके लिए स्थानीय फ़ाइल सिस्टम के साथ काम करने के लिए उपकरण प्रदान करता है। यह नोटबुक उनमें से कुछ के बारे में बताता है।

**नोट:** इन उपकरणों का उपयोग एक सैंडबॉक्स वातावरण के बाहर करने की सिफारिश नहीं की जाती है!

पहले, हम उन उपकरणों को आयात करेंगे।

```python
from tempfile import TemporaryDirectory

from langchain_community.agent_toolkits import FileManagementToolkit

# We'll make a temporary directory to avoid clutter
working_directory = TemporaryDirectory()
```

## FileManagementToolkit

यदि आप अपने एजेंट को सभी फ़ाइल उपकरण प्रदान करना चाहते हैं, तो यह करना आसान है। हम LLM के लिए एक कार्यक्षेत्र के रूप में अस्थायी निर्देशिका को रूट निर्देशिका के रूप में पास करेंगे।

यह सिफारिश की जाती है कि हमेशा एक रूट निर्देशिका पास की जाए, क्योंकि इसके बिना, LLM को कार्यक्षेत्र को प्रदूषित करना आसान हो जाता है, और इसके बिना, सरल प्रोम्प्ट इंजेक्शन के खिलाफ कोई सत्यापन नहीं होता है।

```python
toolkit = FileManagementToolkit(
    root_dir=str(working_directory.name)
)  # If you don't provide a root_dir, operations will default to the current working directory
toolkit.get_tools()
```

```output
[CopyFileTool(root_dir='/tmp/tmprdvsw3tg'),
 DeleteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 FileSearchTool(root_dir='/tmp/tmprdvsw3tg'),
 MoveFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ReadFileTool(root_dir='/tmp/tmprdvsw3tg'),
 WriteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ListDirectoryTool(root_dir='/tmp/tmprdvsw3tg')]
```

### फ़ाइल सिस्टम उपकरणों का चयन

यदि आप केवल कुछ उपकरण चुनना चाहते हैं, तो आप उन्हें टूलकिट को प्रारंभ करते समय तर्कों के रूप में पास कर सकते हैं, या आप व्यक्तिगत रूप से इच्छित उपकरणों को प्रारंभ कर सकते हैं।

```python
tools = FileManagementToolkit(
    root_dir=str(working_directory.name),
    selected_tools=["read_file", "write_file", "list_directory"],
).get_tools()
tools
```

```output
[ReadFileTool(root_dir='/tmp/tmprdvsw3tg'),
 WriteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ListDirectoryTool(root_dir='/tmp/tmprdvsw3tg')]
```

```python
read_tool, write_tool, list_tool = tools
write_tool.invoke({"file_path": "example.txt", "text": "Hello World!"})
```

```output
'File written successfully to example.txt.'
```

```python
# List files in the working directory
list_tool.invoke({})
```

```output
'example.txt'
```
