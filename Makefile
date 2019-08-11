build:
	mkdir ./out -p && zip -r -FS ./out/avim-firefox.zip * -x *.md -x .* -x out -x Makefile
