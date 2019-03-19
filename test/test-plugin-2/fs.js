// Transitively required by `test-plugin`, a peer-dependency
console.log('test-plugin-2/fs required');
module.exports = {
    read: function (filename) {
        return 'File contents of ' + filename + ' here....'
    }
}