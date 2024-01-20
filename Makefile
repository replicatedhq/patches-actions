.PHONY: package-all
package-all: package-create-patch package-get-changed-apps

.PHONY: package-create-patch
package-create-patch:
	rm -rf ./create-patch/build ./create-patch/dist ./create-patch/node_modules
	cd ./create-patch && npm install && npm run build && npm run package

.PHONY: package-get-changed-apps
package-get-changed-apps:
	rm -rf ./get-changed-apps/build ./get-changed-apps/dist ./get-changed-apps/node_modules
	cd ./get-changed-apps && npm install && npm run build && npm run package

