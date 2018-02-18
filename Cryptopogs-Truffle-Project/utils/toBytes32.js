module.exports = function toBytes32(i) {
    const stringed = "0000000000000000000000000000000000000000000000000000000000000000" + i.toString(16);
    return "0x" + stringed.substring(stringed.length - 64, stringed.length); 
}