commit: .gitignore
	@read -p "Commit message: " message; \
	echo "Committing $$message"; \
	git add . && git commit -m "$$message"

branch: .gitignore
	@read -p "Branch name: " branch; \
	echo "Creating branch $$branch"; \
	git checkout -b "$$branch"

pull: .gitignore
	@read -p "Branch name: " branch; \
	read -p "Remote: " remote; \
	echo "Pulling from $$remote $$branch"; \
	git pull $$remote $$branch

push: .gitignore
	@read -p "branch to push to: " branch; \
	echo "branch $$branch"; \
	git push origin $$branch