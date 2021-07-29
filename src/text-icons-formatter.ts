function formatTextIcons(rawText: string) {
    return rawText
        .replace(/\[resource0\]/ig, '<span class="icon charcoalium"></span>')
        .replace(/\[resource1\]/ig, '<span class="icon wood"></span>')
        .replace(/\[resource2\]/ig, '<span class="icon copper"></span>')
        .replace(/\[resource3\]/ig, '<span class="icon crystal"></span>')
        .replace(/\[resource9\]/ig, '<span class="icon joker"></span>')
}