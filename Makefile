.PHONY: package-all
package-all: package-create-patch

.PHONY: package-create-patch
package-create-patch:
	rm -rf ./create-patch/build ./create-patch/dist ./create-patch/node_modules
	cd ./create-patch && npm install && npm run build && npm run package

