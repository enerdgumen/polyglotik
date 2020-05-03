DIR=${DIR:-`dirname $0`}
if [ -e "$DIR/node/node" ]; then
  NODE_PATH="$DIR/node"
  NODE_MODULES="$DIR/node/node_modules"
elif [ -e "$DIR/node/bin/node" ]; then
  NODE_PATH="$DIR/node/bin"
  NODE_MODULES="$DIR/node/lib/node_modules"
else
  echo "Local node.js not found"
  exit 1
fi
export PATH="$NODE_PATH:$PATH"