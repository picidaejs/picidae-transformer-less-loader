/**
 * @file: Browser.js
 * @author: Cong
 * @description: Node Remark Transformer for picidae -> more pretty View
 */

//  ```less
//  some code
//  ```
//  ->  css(hide)

var visit = require('unist-util-visit')
var toString = require('mdast-util-to-string')

var less = require('less');

module.exports = function (opts) {
    var lang = opts.lang || 'less';
    var paths = opts.paths || [];
    return function search (node) {
        var promises = [Promise.resolve()];

        visit(node, 'code', function (codeNode, index, parent) {
            if (codeNode.lang === lang) {
                var lessCode = toString(codeNode);
                promises.push(
                    less.render(lessCode, {
                        paths: paths,
                        compress: true
                    })
                    .then(function (output) {
                        parent.children.splice(
                            index + 1, 0,
                            {
                                type: 'html',
                                value: '<style type="text/css">',
                            },
                            {
                                type: 'text',
                                value: output.css
                            },
                            {
                                type: 'html',
                                value: '</style>'
                            }
                        )
                    })
                    .catch(e => {
                        throw new Error('Picidae-Less-loader: ' + e.message);
                    })
                )
            }
        });

        return Promise.all(promises)
            .catch(function (ex) {
                console.error(ex);
            })
            .then(function () {
                return node;
            })
    }
}
