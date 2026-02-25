import { MessageComponentTypes } from "discord-interactions";

export function parseWikiText(input, text) {
    let textInCurlyBrackets = false;
    let textInBrackets = false;
    let count = 0;
    let count2 = 0;
    let startIndex = 0;
    let endIndex = 0;
    let startIndex2 = 0;
    let endIndex2 = 0;
    let stringTemp = "";

    let componentList = [];

    for (let i = 0; i < text.length; i++) {
        if (text[i] === "[" && textInBrackets === false && textInCurlyBrackets == false) {
            textInBrackets = true;
            i += 2;
            startIndex = i;
            count += 2;
        }
        else if (text[i] === "[" && textInBrackets === true) {
            i += 2;
            count += 2;
        }
        else if (text[i] === "]" && textInBrackets === true) {
            i += 2;
            count -= 2;

            if (count <= 0) {
                textInBrackets = false;
                endIndex = i - 2;
                stringTemp += handleParsedText(componentList, text.substring(startIndex, endIndex));

                count = 0;
            }
        }

        if (text[i] === "{" && textInCurlyBrackets === false && textInBrackets === false) {
            textInCurlyBrackets = true;
            i += 2;
            startIndex2 = i;
            count2 += 2;
        }
        else if (text[i] === "{" && textInCurlyBrackets === true) {
            i += 2;
            count2 += 2;
        }
        else if (text[i] === "}" && textInCurlyBrackets === true) {
            i += 2;
            count2 -= 2;

            if (count2 <= 0) {
                textInCurlyBrackets = false;
                endIndex2 = i - 2;
                stringTemp += handleParsedText(componentList, text.substring(startIndex2, endIndex2));

                count2 = 0;
            }
        }

        if (textInBrackets === false && textInCurlyBrackets === false) {
            stringTemp += text[i];
        }
    }

    console.log("FINAL TEXT: ");
    console.log(stringTemp.trim());

    componentList.splice(0, 0,
        {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 0x00FF00,
            components: [
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `## ${input}`,
                },
                {
                    type: MessageComponentTypes.SEPARATOR,  
                },
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `${stringTemp.trim()}`,
                }
            ]
        }
    );

    return componentList;
}

function handleParsedText(componentList, text) {
    let splitText = text.split('|');

    console.log(splitText);

    if (splitText[0] === "Item\n") {
        console.log("ITEM");

        let item = parseItem(splitText);

        let components = [];

        if (item.itemClass !== "") {
            components.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Class: ${item.itemClass}`,
            });
        }

        if (item.itemRarity !== "") {
            components.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Rarity: ${item.itemRarity}`,
            });
        }

        if (item.itemDescription !== "") {
            components.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Desciption: ${item.itemDescription}`,
            });
        }

        if (item.itemTags.length > 0) {
            components.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `-# Tags: ${item.itemTags.join(", ")}`,
            });
        }

        componentList.push({
            type: MessageComponentTypes.CONTAINER,
            components: components,
        })

        return "";
    }
    else if (splitText[0] === "NPC\n") {
        return "";
    }
    else if (splitText[0].trim() === "MonsterBox") {
        return "";
    }
    else if (splitText[0].trim() === "quote") {
        return "_" + splitText.slice(1).join('|') + "_";
    }
    else if (splitText[0].trim() === "il") {
        console.log("ITEM LINK");
        console.log("**" + splitText.slice(1).join('|') + "**");

        return "**" + splitText.slice(1).join('|') + "**";
    }
    else if (splitText[0].startsWith("Passive skill box")) {
        return "";
    }
    else if (splitText[0].startsWith("#ev:")) {
        return "";
    }
    else if (splitText[0].trim() === "Item acquisition") {
        return "";
    }
    else if (splitText[0].startsWith("File:")) {
        return "";
    }
    else {
        console.log("**" + splitText.join("|") + "**");

        return "**" + splitText.join("|") + "**";
    }
}

function parseItem(splitText) {
    let itemClass = "";
    let itemRarity = "";
    let itemDescription = "";
    let itemTags = [];

    splitText.forEach((string) => {
        if (string.startsWith('class_id')) {
            let index = string.indexOf('=');
            let value = string.slice(index + 1).trim();
            console.log('class: ', value);

            itemClass = value;
        }
        else if (string.startsWith('rarity_id')) {
            let index = string.indexOf('=');
            let value = string.slice(index + 1).trim();
            console.log('rarity: ', value);

            itemRarity = value;
        }
        else if (string.startsWith('description')) {
            let index = string.indexOf('=');
            let value = string.slice(index + 1).trim();
            console.log('description: ', value);

            itemDescription = value;
        }
        else if (string.startsWith('tags')) {
            let index = string.indexOf('=');
            let value = string.slice(index + 1).trim().split(", ");
            console.log('tags: ', value);

            itemTags = itemTags.concat(value);
        }
    });

    return {
        itemClass: itemClass,
        itemRarity: itemRarity,
        itemDescription: itemDescription,
        itemTags: itemTags,
    }
}