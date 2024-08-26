.PHONY: build
build:
	yarn build
	mkdir langchain
	mv build langchain/v0.1
	mkdir build
	mv langchain build
	mv build/langchain/v0.1/404.html build
	cp build/404.html build/index.html
