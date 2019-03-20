// Transitively required by `test-plugin`, a peer-dependency
console.log('test-plugin-2/fs required from test-plugin');
module.exports = {
    read: function (filename) {
        return '[test-plugin-2 function] File contents of ' + filename + ' here....'
    }
}