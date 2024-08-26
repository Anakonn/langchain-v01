---
translated: true
---

# ल्लामा.cpp

[llama-cpp-python](https://github.com/abetlen/llama-cpp-python) [llama.cpp](https://github.com/ggerganov/llama.cpp) के लिए एक पायथन बाइंडिंग है।

यह [कई LLMs](https://github.com/ggerganov/llama.cpp#description) मॉडल्स के लिए इन्फेरेंस का समर्थन करता है, जिन्हें [Hugging Face](https://huggingface.co/TheBloke) पर एक्सेस किया जा सकता है।

यह नोटबुक LangChain के भीतर `llama-cpp-python` कैसे चलाना है, इस पर चर्चा करती है।

**नोट: `llama-cpp-python` के नए संस्करण GGUF मॉडल फाइल्स का उपयोग करते हैं (देखें [यहाँ](https://github.com/abetlen/llama-cpp-python/pull/633))।**

यह एक ब्रेकिंग चेंज है।

मौजूदा GGML मॉडलों को GGUF में कन्वर्ट करने के लिए आप [llama.cpp](https://github.com/ggerganov/llama.cpp) में निम्नलिखित चला सकते हैं:

```bash
python ./convert-llama-ggmlv3-to-gguf.py --eps 1e-5 --input models/openorca-platypus2-13b.ggmlv3.q4_0.bin --output models/openorca-platypus2-13b.gguf.q4_0.bin
```

## इंस्टालेशन

llama-cpp पैकेज को इंस्टॉल करने के लिए विभिन्न विकल्प हैं:
- CPU उपयोग
- CPU + GPU (कई BLAS बैकेंड्स में से एक का उपयोग करके)
- मेटल GPU (MacOS के साथ Apple Silicon चिप)

### केवल CPU इंस्टालेशन

```python
%pip install --upgrade --quiet  llama-cpp-python
```

### OpenBLAS / cuBLAS / CLBlast के साथ इंस्टालेशन

`llama.cpp` तेज़ प्रोसेसिंग के लिए कई BLAS बैकेंड्स का समर्थन करता है। cmake का उपयोग करने के लिए `FORCE_CMAKE=1` एनवायरनमेंट वेरिएबल का उपयोग करें और इच्छित BLAS बैकेंड के लिए pip पैकेज इंस्टॉल करें ([स्रोत](https://github.com/abetlen/llama-cpp-python#installation-with-openblas--cublas--clblast))।

cuBLAS बैकेंड के साथ इंस्टालेशन का उदाहरण:

```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**महत्वपूर्ण**: यदि आपने पहले से ही पैकेज का केवल CPU संस्करण इंस्टॉल किया हुआ है, तो आपको इसे फिर से स्क्रैच से इंस्टॉल करना होगा। निम्नलिखित कमांड पर विचार करें:

```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### मेटल के साथ इंस्टालेशन

`llama.cpp` Apple सिलिकॉन फर्स्ट-क्लास सिटिजन का समर्थन करता है - ARM NEON, Accelerate और Metal फ्रेमवर्क्स के माध्यम से अनुकूलित। cmake का उपयोग करने के लिए `FORCE_CMAKE=1` एनवायरनमेंट वेरिएबल का उपयोग करें और मेटल समर्थन के लिए pip पैकेज इंस्टॉल करें ([स्रोत](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md))।

मेटल सपोर्ट के साथ इंस्टालेशन का उदाहरण:

```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**महत्वपूर्ण**: यदि आपने पहले से ही पैकेज का केवल CPU संस्करण इंस्टॉल किया हुआ है, तो आपको इसे फिर से स्क्रैच से इंस्टॉल करना होगा: निम्नलिखित कमांड पर विचार करें:

```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### विंडोज के साथ इंस्टालेशन

सोर्स से कंपाइल करके `llama-cpp-python` लाइब्रेरी इंस्टॉल करना स्थिर है। आप अधिकांश निर्देशों को रिपॉजिटरी में ही फॉलो कर सकते हैं, लेकिन कुछ विंडोज़ विशिष्ट निर्देश उपयोगी हो सकते हैं।

`llama-cpp-python` को इंस्टॉल करने की आवश्यकताएं,

- गिट
- पायथन
- cmake
- Visual Studio Community (सुनिश्चित करें कि आप इसे निम्नलिखित सेटिंग्स के साथ इंस्टॉल करें)
    - C++ के साथ डेस्कटॉप विकास
    - पायथन विकास
    - C++ के साथ लिनक्स एंबेडेड विकास

1. `llama.cpp` सबमॉड्यूल प्राप्त करने के लिए गिट रिपॉजिटरी को रिकर्सिवली क्लोन करें

```bash
git clone --recursive -j8 https://github.com/abetlen/llama-cpp-python.git
```

2. एक कमांड प्रॉम्प्ट खोलें और निम्नलिखित एनवायरनमेंट वेरिएबल्स सेट करें।

```bash
set FORCE_CMAKE=1
set CMAKE_ARGS=-DLLAMA_CUBLAS=OFF
```

यदि आपके पास NVIDIA GPU है, तो सुनिश्चित करें कि `DLLAMA_CUBLAS` `ON` पर सेट है।

#### कंपाइल और इंस्टॉल करना

अब आप `llama-cpp-python` डायरेक्टरी में `cd` कर सकते हैं और पैकेज इंस्टॉल कर सकते हैं

```bash
python -m pip install -e .
```

**महत्वपूर्ण**: यदि आपने पहले से ही पैकेज का केवल CPU संस्करण इंस्टॉल किया हुआ है, तो आपको इसे फिर से स्क्रैच से इंस्टॉल करना होगा: निम्नलिखित कमांड पर विचार करें:

```python
!python -m pip install -e . --force-reinstall --no-cache-dir
```

## उपयोग

सुनिश्चित करें कि आप सभी आवश्यक मॉडल फाइल्स को [इंस्टॉल करने के निर्देशों](https://github.com/ggerganov/llama.cpp) का पालन कर रहे हैं।

आपको एक `API_TOKEN` की आवश्यकता नहीं है क्योंकि आप LLM को लोकली चलाएंगे।

यह समझना महत्वपूर्ण है कि कौन से मॉडल इच्छित मशीन पर उपयोग के लिए उपयुक्त हैं।

[TheBloke's](https://huggingface.co/TheBloke) Hugging Face मॉडल्स में एक `Provided files` सेक्शन है जो विभिन्न क्वांटाइजेशन साइज और मेथड्स (जैसे: [Llama2-7B-Chat-GGUF](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF#provided-files)) के मॉडल्स को चलाने के लिए आवश्यक RAM को उजागर करता है।

यह [गिटहब इश्यू](https://github.com/facebookresearch/llama/issues/425) भी आपकी मशीन के लिए सही मॉडल खोजने के लिए प्रासंगिक है।

```python
from langchain_community.llms import LlamaCpp
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
```

**अपने मॉडल को सूट करने वाले टेम्पलेट का उपयोग करने पर विचार करें! सही प्रॉम्प्टिंग टेम्पलेट प्राप्त करने के लिए Hugging Face आदि पर मॉडल्स के पेज की जाँच करें।**

```python
template = """Question: {question}

Answer: Let's work this out in a step by step way to be sure we have the right answer."""

prompt = PromptTemplate.from_template(template)
```

```python
# Callbacks support token-wise streaming
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
```

### CPU

LLaMA 2 7B मॉडल का उपयोग करने का उदाहरण

```python
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    temperature=0.75,
    max_tokens=2000,
    top_p=1,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

```python
question = """
Question: A rap battle between Stephen Colbert and John Oliver
"""
llm.invoke(question)
```

```output

Stephen Colbert:
Yo, John, I heard you've been talkin' smack about me on your show.
Let me tell you somethin', pal, I'm the king of late-night TV
My satire is sharp as a razor, it cuts deeper than a knife
While you're just a british bloke tryin' to be funny with your accent and your wit.
John Oliver:
Oh Stephen, don't be ridiculous, you may have the ratings but I got the real talk.
My show is the one that people actually watch and listen to, not just for the laughs but for the facts.
While you're busy talkin' trash, I'm out here bringing the truth to light.
Stephen Colbert:
Truth? Ha! You think your show is about truth? Please, it's all just a joke to you.
You're just a fancy-pants british guy tryin' to be funny with your news and your jokes.
While I'm the one who's really makin' a difference, with my sat


llama_print_timings:        load time =   358.60 ms
llama_print_timings:      sample time =   172.55 ms /   256 runs   (    0.67 ms per token,  1483.59 tokens per second)
llama_print_timings: prompt eval time =   613.36 ms /    16 tokens (   38.33 ms per token,    26.09 tokens per second)
llama_print_timings:        eval time = 10151.17 ms /   255 runs   (   39.81 ms per token,    25.12 tokens per second)
llama_print_timings:       total time = 11332.41 ms
```

```output
"\nStephen Colbert:\nYo, John, I heard you've been talkin' smack about me on your show.\nLet me tell you somethin', pal, I'm the king of late-night TV\nMy satire is sharp as a razor, it cuts deeper than a knife\nWhile you're just a british bloke tryin' to be funny with your accent and your wit.\nJohn Oliver:\nOh Stephen, don't be ridiculous, you may have the ratings but I got the real talk.\nMy show is the one that people actually watch and listen to, not just for the laughs but for the facts.\nWhile you're busy talkin' trash, I'm out here bringing the truth to light.\nStephen Colbert:\nTruth? Ha! You think your show is about truth? Please, it's all just a joke to you.\nYou're just a fancy-pants british guy tryin' to be funny with your news and your jokes.\nWhile I'm the one who's really makin' a difference, with my sat"
```

LLaMA v1 मॉडल का उपयोग करने का उदाहरण

```python
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="./ggml-model-q4_0.bin", callback_manager=callback_manager, verbose=True
)
```

```python
llm_chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"
llm_chain.invoke({"question": question})
```

```output


1. First, find out when Justin Bieber was born.
2. We know that Justin Bieber was born on March 1, 1994.
3. Next, we need to look up when the Super Bowl was played in that year.
4. The Super Bowl was played on January 28, 1995.
5. Finally, we can use this information to answer the question. The NFL team that won the Super Bowl in the year Justin Bieber was born is the San Francisco 49ers.


llama_print_timings:        load time =   434.15 ms
llama_print_timings:      sample time =    41.81 ms /   121 runs   (    0.35 ms per token)
llama_print_timings: prompt eval time =  2523.78 ms /    48 tokens (   52.58 ms per token)
llama_print_timings:        eval time = 23971.57 ms /   121 runs   (  198.11 ms per token)
llama_print_timings:       total time = 28945.95 ms
```

```output
'\n\n1. First, find out when Justin Bieber was born.\n2. We know that Justin Bieber was born on March 1, 1994.\n3. Next, we need to look up when the Super Bowl was played in that year.\n4. The Super Bowl was played on January 28, 1995.\n5. Finally, we can use this information to answer the question. The NFL team that won the Super Bowl in the year Justin Bieber was born is the San Francisco 49ers.'
```

### GPU

यदि BLAS बैकेंड के साथ इंस्टालेशन सही था, तो आपको मॉडल प्रॉपर्टीज में एक `BLAS = 1` इंडिकेटर दिखाई देगा।

GPU के साथ उपयोग के लिए दो सबसे महत्वपूर्ण पैरामीटर हैं:

- `n_gpu_layers` - यह निर्धारित करता है कि मॉडल की कितनी लेयर्स आपके GPU में ऑफलोड की जाती हैं।
- `n_batch` - कितने टोकन एक साथ प्रोसेस किए जाते हैं।

इन पैरामीटर्स को सही तरीके से सेट करने से मूल्यांकन की गति में नाटकीय सुधार होगा (अधिक विवरण के लिए [wrapper code](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py) देखें)।

```python
n_gpu_layers = -1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of VRAM in your GPU.

# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

```python
llm_chain = prompt | llm
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"
llm_chain.invoke({"question": question})
```

```output


1. Identify Justin Bieber's birth date: Justin Bieber was born on March 1, 1994.

2. Find the Super Bowl winner of that year: The NFL season of 1993 with the Super Bowl being played in January or of 1994.

3. Determine which team won the game: The Dallas Cowboys faced the Buffalo Bills in Super Bowl XXVII on January 31, 1993 (as the year is mis-labelled due to a error). The Dallas Cowboys won this matchup.

So, Justin Bieber was born when the Dallas Cowboys were the reigning NFL Super Bowl.


llama_print_timings:        load time =   427.63 ms
llama_print_timings:      sample time =   115.85 ms /   164 runs   (    0.71 ms per token,  1415.67 tokens per second)
llama_print_timings: prompt eval time =   427.53 ms /    45 tokens (    9.50 ms per token,   105.26 tokens per second)
llama_print_timings:        eval time =  4526.53 ms /   163 runs   (   27.77 ms per token,    36.01 tokens per second)
llama_print_timings:       total time =  5293.77 ms
```

```output
"\n\n1. Identify Justin Bieber's birth date: Justin Bieber was born on March 1, 1994.\n\n2. Find the Super Bowl winner of that year: The NFL season of 1993 with the Super Bowl being played in January or of 1994.\n\n3. Determine which team won the game: The Dallas Cowboys faced the Buffalo Bills in Super Bowl XXVII on January 31, 1993 (as the year is mis-labelled due to a error). The Dallas Cowboys won this matchup.\n\nSo, Justin Bieber was born when the Dallas Cowboys were the reigning NFL Super Bowl."
```

### मेटल

यदि मेटल के साथ इंस्टालेशन सही था, तो आपको मॉडल प्रॉपर्टीज में एक `NEON = 1` इंडिकेटर दिखाई देगा।

दो सबसे महत्वपूर्ण GPU पैरामीटर हैं:

- `n_gpu_layers` - यह निर्धारित करता है कि मॉडल की कितनी लेयर्स आपके मेटल GPU में ऑफलोड की जाती हैं।
- `n_batch` - कितने टोकन एक साथ प्रोसेस किए जाते हैं, डिफ़ॉल्ट 8 है, एक बड़ा नंबर सेट करें।
- `f16_kv` - किसी कारण से, मेटल केवल `True` को समर्थन करता है, अन्यथा आपको ऐसी त्रुटि मिलेगी जैसे `Asserting on type 0 GGML_ASSERT: .../ggml-metal.m:706: false && "not implemented"`

इन पैरामीटर्स को सही तरीके से सेट करने से मूल्यांकन की गति में नाटकीय सुधार होगा (अधिक विवरण के लिए [wrapper code](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py) देखें)।

```python
n_gpu_layers = 1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

कंसोल लॉग निम्नलिखित लॉग दिखाएगा जो इंगित करेगा कि मेटल सही तरीके से सक्षम था।

```output
ggml_metal_init: allocating
ggml_metal_init: using MPS
...
```

आप `Activity Monitor` को भी देख सकते हैं प्रोसेस के GPU उपयोग को देखने के लिए, CPU उपयोग नाटकीय रूप से गिर जाएगा `n_gpu_layers=1` चालू करने के बाद।

LLM को पहली बार कॉल करने पर, मॉडल संकलन के कारण प्रदर्शन धीमा हो सकता है।

### व्याकरण

हम [grammars](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md) का उपयोग कर सकते हैं मॉडल आउटपुट को बाधित करने और उनमें परिभाषित नियमों के आधार पर टोकन को सैंपल करने के लिए।

इस अवधारणा को प्रदर्शित करने के लिए, हमने [नमूना व्याकरण फाइलें](https://github.com/langchain-ai/langchain/tree/master/libs/langchain/langchain/llms/grammars) शामिल की हैं, जिन्हें नीचे दिए गए उदाहरणों में उपयोग किया जाएगा।

gbnf व्याकरण फाइलें बनाना समय-साध्य हो सकता है, लेकिन यदि आपके पास एक उपयोग-मामला है जहां आउटपुट स्कीमा महत्वपूर्ण हैं, तो दो उपकरण हैं जो मदद कर सकते हैं:
- [ऑनलाइन व्याकरण जनरेटर ऐप](https://grammar.intrinsiclabs.ai/) जो TypeScript इंटरफेस परिभाषाओं को gbnf फाइल में बदलता है।
- [पायथन स्क्रिप्ट](https://github.com/ggerganov/llama.cpp/blob/master/examples/json-schema-to-grammar.py) json स्कीमा को gbnf फाइल में बदलने के लिए। उदाहरण के लिए आप एक `pydantic` ऑब्जेक्ट बना सकते हैं, उसकी JSON स्कीमा `.schema_json()` मेथड का उपयोग करके जनरेट कर सकते हैं, और फिर इस स्क्रिप्ट का उपयोग करके इसे gbnf फाइल में बदल सकते हैं।

पहले उदाहरण में, JSON उत्पन्न करने के लिए निर्दिष्ट `json.gbnf` फाइल के पथ को सप्लाई करें:

```python
n_gpu_layers = 1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
    grammar_path="/Users/rlm/Desktop/Code/langchain-main/langchain/libs/langchain/langchain/llms/grammars/json.gbnf",
)
```

```python
%%capture captured --no-stdout
result = llm.invoke("Describe a person in JSON format:")
```

```output
{
  "name": "John Doe",
  "age": 34,
  "": {
    "title": "Software Developer",
    "company": "Google"
  },
  "interests": [
    "Sports",
    "Music",
    "Cooking"
  ],
  "address": {
    "street_number": 123,
    "street_name": "Oak Street",
    "city": "Mountain View",
    "state": "California",
    "postal_code": 94040
  }}


llama_print_timings:        load time =   357.51 ms
llama_print_timings:      sample time =  1213.30 ms /   144 runs   (    8.43 ms per token,   118.68 tokens per second)
llama_print_timings: prompt eval time =   356.78 ms /     9 tokens (   39.64 ms per token,    25.23 tokens per second)
llama_print_timings:        eval time =  3947.16 ms /   143 runs   (   27.60 ms per token,    36.23 tokens per second)
llama_print_timings:       total time =  5846.21 ms
```

हम `list.gbnf` को भी सप्लाई कर सकते हैं एक सूची लौटाने के लिए:

```python
n_gpu_layers = 1
n_batch = 512
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,
    grammar_path="/Users/rlm/Desktop/Code/langchain-main/langchain/libs/langchain/langchain/llms/grammars/list.gbnf",
)
```

```python
%%capture captured --no-stdout
result = llm.invoke("List of top-3 my favourite books:")
```

```output
["The Catcher in the Rye", "Wuthering Heights", "Anna Karenina"]


llama_print_timings:        load time =   322.34 ms
llama_print_timings:      sample time =   232.60 ms /    26 runs   (    8.95 ms per token,   111.78 tokens per second)
llama_print_timings: prompt eval time =   321.90 ms /    11 tokens (   29.26 ms per token,    34.17 tokens per second)
llama_print_timings:        eval time =   680.82 ms /    25 runs   (   27.23 ms per token,    36.72 tokens per second)
llama_print_timings:       total time =  1295.27 ms
```
