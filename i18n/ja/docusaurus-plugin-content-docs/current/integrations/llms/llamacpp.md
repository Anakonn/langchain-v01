---
translated: true
---

# Llama.cpp

[llama-cpp-python](https://github.com/abetlen/llama-cpp-python)は[llama.cpp](https://github.com/ggerganov/llama.cpp)のPythonバインディングです。

[多くのLLMモデル](https://github.com/ggerganov/llama.cpp#description)の推論をサポートしており、[Hugging Face](https://huggingface.co/TheBloke)で利用できます。

このノートブックでは、LangChainで`llama-cpp-python`を実行する方法について説明します。

**注意: `llama-cpp-python`の新しいバージョンではGGUFモデルファイルを使用します (詳細は[こちら](https://github.com/abetlen/llama-cpp-python/pull/633))を参照)。**

これは破壊的な変更です。

既存のGGMLモデルをGGUFに変換するには、[llama.cpp](https://github.com/ggerganov/llama.cpp)で次のコマンドを実行します:

```bash
python ./convert-llama-ggmlv3-to-gguf.py --eps 1e-5 --input models/openorca-platypus2-13b.ggmlv3.q4_0.bin --output models/openorca-platypus2-13b.gguf.q4_0.bin
```

## インストール

llama-cppパッケージをインストールする方法は以下のとおりです:
- CPUのみ使用
- CPU + GPU (多数のBLASバックエンドの1つを使用)
- Metal GPU (Apple Siliconチップ搭載のMacOS)

### CPUのみのインストール

```python
%pip install --upgrade --quiet  llama-cpp-python
```

### OpenBLAS / cuBLAS / CLBlastでのインストール

`llama.cpp`は高速な処理のために複数のBLASバックエンドをサポートしています。`FORCE_CMAKE=1`環境変数を使用してcmakeの使用を強制し、目的のBLASバックエンドのpipパッケージをインストールします ([ソース](https://github.com/abetlen/llama-cpp-python#installation-with-openblas--cublas--clblast))を参照)。

cuBLASバックエンドでのインストール例:

```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**重要**: CPUのみのバージョンのパッケージをすでにインストールしている場合は、最初から再インストールする必要があります。次のコマンドを使用してください:

```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### Metalでのインストール

`llama.cpp`はApple Siliconをファーストクラスシチズンとしてサポートしており、ARM NEON、Accelerate、Metalフレームワークを使用して最適化されています。`FORCE_CMAKE=1`環境変数を使用してcmakeの使用を強制し、Metalサポートのpipパッケージをインストールします ([ソース](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md))を参照)。

Metalサポートでのインストール例:

```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**重要**: CPUのみのバージョンのパッケージをすでにインストールしている場合は、最初から再インストールする必要があります。次のコマンドを使用してください:

```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### Windowsでのインストール

`llama-cpp-python`ライブラリをソースからコンパイルしてインストールするのは安定しています。リポジトリ自体の説明に従うことができますが、Windowsに特有の指示も役立つかもしれません。

`llama-cpp-python`をインストールするための要件は以下のとおりです:

- git
- python
- cmake
- Visual Studio Community (次の設定でインストールしてください)
    - C++によるデスクトップ開発
    - Pythonの開発
    - C++によるLinuxエンベデッド開発

1. `llama.cpp`サブモジュールも取得するために、gitリポジトリを再帰的にクローンします。

```bash
git clone --recursive -j8 https://github.com/abetlen/llama-cpp-python.git
```

2. コマンドプロンプトを開き、次の環境変数を設定します。

```bash
set FORCE_CMAKE=1
set CMAKE_ARGS=-DLLAMA_CUBLAS=OFF
```

NVIDIA GPUをお持ちの場合は、`DLLAMA_CUBLAS`を`ON`に設定してください。

#### コンパイルとインストール

`llama-cpp-python`ディレクトリに`cd`して、パッケージをインストールできます。

```bash
python -m pip install -e .
```

**重要**: CPUのみのバージョンのパッケージをすでにインストールしている場合は、最初から再インストールする必要があります。次のコマンドを使用してください:

```python
!python -m pip install -e . --force-reinstall --no-cache-dir
```

## 使用方法

[必要なすべてのモデルファイルをインストール](https://github.com/ggerganov/llama.cpp)することを確認してください。

LLMをローカルで実行するため、`API_TOKEN`は必要ありません。

使用したいマシンに適したモデルを選択することが重要です。

[TheBloke's](https://huggingface.co/TheBloke) Hugging Faceモデルには、RAM要件を公開する`Provided files`セクションがあります (例: [Llama2-7B-Chat-GGUF](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF#provided-files)))。

このマシンに適したモデルを見つけるには、[このGitHubのissue](https://github.com/facebookresearch/llama/issues/425)も参考になります。

```python
from langchain_community.llms import LlamaCpp
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
```

**使用するモデルに適したテンプレートを使用してください! Hugging Faceのモデルページなどで、正しいプロンプトテンプレートを確認してください。**

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

LLaMA 2 7Bモデルを使用する例

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

LLaMA v1モデルを使用する例

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

BLASバックエンドのインストールが正しければ、モデルのプロパティに`BLAS = 1`が表示されます。

GPUを使用する際の2つの重要なパラメーターは以下のとおりです:

- `n_gpu_layers` - モデルの何層をGPUにオフロードするかを決定します。
- `n_batch` - 並列に処理するトークンの数です。

これらのパラメーターを適切に設定すると、評価速度が大幅に向上します (詳細は[ラッパーコード](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py)を参照)。

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

### メタル

Metal のインストールが正しければ、モデルのプロパティに `NEON = 1` インジケーターが表示されます。

最も重要な GPU パラメーターは以下の 2 つです:

- `n_gpu_layers` - モデルの何層をメタル GPU にオフロードするかを決定します。
- `n_batch` - 並列処理するトークンの数で、デフォルトは 8 です。より大きな数値に設定してください。
- `f16_kv` - 何らかの理由で、Metal は `True` のみをサポートします。そうでない場合は `Asserting on type 0 GGML_ASSERT: .../ggml-metal.m:706: false && "not implemented"` のようなエラーが発生します。

これらのパラメーターを正しく設定すると、評価速度が劇的に向上します (詳細は [wrapper code](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py) を参照してください)。

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

コンソールログには、Metal が正しく有効化されたことを示すログが表示されます。

```output
ggml_metal_init: allocating
ggml_metal_init: using MPS
...
```

`Activity Monitor` を確認すると、プロセスの GPU 使用率が上がり、`n_gpu_layers=1` にすると CPU 使用率が大幅に下がっていることがわかります。

LLM の最初の呼び出しは、Metal GPU でのモデルコンパイルのため、パフォーマンスが低下する可能性があります。

### 文法

[文法](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md)を使用して、定義されたルールに基づいてモデル出力を制限し、トークンをサンプリングすることができます。

この概念を説明するために、以下の例で使用する [サンプルの文法ファイル](https://github.com/langchain-ai/langchain/tree/master/libs/langchain/langchain/llms/grammars)を用意しました。

gbnf 文法ファイルの作成は時間がかかりますが、出力スキーマが重要な使用例がある場合は、以下の 2 つのツールが役立ちます:
- TypeScript インターフェース定義を gbnf ファイルに変換する [オンラインの文法生成アプリ](https://grammar.intrinsiclabs.ai/)。
- JSON スキーマを gbnf ファイルに変換する [Python スクリプト](https://github.com/ggerganov/llama.cpp/blob/master/examples/json-schema-to-grammar.py)。例えば、`pydantic` オブジェクトを作成し、`.schema_json()` メソッドを使用して JSON スキーマを生成し、このスクリプトを使用してそれを gbnf ファイルに変換できます。

最初の例では、指定された `json.gbnf` ファイルのパスを指定して、JSON を生成します。

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

`list.gbnf` を指定して、リストを返すこともできます。

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
