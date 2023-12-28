#!/bin/bash

case $1 in
    examples | examples/ )
        for fn in examples/*.js; do
            node "$fn" > "${fn/.js/.html}"
            echo "Building '$fn' for '${fn/.js/.html}'"
        done
        if [[ $USER == neruthes ]]; then
            minoss examples/*.html
        fi
        ;;
esac
