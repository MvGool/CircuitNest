export function convertToBitwise(boolean) {
    // Replace all basic symbols with their Boolean algebra equivalents
    boolean = boolean.replaceAll("XOR", "^")
    boolean = boolean.replaceAll(String.fromCharCode(0x2295), "^")
    boolean = boolean.replaceAll("AND", "&")
    boolean = boolean.replaceAll("&&", "&")
    boolean = boolean.replaceAll(String.fromCharCode(0x22C5), "&")
    boolean = boolean.replaceAll(String.fromCharCode(0x2227), "&")
    boolean = boolean.replaceAll("OR", "|")
    boolean = boolean.replaceAll("||", "|")
    boolean = boolean.replaceAll("+", "|")
    boolean = boolean.replaceAll(String.fromCharCode(0x2228), "|")
    // Replace all mathematical negations with an exclamation mark
    boolean = boolean.replaceAll("NOT", "~")
    boolean = boolean.replaceAll("!", "~")
    boolean = boolean.replaceAll(String.fromCharCode(0x00AC), "~")
    // Replace all prime symbols with an exclamation mark before the negated part
    let notPart = boolean.search(String.fromCharCode(0x2032))
    let iter = 0
    while (notPart !== -1 && iter<100) {
        iter ++
        let startPart = -1
        if (boolean.substring(notPart-1, notPart) === ")") {
            // Find the end of the parentheses
            let substr = boolean.substring(0, notPart-1)
            let parentheses = 1
            for (let i = substr.length; i >= 0; i--) {
                if (substr[i] === "(") {
                    // Subtract 1 for open parentheses
                    parentheses--
                } else if (substr[i] === ")") {
                    // Add 1 for closed parentheses
                    parentheses++
                }
                if (parentheses === 0) {
                    // Found the end of the parentheses
                    startPart = i
                    break
                }
            }           
        } else {
            for (let i = notPart-1; i >= 0; i--) {
                if (boolean[i] === " ") {
                    startPart = i + 1
                    break
                }
            }
            if (startPart === -1) {
                startPart = 0
            }
        }
        boolean = (startPart !== 0 ? boolean.substring(0, startPart) : "")
                + "~" 
                + boolean.substring(startPart, notPart) 
                + (notPart !== boolean.length ? boolean.substring(notPart+1, boolean.length) : "")
        notPart = boolean.search(String.fromCharCode(0x2032))
    }

    // Return the converted Boolean
    return boolean
}

export function convertToBooleanAlgebra(boolean) {
    // Replace all basic symbols with their Boolean algebra equivalents
    boolean = boolean.replaceAll("&", String.fromCharCode(0x22C5))
    boolean = boolean.replaceAll("|", "+")
    boolean = boolean.replaceAll("^", String.fromCharCode(0x2295))
    // Replace all negations with the prime symbol
    let notPart = boolean.search("~")
    while (notPart !== -1) {
        let endPart = -1
        if (boolean.substring(notPart+1, notPart+2) === "(") {
            // Find the end of the parentheses
            let substr = boolean.substring(notPart+2)
            let parentheses = 1
            for (let i = 0; i < substr.length; i++) {
                if (substr[i] === "(") {
                    // Add 1 for open parentheses
                    parentheses++
                } else if (substr[i] === ")") {
                    // Subtract 1 for closed parentheses
                    parentheses--
                }
                if (parentheses === 0) {
                    // Found the end of the parentheses
                    endPart = i + 1 + notPart + 2
                    break
                }
            }           
        } else {
            endPart = boolean.substring(notPart+1).search(" ")
            if (endPart === -1) {
                endPart = boolean.length
            } else {
                endPart += notPart + 1
            }
        }
        boolean = (notPart !== 0 ? boolean.substring(0, notPart) : "")
                + boolean.substring(notPart + 1, endPart) 
                + String.fromCharCode(0x2032) 
                + (endPart !== boolean.length ? boolean.substring(endPart, boolean.length) : "")
        notPart = boolean.search("~")
    }
    // Return the converted Boolean algebra expression
    return boolean
}

export function convertToMathematicalExpression(boolean) {
        // Replace all basic symbols with their Boolean algebra equivalents
        boolean = boolean.replaceAll("&", String.fromCharCode(0x2227))
        boolean = boolean.replaceAll("|", String.fromCharCode(0x2228))
        boolean = boolean.replaceAll("^", String.fromCharCode(0x2295))
        boolean = boolean.replaceAll("~", String.fromCharCode(0x00AC))        
        // Return the converted Boolean algebra expression
        return boolean  
}

export function convertToCode(boolean) {
    // Replace all basic symbols with their Boolean algebra equivalents
    boolean = boolean.replaceAll("&", "&&")
    boolean = boolean.replaceAll("|", "||")
    boolean = boolean.replaceAll("~", "!")
    // Return the converted Boolean algebra expression
    return boolean  
}

export function convertToLiteral(boolean) {
    // Replace all basic symbols with their Boolean algebra equivalents
    boolean = boolean.replaceAll("&", "AND")
    boolean = boolean.replaceAll("|", "OR")
    boolean = boolean.replaceAll("^", "XOR")
    boolean = boolean.replaceAll("~", "NOT")
    // Return the converted Boolean algebra expression
    return boolean  
}
