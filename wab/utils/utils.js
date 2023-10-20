function generateRandomLetters(length) {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * letters.length);
        result += letters.charAt(randomIndex);
    }
    return result;
}
//# sourceMappingURL=utils.js.map