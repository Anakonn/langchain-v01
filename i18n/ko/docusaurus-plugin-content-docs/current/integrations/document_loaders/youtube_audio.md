---
translated: true
---

# YouTube 오디오

YouTube 동영상에서 채팅 또는 QA 애플리케이션을 구축하는 것은 높은 관심사입니다.

아래에서는 `YouTube url`에서 `동영상 오디오`, `텍스트`, `채팅`으로 쉽게 전환하는 방법을 보여줍니다!

`OpenAIWhisperParser`를 사용할 것이며, 이는 OpenAI Whisper API를 사용하여 오디오를 텍스트로 전사할 것입니다. `OpenAIWhisperParserLocal`은 로컬 지원 및 프라이빗 클라우드 또는 온프레미스에서 실행을 위한 것입니다.

참고: `OPENAI_API_KEY`를 제공해야 합니다.

```python
from langchain_community.document_loaders.blob_loaders.youtube_audio import (
    YoutubeAudioLoader,
)
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import (
    OpenAIWhisperParser,
    OpenAIWhisperParserLocal,
)
```

`yt_dlp`를 사용하여 YouTube url의 오디오를 다운로드할 것입니다.

`pydub`을 사용하여 다운로드한 오디오 파일을 분할할 것입니다(Whisper API의 25MB 파일 크기 제한을 준수하기 위해).

```python
%pip install --upgrade --quiet  yt_dlp
%pip install --upgrade --quiet  pydub
%pip install --upgrade --quiet  librosa
```

### YouTube url에서 텍스트로

`YoutubeAudioLoader`를 사용하여 오디오 파일을 가져오거나 다운로드합니다.

그런 다음 `OpenAIWhisperParser()`를 사용하여 텍스트로 전사합니다.

Andrej Karpathy의 YouTube 강좌 첫 번째 강의를 예로 들어 보겠습니다!

```python
# set a flag to switch between local and remote parsing
# change this to True if you want to use local parsing
local = False
```

```python
# Two Karpathy lecture videos
urls = ["https://youtu.be/kCc8FmEb1nY", "https://youtu.be/VMj-3S1tku0"]

# Directory to save audio files
save_dir = "~/Downloads/YouTube"

# Transcribe the videos to text
if local:
    loader = GenericLoader(
        YoutubeAudioLoader(urls, save_dir), OpenAIWhisperParserLocal()
    )
else:
    loader = GenericLoader(YoutubeAudioLoader(urls, save_dir), OpenAIWhisperParser())
docs = loader.load()
```

```output
[youtube] Extracting URL: https://youtu.be/kCc8FmEb1nY
[youtube] kCc8FmEb1nY: Downloading webpage
[youtube] kCc8FmEb1nY: Downloading android player API JSON
[info] kCc8FmEb1nY: Downloading 1 format(s): 140
[dashsegments] Total fragments: 11
[download] Destination: /Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/Let's build GPT： from scratch, in code, spelled out..m4a
[download] 100% of  107.73MiB in 00:00:18 at 5.92MiB/s
[FixupM4a] Correcting container of "/Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/Let's build GPT： from scratch, in code, spelled out..m4a"
[ExtractAudio] Not converting audio /Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/Let's build GPT： from scratch, in code, spelled out..m4a; file is already in target format m4a
[youtube] Extracting URL: https://youtu.be/VMj-3S1tku0
[youtube] VMj-3S1tku0: Downloading webpage
[youtube] VMj-3S1tku0: Downloading android player API JSON
[info] VMj-3S1tku0: Downloading 1 format(s): 140
[download] /Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/The spelled-out intro to neural networks and backpropagation： building micrograd.m4a has already been downloaded
[download] 100% of  134.98MiB
[ExtractAudio] Not converting audio /Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/The spelled-out intro to neural networks and backpropagation： building micrograd.m4a; file is already in target format m4a
```

```python
# Returns a list of Documents, which can be easily viewed or parsed
docs[0].page_content[0:500]
```

```output
"Hello, my name is Andrej and I've been training deep neural networks for a bit more than a decade. And in this lecture I'd like to show you what neural network training looks like under the hood. So in particular we are going to start with a blank Jupyter notebook and by the end of this lecture we will define and train a neural net and you'll get to see everything that goes on under the hood and exactly sort of how that works on an intuitive level. Now specifically what I would like to do is I w"
```

### YouTube 동영상에서 채팅 앱 구축하기

`Documents`가 주어지면 채팅 / 질문 및 답변을 쉽게 활성화할 수 있습니다.

```python
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# Combine doc
combined_docs = [doc.page_content for doc in docs]
text = " ".join(combined_docs)
```

```python
# Split them
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=150)
splits = text_splitter.split_text(text)
```

```python
# Build an index
embeddings = OpenAIEmbeddings()
vectordb = FAISS.from_texts(splits, embeddings)
```

```python
# Build a QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-3.5-turbo", temperature=0),
    chain_type="stuff",
    retriever=vectordb.as_retriever(),
)
```

```python
# Ask a question!
query = "Why do we need to zero out the gradient before backprop at each step?"
qa_chain.run(query)
```

```output
"We need to zero out the gradient before backprop at each step because the backward pass accumulates gradients in the grad attribute of each parameter. If we don't reset the grad to zero before each backward pass, the gradients will accumulate and add up, leading to incorrect updates and slower convergence. By resetting the grad to zero before each backward pass, we ensure that the gradients are calculated correctly and that the optimization process works as intended."
```

```python
query = "What is the difference between an encoder and decoder?"
qa_chain.run(query)
```

```output
'In the context of transformers, an encoder is a component that reads in a sequence of input tokens and generates a sequence of hidden representations. On the other hand, a decoder is a component that takes in a sequence of hidden representations and generates a sequence of output tokens. The main difference between the two is that the encoder is used to encode the input sequence into a fixed-length representation, while the decoder is used to decode the fixed-length representation into an output sequence. In machine translation, for example, the encoder reads in the source language sentence and generates a fixed-length representation, which is then used by the decoder to generate the target language sentence.'
```

```python
query = "For any token, what are x, k, v, and q?"
qa_chain.run(query)
```

```output
'For any token, x is the input vector that contains the private information of that token, k and q are the key and query vectors respectively, which are produced by forwarding linear modules on x, and v is the vector that is calculated by propagating the same linear module on x again. The key vector represents what the token contains, and the query vector represents what the token is looking for. The vector v is the information that the token will communicate to other tokens if it finds them interesting, and it gets aggregated for the purposes of the self-attention mechanism.'
```
