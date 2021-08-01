function formatTextIcons(rawText: string) {
    return rawText
        .replace(/\[tear\]/ig, '<span class="icon tear"></span>')
}