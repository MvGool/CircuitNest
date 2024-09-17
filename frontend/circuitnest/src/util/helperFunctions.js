import { createElement } from "react";
import { v4 as uuidv4 } from 'uuid';

// Format time
export const formatTime = (time) => {
    if (!(time >= 0)) return "--:--"
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

// Convert svg file to element
const innerFunction = (element, props) => {
    const tagName = element.tagName
    let _props = props || {}

    for(let i = 0; i < element.attributes?.length; i++){
      _props[element.attributes[i].nodeName] = element.attributes[i].nodeValue
    }

    let children = Array.from(element.children).map(item => innerFunction(item))

    return createElement(tagName, {..._props, key: `key-${uuidv4()}`}, children)
}

export const convertDocEleToReact = (element, props) => {
    try{
        return innerFunction(element, props)
    }
    catch(ex){
        console.error(ex)
        return createElement("span", {}, "Error loading svg image")
    }
}