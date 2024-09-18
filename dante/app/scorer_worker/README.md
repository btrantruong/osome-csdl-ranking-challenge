## How to run scorer_test
- Ctrl+F to change this cache dir (this line /Users/baott/Library/Caches/dante) to your system cache dir, e.g: it would be /home/<username>/.cache/dante/ on linux
- From project root: run `docker compose -f tests/docker-compose.dev.yml up`
- call `dante/app/scorer_worker/scorer_test.py`
