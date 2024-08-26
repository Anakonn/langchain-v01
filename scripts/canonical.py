from pathlib import Path
import frontmatter

URL = "https://python.langchain.com/v0.1"


def get_url(path: Path):
    _path = path.with_suffix("")
    parts = list(_path.parts)
    if parts[-1] == "index":
        parts.pop()

    return f"{URL}/{str(Path(*parts))}"


def make_canonical(src_path: Path):
    with src_path.open("r", encoding="utf-8") as f:
        text = f.read()

    post = frontmatter.loads(text)

    canonical = get_url(src_path)
    post.metadata["canonical"] = canonical

    post = frontmatter.dumps(post)

    with src_path.open("w", encoding="utf-8") as f:
        f.write(post)


if __name__ == "__main__":
    src = Path("docs")
    src_paths = sorted(
        path for path in src.rglob("*") if path.suffix in {".md", ".mdx"}
    )
    for path in src_paths:
        print(path)
        make_canonical(path)
