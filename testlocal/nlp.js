let text = await getText('Vladamir Putin')
let arr = nlp(text).people()
return printList(arr)